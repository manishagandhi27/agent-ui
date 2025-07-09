import { v4 as uuidv4 } from "uuid";
import { ReactNode, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useStreamContext } from "@/providers/Stream";
import { useState, FormEvent } from "react";
import { Button } from "../ui/button";
import { Checkpoint, Message } from "@langchain/langgraph-sdk";
import { AssistantMessage, AssistantMessageLoading } from "./messages/ai";
import { HumanMessage } from "./messages/human";
import {
  DO_NOT_RENDER_ID_PREFIX,
  ensureToolCallsHaveResponses,
} from "@/lib/ensure-tool-responses";
import { LangGraphLogoSVG } from "../icons/langgraph";
import { TooltipIconButton } from "./tooltip-icon-button";
import {
  ArrowDown,
  LoaderCircle,
  PanelRightOpen,
  PanelRightClose,
  SquarePen,
} from "lucide-react";
import { useQueryState, parseAsBoolean } from "nuqs";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";
import ThreadHistory from "./history";
import { toast } from "sonner";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useFilteredMessages } from "@/hooks/useFilteredMessages";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { GitHubSVG } from "../icons/github";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { LoadExternalComponent } from "@langchain/langgraph-sdk/react-ui";
import { ProgressBubble } from "./messages/progress-bubble";
import { AiResponseBubble } from "./messages/ai-response-bubble";

function StickyToBottomContent(props: {
  content: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  const context = useStickToBottomContext();
  return (
    <div
      ref={context.scrollRef}
      style={{ width: "100%", height: "100%" }}
      className={props.className}
    >
      <div ref={context.contentRef} className={props.contentClassName}>
        {props.content}
      </div>

      {props.footer}
    </div>
  );
}

function ScrollToBottom(props: { className?: string }) {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  if (isAtBottom) return null;
  return (
    <Button
      variant="outline"
      className={props.className}
      onClick={() => scrollToBottom()}
    >
      <ArrowDown className="w-4 h-4" />
      <span>Scroll to bottom</span>
    </Button>
  );
}

function OpenGitHubRepo() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href="https://github.com/langchain-ai/agent-chat-ui"
            target="_blank"
            className="flex items-center justify-center"
          >
            <GitHubSVG width="24" height="24" />
          </a>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Open GitHub repo</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function Thread() {
  console.log("Thread component loaded");
  
  const [threadId, setThreadId] = useQueryState("threadId");
  const [chatHistoryOpen, setChatHistoryOpen] = useQueryState(
    "chatHistoryOpen",
    parseAsBoolean.withDefault(false),
  );
  const [hideToolCalls, setHideToolCalls] = useQueryState(
    "hideToolCalls",
    parseAsBoolean.withDefault(true),
  );
  const [input, setInput] = useState("");
  const [firstTokenReceived, setFirstTokenReceived] = useState(false);
  const [progressEvents, setProgressEvents] = useState<any[]>([]);
  const [aiResponseEvents, setAiResponseEvents] = useState<any[]>([]);
  const [latestProgressEvent, setLatestProgressEvent] = useState<any | null>(null);
  const [lastAiMessageId, setLastAiMessageId] = useState<string | null>(null);
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");

  const stream = useStreamContext();
  const messages = stream.messages;
  const isLoading = stream.isLoading;
  const uiEvents = stream.values.ui ?? [];
  
  console.log("Thread state:", {
    threadId,
    messagesCount: messages.length,
    uiEventsCount: uiEvents.length,
    isLoading
  });

  const lastError = useRef<string | undefined>(undefined);

  // Track UI events (progress and ai_response)
  useEffect(() => {
    console.log("UI events changed:", uiEvents);
    
    const newProgressEvents = uiEvents.filter((ui) => ui.name === "progress");
    const newAiResponseEvents = uiEvents.filter((ui) => ui.name === "ai_response");
    
    console.log("Filtered UI events:", {
      progressEvents: newProgressEvents.length,
      aiResponseEvents: newAiResponseEvents.length
    });
    
    // Process progress events
    if (newProgressEvents.length > 0) {
      const latestProgress = newProgressEvents[newProgressEvents.length - 1];
      console.log("Setting latest progress event:", latestProgress);
      setLatestProgressEvent(latestProgress);
    }
    
    // Process AI response events
    if (newAiResponseEvents.length > 0) {
      console.log("Processing AI response events:", newAiResponseEvents);
      setAiResponseEvents(prev => {
        console.log("Previous AI response events:", prev);
        const newEvents = [...prev];
        newAiResponseEvents.forEach(event => {
          const eventId = event.id || `${event.props?.content}-${event.props?.agent_name}`;
          if (!newEvents.find(e => (e.id || `${e.props?.content}-${e.props?.agent_name}`) === eventId)) {
            newEvents.push(event);
            console.log("Added new AI response event:", event);
          } else {
            console.log("Skipped duplicate AI response event:", event);
          }
        });
        console.log("Updated AI response events:", newEvents);
        return newEvents;
      });
    }
  }, [uiEvents]);

  // Reset events when starting a new conversation
  useEffect(() => {
    if (!isLoading && (progressEvents.length > 0 || aiResponseEvents.length > 0)) {
      setProgressEvents([]);
      setAiResponseEvents([]);
      setLatestProgressEvent(null);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!stream.error) {
      lastError.current = undefined;
      return;
    }
    try {
      const message = (stream.error as any).message;
      if (!message || lastError.current === message) {
        // Message has already been logged. do not modify ref, return early.
        return;
      }

      // Message is defined, and it has not been logged yet. Save it, and send the error
      lastError.current = message;
      toast.error("An error occurred. Please try again.", {
        description: (
          <p>
            <strong>Error:</strong> <code>{message}</code>
          </p>
        ),
        richColors: true,
        closeButton: true,
      });
    } catch {
      // no-op
    }
  }, [stream.error]);

  // TODO: this should be part of the useStream hook
  const prevMessageLength = useRef(0);
  useEffect(() => {
    if (
      messages.length !== prevMessageLength.current &&
      messages?.length &&
      messages[messages.length - 1].type === "ai"
    ) {
      setFirstTokenReceived(true);
    }

    prevMessageLength.current = messages.length;
  }, [messages]);

  // Remove progress indicator when an AI message arrives
  useEffect(() => {
    const lastAiMsg = messages.slice().reverse().find(m => m.type === "ai");
    if (lastAiMsg && lastAiMsg.id !== lastAiMessageId) {
      setLastAiMessageId(lastAiMsg.id ?? null);
      setLatestProgressEvent(null);
    }
  }, [messages, lastAiMessageId]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    setFirstTokenReceived(false);
    setLatestProgressEvent(null);
    setLastAiMessageId(null);
    setProgressEvents([]); // Clear progress events for new conversation
    setAiResponseEvents([]); // Clear AI response events

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

  const handleRegenerate = (
    parentCheckpoint: Checkpoint | null | undefined,
  ) => {
    // Do this so the loading state is correct
    prevMessageLength.current = prevMessageLength.current - 1;
    setFirstTokenReceived(false);
    setLatestProgressEvent(null);
    setLastAiMessageId(null);
    setProgressEvents([]); // Clear progress events for regeneration
    setAiResponseEvents([]); // Clear AI response events
    stream.submit(undefined, {
      checkpoint: parentCheckpoint,
      streamMode: ["values"],
    });
  };

  const chatStarted = !!threadId || !!messages.length;
  const hasNoAIOrToolMessages = !messages.find(
    (m) => m.type === "ai" || m.type === "tool",
  );

  // Use centralized message filtering hook
  const filteredMessages = useFilteredMessages(messages);

  // Find the last AI or tool message
  const lastAiOrToolMsg = [...messages].reverse().find(
    (m) => m.type === "ai" || m.type === "tool"
  );

  // Show progress events if we have them
  const showProgressEvents = latestProgressEvent !== null;

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <div className="relative lg:flex hidden">
        <motion.div
          className="absolute h-full border-r bg-white overflow-hidden z-20"
          style={{ width: 300 }}
          animate={
            isLargeScreen
              ? { x: chatHistoryOpen ? 0 : -300 }
              : { x: chatHistoryOpen ? 0 : -300 }
          }
          initial={{ x: -300 }}
          transition={
            isLargeScreen
              ? { type: "spring", stiffness: 300, damping: 30 }
              : { duration: 0 }
          }
        >
          <div className="relative h-full" style={{ width: 300 }}>
            <ThreadHistory />
          </div>
        </motion.div>
      </div>
      <motion.div
        className={cn(
          "flex-1 flex flex-col min-w-0 overflow-hidden relative",
          !chatStarted && "grid-rows-[1fr]",
        )}
        layout={isLargeScreen}
        animate={{
          marginLeft: chatHistoryOpen ? (isLargeScreen ? 300 : 0) : 0,
          width: chatHistoryOpen
            ? isLargeScreen
              ? "calc(100% - 300px)"
              : "100%"
            : "100%",
        }}
        transition={
          isLargeScreen
            ? { type: "spring", stiffness: 300, damping: 30 }
            : { duration: 0 }
        }
      >
        {!chatStarted && (
          <div className="absolute top-0 left-0 w-full flex items-center justify-between gap-3 p-2 pl-4 z-10">
            <div>
              {(!chatHistoryOpen || !isLargeScreen) && (
                <Button
                  className="hover:bg-gray-100"
                  variant="ghost"
                  onClick={() => setChatHistoryOpen((p) => !p)}
                >
                  {chatHistoryOpen ? (
                    <PanelRightOpen className="size-5" />
                  ) : (
                    <PanelRightClose className="size-5" />
                  )}
                </Button>
              )}
            </div>
            <div className="absolute top-2 right-4 flex items-center">
              {/* GitHub icon hidden */}
              {/* <OpenGitHubRepo /> */}
            </div>
          </div>
        )}
        {chatStarted && (
          <div className="flex items-center justify-between gap-3 p-2 z-10 relative">
            <div className="flex items-center justify-start gap-2 relative">
              <div className="absolute left-0 z-10">
                {(!chatHistoryOpen || !isLargeScreen) && (
                  <Button
                    className="hover:bg-gray-100"
                    variant="ghost"
                    onClick={() => setChatHistoryOpen((p) => !p)}
                  >
                    {chatHistoryOpen ? (
                      <PanelRightOpen className="size-5" />
                    ) : (
                      <PanelRightClose className="size-5" />
                    )}
                  </Button>
                )}
              </div>
              <motion.button
                className="flex gap-2 items-center cursor-pointer"
                onClick={() => setThreadId(null)}
                animate={{
                  marginLeft: !chatHistoryOpen ? 48 : 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              >
                {/* LangGraph logo hidden */}
                {/* <LangGraphLogoSVG width={32} height={32} /> */}
                {/* Agent Chat heading hidden */}
                {/* <span className="text-xl font-semibold tracking-tight">
                  Agent Chat
                </span> */}
              </motion.button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center">
                {/* GitHub icon hidden */}
                {/* <OpenGitHubRepo /> */}
              </div>
              <TooltipIconButton
                size="lg"
                className="p-4"
                tooltip="New thread"
                variant="ghost"
                onClick={() => setThreadId(null)}
              >
                <SquarePen className="size-5" />
              </TooltipIconButton>
            </div>

            <div className="absolute inset-x-0 top-full h-5 bg-gradient-to-b from-background to-background/0" />
          </div>
        )}

        <StickToBottom className="relative flex-1 overflow-hidden">
          <StickyToBottomContent
            className={cn(
              "absolute px-4 inset-0 overflow-y-scroll [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent",
              !chatStarted && "flex flex-col items-stretch mt-[25vh]",
              chatStarted && "grid grid-rows-[1fr_auto]",
            )}
            contentClassName="pt-8 pb-16  max-w-3xl mx-auto flex flex-col gap-4 w-full"
            content={
              <>
                {/* Render regular chat messages */}
                {filteredMessages.map((message, index) => {
                  if (message.type === "human") {
                    return <HumanMessage key={message.id || index} message={message} isLoading={isLoading} />;
                  }
                  return null;
                })}
                
                {/* Render AI response bubbles from UI events */}
                {aiResponseEvents.map((event, index) => {
                  console.log("Rendering AI response bubble:", event);
                  return (
                    <AiResponseBubble 
                      key={event.id || `ai-response-${index}`} 
                      content={event.props?.content} 
                    />
                  );
                })}
                
                {/* Render progress bubble from UI events (only if no AI response events exist) */}
                {latestProgressEvent && aiResponseEvents.length === 0 && (
                  <ProgressBubble
                    key={latestProgressEvent.id || latestProgressEvent.props?.content}
                    agentName={latestProgressEvent.props?.agent_name}
                    content={latestProgressEvent.props?.content}
                  />
                )}
                
                {/* Debug info */}
                {console.log("Rendering debug:", {
                  aiResponseEventsCount: aiResponseEvents.length,
                  latestProgressEvent: !!latestProgressEvent,
                  showProgressBubble: !!(latestProgressEvent && aiResponseEvents.length === 0)
                })}
                
                {/* Special rendering case where there are no AI/tool messages, but there is an interrupt */}
                {hasNoAIOrToolMessages && !!stream.interrupt && (
                  <AssistantMessage
                    key="interrupt-msg"
                    message={undefined}
                    isLoading={isLoading}
                    handleRegenerate={handleRegenerate}
                  />
                )}
              </>
            }
            footer={
              <div className="sticky flex flex-col items-center gap-8 bottom-0 bg-white">
                {!chatStarted && (
                  <div className="flex gap-3 items-center">
                    {/* LangGraph logo hidden */}
                    {/* <LangGraphLogoSVG className="flex-shrink-0 h-8" /> */}
                    {/* Agent Chat heading hidden */}
                    {/* <h1 className="text-2xl font-semibold tracking-tight">
                      Agent Chat
                    </h1> */}
                  </div>
                )}

                <ScrollToBottom className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 animate-in fade-in-0 zoom-in-95" />

                <div className="bg-muted rounded-2xl border shadow-xs mx-auto mb-8 w-full max-w-3xl relative z-10">
                  <form
                    onSubmit={handleSubmit}
                    className="grid grid-rows-[1fr_auto] gap-2 max-w-3xl mx-auto"
                  >
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
                          const el = e.target as HTMLElement | undefined;
                          const form = el?.closest("form");
                          form?.requestSubmit();
                        }
                      }}
                      placeholder="Type your message..."
                      className="p-3.5 pb-0 border-none bg-transparent field-sizing-content shadow-none ring-0 outline-none focus:outline-none focus:ring-0 resize-none"
                    />

                    <div className="flex items-center justify-between p-2 pt-4">
                      <div>
                        {/* Hide Tool Calls slider - commented out to prevent user from seeing tool messages */}
                        {/* <div className="flex items-center space-x-2">
                          <Switch
                            id="render-tool-calls"
                            checked={hideToolCalls ?? false}
                            onCheckedChange={setHideToolCalls}
                          />
                          <Label
                            htmlFor="render-tool-calls"
                            className="text-sm text-gray-600"
                          >
                            Hide Tool Calls
                          </Label>
                        </div> */}
                      </div>
                      {stream.isLoading ? (
                        <Button key="stop" onClick={() => stream.stop()}>
                          <LoaderCircle className="w-4 h-4 animate-spin" />
                          Cancel
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          className="transition-all shadow-md"
                          disabled={isLoading || !input.trim()}
                        >
                          Send
                        </Button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            }
          />
        </StickToBottom>
      </motion.div>
    </div>
  );
}
