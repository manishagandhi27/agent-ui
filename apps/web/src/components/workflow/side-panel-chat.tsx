import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from "uuid";
import { cn } from '@/lib/utils';
import { useStreamContext } from '@/providers/Stream';
import { Button } from '../ui/button';
import { Checkpoint, Message } from "@langchain/langgraph-sdk";
import { AssistantMessage } from '../thread/messages/ai';
import { HumanMessage } from '../thread/messages/human';
import { ProgressBubble } from '../thread/messages/progress-bubble';
import { LoaderCircle, Send } from 'lucide-react';
import {
  DO_NOT_RENDER_ID_PREFIX,
  ensureToolCallsHaveResponses,
} from '@/lib/ensure-tool-responses';

interface SidePanelChatProps {
  className?: string;
}

export function SidePanelChat({ className }: SidePanelChatProps) {
  const [input, setInput] = useState("");
  const [latestProgressEvent, setLatestProgressEvent] = useState<any | null>(null);
  const [lastAiMessageId, setLastAiMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const stream = useStreamContext();
  const messages = stream.messages;
  const isLoading = stream.isLoading;
  const uiEvents = stream.values.ui ?? [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show only the latest progress event
  useEffect(() => {
    const progressEvents = uiEvents.filter((ui) => ui.name === "progress");
    if (progressEvents.length > 0) {
      setLatestProgressEvent(progressEvents[progressEvents.length - 1]);
    }
  }, [uiEvents]);

  // Remove progress indicator when an AI message arrives
  useEffect(() => {
    const lastAiMsg = messages.slice().reverse().find(m => m.type === "ai");
    if (lastAiMsg && lastAiMsg.id !== lastAiMessageId) {
      setLastAiMessageId(lastAiMsg.id ?? null);
      setLatestProgressEvent(null);
    }
  }, [messages, lastAiMessageId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    setLatestProgressEvent(null);
    setLastAiMessageId(null);

    const newHumanMessage: Message = {
      id: uuidv4(),
      type: "human",
      content: input,
    };

    const toolMessages = ensureToolCallsHaveResponses(stream.messages);
    stream.submit(
      { messages: [...toolMessages, newHumanMessage] },
      {
        streamMode: ["values"],
        optimisticValues: (prev) => ({
          ...prev,
          messages: [
            ...(prev.messages ?? []),
            ...toolMessages,
            newHumanMessage,
          ],
        }),
      },
    );

    setInput("");
  };

  const handleRegenerate = (parentCheckpoint: Checkpoint | null | undefined) => {
    setLatestProgressEvent(null);
    setLastAiMessageId(null);
    stream.submit(undefined, {
      checkpoint: parentCheckpoint,
      streamMode: ["values"],
    });
  };

  // Filter out duplicate message content
  const deduplicatedMessages = messages.filter((message, index, array) => {
    if (message.type === "human") return true;
    
    const content = typeof message.content === "string" ? message.content : "";
    const previousMessageWithSameContent = array
      .slice(0, index)
      .find(m => typeof m.content === "string" && m.content === content);
    
    return !previousMessageWithSameContent;
  });

  return (
    <div className={cn("flex flex-col h-full bg-white", className)}>
      {/* Messages Area - Reduced height to prevent hiding reset button */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {/* Welcome Message - Show when no messages exist */}
        {deduplicatedMessages.length === 0 && !isLoading && (
          <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200/50">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-sm text-white">🔧</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-slate-900 mb-2">Welcome to Forge Genie</div>
              <div className="text-slate-700 text-sm leading-relaxed">
                I'm here to help you execute your SDLC workflow. To get started, please provide the <strong>EPIC ID</strong> for the project you'd like to work on.
              </div>
              <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200">
                <div className="text-xs text-slate-600 mb-2">Example format:</div>
                <div className="font-mono text-sm text-slate-800 bg-slate-50 px-2 py-1 rounded">
                  INSPAI-444
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-500">
                Simply type the EPIC ID below and I'll initiate the complete workflow for you.
              </div>
            </div>
          </div>
        )}

        {deduplicatedMessages
          .filter((m) => !m.id?.startsWith(DO_NOT_RENDER_ID_PREFIX))
          .map((message, index) =>
            message.type === "human" ? (
              <HumanMessage
                key={message.id || `${message.type}-${index}`}
                message={message}
                isLoading={isLoading}
              />
            ) : (
              <AssistantMessage
                key={message.id || `${message.type}-${index}`}
                message={message}
                isLoading={isLoading}
                handleRegenerate={handleRegenerate}
              />
            ),
          )}
        
        {/* Progress Bubble */}
        {latestProgressEvent && (
          <ProgressBubble
            key={latestProgressEvent.id || latestProgressEvent.props?.content}
            agentName={latestProgressEvent.props?.agent_name}
            content={latestProgressEvent.props?.content}
          />
        )}
        
        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Professional Input Area - Fixed at bottom */}
      <div className="border-t border-gray-200 bg-gray-50 p-4 flex-shrink-0">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !e.metaKey &&
                  !e.nativeEvent.isComposing
                ) {
                  e.preventDefault();
                  const target = e.target as HTMLElement;
                  const form = target.closest('form');
                  form?.requestSubmit();
                }
              }}
              placeholder="Enter EPIC ID (e.g., INSPAI-444)..."
              className="w-full p-3 pr-12 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-sm bg-white"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-slate-900 hover:bg-slate-800 border-0"
            >
              {isLoading ? (
                <LoaderCircle className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Send className="w-4 h-4 text-white" />
              )}
            </Button>
          </div>
          
          {isLoading && (
            <div className="flex items-center justify-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => stream.stop()}
                className="text-sm"
              >
                <LoaderCircle className="w-4 h-4 animate-spin mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
} 