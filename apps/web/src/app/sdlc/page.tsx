"use client";

import React, { useState } from 'react';
import { WorkflowVisualization } from '@/components/workflow/workflow-visualization';
import { CollapsibleChat } from '@/components/workflow/collapsible-chat';
import { useWorkflowManager } from '@/hooks/useWorkflowManager';
import { useStreamContext } from '@/providers/Stream';
import { StreamProvider } from '@/providers/Stream';
import { ThreadProvider } from '@/providers/Thread';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { RefreshCw, Play, Pause, ArrowLeft, Play as PlayIcon, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function SDLCPage(): React.ReactNode {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isWorkflowPaused, setIsWorkflowPaused] = useState(false);

  return (
    <React.Suspense fallback={<div>Loading SDLC Workflow...</div>}>
      <Toaster />
      <ThreadProvider>
        <StreamProvider>
          <SDLCLayout 
            isChatOpen={isChatOpen}
            setIsChatOpen={setIsChatOpen}
            isWorkflowPaused={isWorkflowPaused}
            setIsWorkflowPaused={setIsWorkflowPaused}
          />
        </StreamProvider>
      </ThreadProvider>
    </React.Suspense>
  );
}

interface SDLCLayoutProps {
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  isWorkflowPaused: boolean;
  setIsWorkflowPaused: (paused: boolean) => void;
}

function SDLCLayout({ 
  isChatOpen, 
  setIsChatOpen, 
  isWorkflowPaused, 
  setIsWorkflowPaused 
}: SDLCLayoutProps) {
  const { workflowData, resetWorkflow, runDemo } = useWorkflowManager();
  const stream = useStreamContext();

  // Debug: Log workflow data
  console.log('Workflow Data:', workflowData);

  const handleStageClick = (stageId: string) => {
    console.log('Stage clicked:', stageId);
    // You can add additional logic here, like showing detailed stage information
  };

  const handleResetWorkflow = () => {
    resetWorkflow();
  };

  // Demo function to simulate workflow progression (for testing)
  const simulateWorkflowProgress = () => {
    runDemo();
  };

  // Demo function to simulate AI response events
  const simulateAiResponseEvents = () => {
    // Simulate AI response events
    const aiResponseEvents = [
      {
        id: 'demo-ai-response-1',
        type: 'ui',
        name: 'ai_response',
        props: {
          agent_name: 'story_writer',
          content: 'User stories created successfully!',
          progress: 100
        },
        metadata: {}
      },
      {
        id: 'demo-ai-response-2',
        type: 'ui',
        name: 'ai_response',
        props: {
          agent_name: 'design_architect',
          content: 'Design architecture completed',
          progress: 100
        },
        metadata: {}
      },
      {
        id: 'demo-ai-response-3',
        type: 'ui',
        name: 'ai_response',
        props: {
          agent_name: 'code_developer',
          content: 'Code implementation finished',
          progress: 100
        },
        metadata: {}
      }
    ];

    // Add events to the stream
    aiResponseEvents.forEach((event, index) => {
      setTimeout(() => {
        stream.values.ui = [...(stream.values.ui || []), event as any];
        console.log('Added demo AI response event:', event);
      }, index * 1000); // Add each event with 1 second delay
    });
  };

  const toggleWorkflowPause = () => {
    setIsWorkflowPaused(!isWorkflowPaused);
  };

    return (
    <div className="h-screen w-full bg-slate-50 overflow-hidden">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  APEX
                </h1>
                <p className="text-slate-500 text-sm font-medium">Development Workflow</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={simulateWorkflowProgress}
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 px-4 py-2 rounded-lg font-medium text-sm"
            >
              <PlayIcon className="w-4 h-4 mr-2" />
              Workflow Demo
            </Button>
            <Button
              onClick={simulateAiResponseEvents}
              className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 px-4 py-2 rounded-lg font-medium text-sm"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              AI Response Demo
            </Button>
            <Button
              onClick={handleResetWorkflow}
              className="bg-slate-900 hover:bg-slate-800 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 px-4 py-2 rounded-lg font-medium text-sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Modern Design */}
      <div className="h-[calc(100vh-72px)] relative p-6">
        {/* Workflow Visualization */}
        <div className="w-full h-full bg-white/60 backdrop-blur-xl rounded-3xl border border-slate-200/40 shadow-xl overflow-hidden">
          <WorkflowVisualization
            workflowData={workflowData}
            onStageClick={handleStageClick}
            className="h-full"
            isChatOpen={isChatOpen}
          />
        </div>

        {/* Collapsible Chat - Fixed position overlay */}
        <CollapsibleChat
          isOpen={isChatOpen}
          onToggle={() => setIsChatOpen(!isChatOpen)}
        />
      </div>

      {/* Removed redundant bottom status bar - progress info already in header */}
    </div>
  );
} 