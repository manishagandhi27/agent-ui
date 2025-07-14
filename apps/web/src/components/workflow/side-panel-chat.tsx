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
  onNewEpicDetected?: (epicId: string) => void; // Callback to reset workflow with Epic ID
}

// Utility function to detect Epic/Issue IDs
const detectEpicIssueId = (text: string): string | null => {
  // Common patterns for Epic/Issue IDs
  const patterns = [
    /(?:epic|issue|story|task)\s*[#:]?\s*([A-Z]+-\d+)/i, // JIRA: EPIC-123, ISSUE-456
    /(?:epic|issue|story|task)\s*[#:]?\s*([A-Z]{2,}-\d+)/i, // Custom: APEX-123, PROJ-456
    /([A-Z]+-\d+)/, // Any uppercase letters followed by dash and numbers
    /([A-Z]{2,}-\d+)/, // At least 2 uppercase letters followed by dash and numbers
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
};

export function SidePanelChat({ className, onNewEpicDetected }: SidePanelChatProps) {
  const [input, setInput] = useState("");
  const [latestProgressEvent, setLatestProgressEvent] = useState<any | null>(null);
  const [aiResponseEvents, setAiResponseEvents] = useState<any[]>([]);
  const [lastAiMessageId, setLastAiMessageId] = useState<string | null>(null);
  const [lastEpicId, setLastEpicId] = useState<string | null>(null);
  const [showEpicResetNotification, setShowEpicResetNotification] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const stream = useStreamContext();
  const messages = stream.messages;
  const isLoading = stream.isLoading;
  const uiEvents = stream.values.ui ?? [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Track UI events (progress and ai_response) with bulletproof logic
  useEffect(() => {
    console.log("=== SIDE PANEL CHAT: UI EVENTS PROCESSING START ===");
    console.log("Total UI events:", uiEvents.length);
    console.log("Current AI response events count:", aiResponseEvents.length);
    
    const newProgressEvents = uiEvents.filter((ui) => ui.name === "progress");
    const newAiResponseEvents = uiEvents.filter((ui) => ui.name === "ai_response");
    
    console.log("Filtered events:", {
      progressEvents: newProgressEvents.length,
      aiResponseEvents: newAiResponseEvents.length
    });
    
    // Process progress events with error handling
    if (newProgressEvents.length > 0) {
      const latestProgress = newProgressEvents[newProgressEvents.length - 1];
      console.log("Setting latest progress event:", {
        id: latestProgress.id,
        agent: latestProgress.props?.agent_name,
        content: typeof latestProgress.props?.content === 'string' ? latestProgress.props.content.substring(0, 50) + '...' : latestProgress.props?.content,
        progress: latestProgress.props?.progress
      });
      setLatestProgressEvent(latestProgress);
    }
    
    // Bulletproof AI response event processing
    setAiResponseEvents(prev => {
      const existingIds = new Set(prev.map(e => e.id || `${e.props?.content}-${e.props?.agent_name}`));
      const newEvents = [...prev];
      uiEvents
        .filter(e => e.name === 'ai_response')
        .forEach(event => {
          const eventId = event.id || `${event.props?.content}-${event.props?.agent_name}`;
          if (!existingIds.has(eventId)) {
            newEvents.push(event);
            existingIds.add(eventId);
          }
        });
      return newEvents;
    });
    
    console.log("=== SIDE PANEL CHAT: UI EVENTS PROCESSING COMPLETE ===");
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

    // Detect Epic/Issue ID in the input
    const detectedEpicId = detectEpicIssueId(input);
    
    if (detectedEpicId && detectedEpicId !== lastEpicId) {
      console.log('New Epic/Issue ID detected:', detectedEpicId, 'Previous:', lastEpicId);
      
      // Reset workflow for new Epic
      if (onNewEpicDetected) {
        onNewEpicDetected(detectedEpicId);
      }
      
      // Update last Epic ID
      setLastEpicId(detectedEpicId);
      
      // Clear previous progress and AI response events for clean slate
      setLatestProgressEvent(null);
      setAiResponseEvents([]);
      
      // Show notification
      setShowEpicResetNotification(true);
      setTimeout(() => setShowEpicResetNotification(false), 3000); // Hide after 3 seconds
    }

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

  // Helper function to check if we should show progress bubble for a specific agent
  const shouldShowProgressForAgent = (agentName: string) => {
    // Check if there's an AI response event for the same agent
    const hasAiResponseForAgent = aiResponseEvents.some(
      event => event.props?.agent_name === agentName
    );
    return !hasAiResponseForAgent;
  };

  return (
    <div className={cn("flex flex-col h-full bg-white", className)}>
      {/* Epic Reset Notification */}
      {showEpicResetNotification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-200 p-3 flex items-center gap-2"
        >
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-emerald-800">
            New Epic detected! Workflow pipeline reset for fresh start.
          </span>
        </motion.div>
      )}
      
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
        
        {/* Render AI response bubbles from UI events with bulletproof logic */}
        {aiResponseEvents.map((event, index) => {
          console.log(`Rendering AI response bubble ${index + 1}/${aiResponseEvents.length}:`, {
            id: event.id,
            agent: event.props?.agent_name,
            content: typeof event.props?.content === 'string' ? event.props.content.substring(0, 30) + '...' : 'No content',
            progress: event.props?.progress
          });
          
          if (!event.props?.content) {
            console.warn(`⚠️ AI response event missing content:`, event);
            return null;
          }
          
          return (
            <AiResponseBubble 
              key={event.id || `ai-response-${index}`} 
              content={event.props.content} 
            />
          );
        })}
        
        {/* Render progress bubble only if no AI response exists for the same agent */}
        {latestProgressEvent && shouldShowProgressForAgent(latestProgressEvent.props?.agent_name) && (
          <ProgressBubble
            key={latestProgressEvent.id || latestProgressEvent.props?.content}
            agentName={latestProgressEvent.props?.agent_name}
            content={latestProgressEvent.props?.content}
          />
        )}
        
        {/* Debug info */}
        {console.log("=== SIDE PANEL CHAT RENDERING DEBUG ===", {
          aiResponseEventsCount: aiResponseEvents.length,
          latestProgressEvent: !!latestProgressEvent,
          progressAgentName: latestProgressEvent?.props?.agent_name,
          shouldShowProgress: latestProgressEvent ? shouldShowProgressForAgent(latestProgressEvent.props?.agent_name) : false,
          messagesCount: filteredMessages.length
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