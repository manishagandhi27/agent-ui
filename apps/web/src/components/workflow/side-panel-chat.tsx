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
import { AiResponseBubble } from '../thread/messages/ai-response-bubble';
import { LoaderCircle, Send } from 'lucide-react';
import { useFilteredMessages } from '@/hooks/useFilteredMessages';
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
  const [aiResponseEvents, setAiResponseEvents] = useState<any[]>([]);
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

  // Track UI events (progress and ai_response)
  useEffect(() => {
    console.log("SidePanelChat: UI events changed:", uiEvents);
    
    const newProgressEvents = uiEvents.filter((ui) => ui.name === "progress");
    const newAiResponseEvents = uiEvents.filter((ui) => ui.name === "ai_response");
    
    console.log("SidePanelChat: Filtered UI events:", {
      progressEvents: newProgressEvents.length,
      aiResponseEvents: newAiResponseEvents.length
    });
    
    // Process progress events
    if (newProgressEvents.length > 0) {
      const latestProgress = newProgressEvents[newProgressEvents.length - 1];
      console.log("SidePanelChat: Setting latest progress event:", latestProgress);
      setLatestProgressEvent(latestProgress);
    }
    
    // Process AI response events
    if (newAiResponseEvents.length > 0) {
      console.log("SidePanelChat: Processing AI response events:", newAiResponseEvents);
      setAiResponseEvents(prev => {
        console.log("SidePanelChat: Previous AI response events:", prev);
        const newEvents = [...prev];
        newAiResponseEvents.forEach(event => {
          const eventId = event.id || `${event.props?.content}-${event.props?.agent_name}`;
          if (!newEvents.find(e => (e.id || `${e.props?.content}-${e.props?.agent_name}`) === eventId)) {
            newEvents.push(event);
            console.log("SidePanelChat: Added new AI response event:", event);
          } else {
            console.log("SidePanelChat: Skipped duplicate AI response event:", event);
          }
        });
        console.log("SidePanelChat: Updated AI response events:", newEvents);
        return newEvents;
      });
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

  // Use centralized message filtering hook
  const filteredMessages = useFilteredMessages(messages);

  return (
    <div className={cn("flex flex-col h-full bg-white", className)}>
      {/* Messages Area - Reduced height to prevent hiding reset button */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {filteredMessages.map((message, index) =>
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
        
        {/* Render AI response bubbles from UI events */}
        {aiResponseEvents.map((event, index) => {
          console.log("SidePanelChat: Rendering AI response bubble:", event);
          return (
            <AiResponseBubble 
              key={event.id || `ai-response-${index}`} 
              content={event.props?.content} 
            />
          );
        })}
        
        {/* Render progress bubble from UI events (show when no AI response events OR when progress is active) */}
        {latestProgressEvent && (
          <ProgressBubble
            key={latestProgressEvent.id || latestProgressEvent.props?.content}
            agentName={latestProgressEvent.props?.agent_name}
            content={latestProgressEvent.props?.content}
          />
        )}
        
        {/* Debug info */}
        {console.log("SidePanelChat: Rendering debug:", {
          aiResponseEventsCount: aiResponseEvents.length,
          latestProgressEvent: !!latestProgressEvent,
          showProgressBubble: !!(latestProgressEvent && aiResponseEvents.length === 0)
        })}
        
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
              placeholder="Type your message..."
              className="w-full p-3 pr-12 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 border-0"
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