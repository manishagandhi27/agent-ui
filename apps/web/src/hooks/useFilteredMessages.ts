import { useMemo } from 'react';
import { Message } from '@langchain/langgraph-sdk';
import { DO_NOT_RENDER_ID_PREFIX } from '@/lib/ensure-tool-responses';

/**
 * Custom hook that filters messages based on various criteria
 * Centralizes all filtering logic to avoid duplication across components
 */
export function useFilteredMessages(messages: Message[]) {
  return useMemo(() => {
    // Filter out duplicate message content to prevent showing the same response multiple times
    const deduplicatedMessages = messages.filter((message, index, array) => {
      // Always show human messages
      if (message.type === "human") return true;
      
      // For AI and tool messages, check if we've seen this content before
      const content = typeof message.content === "string" ? message.content : "";
      const previousMessageWithSameContent = array
        .slice(0, index)
        .find(m => typeof m.content === "string" && m.content === content);
      
      // Only show if we haven't seen this content before
      return !previousMessageWithSameContent;
    });

    // Apply additional filters
    const filteredMessages = deduplicatedMessages.filter((message) => {
      // Filter out messages with DO_NOT_RENDER_ID_PREFIX in ID
      if (message.id?.startsWith(DO_NOT_RENDER_ID_PREFIX)) {
        console.log("Filtered out: DO_NOT_RENDER_ID_PREFIX", message.id);
        return false;
      }
      
      // Filter out human messages with do_not_render in additional_kwargs
      if (message.type === "human" && (message as any).additional_kwargs?.do_not_render) {
        console.log("Filtered out: do_not_render flag", message.id, (message as any).additional_kwargs);
        return false;
      }
      
      return true;
    });

    return filteredMessages;
  }, [messages]);
} 