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
import { RefreshCw, Play, Pause, ArrowLeft, Play as PlayIcon, MessageCircle, Loader2, History, Rocket } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import ThreadHistory from '@/components/thread/history';

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
  const { workflowData, resetWorkflow, runDemo, resetForNewEpic } = useWorkflowManager();
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

  // Demo function to simulate progress events
  const simulateProgressEvents = () => {
    // Simulate progress events
    const progressEvents = [
      {
        id: 'demo-progress-1',
        type: 'ui',
        name: 'progress',
        props: {
          agent_name: 'story_writer',
          content: 'Analyzing requirements and creating user stories...',
          progress: 45
        },
        metadata: {}
      },
      {
        id: 'demo-progress-2',
        type: 'ui',
        name: 'progress',
        props: {
          agent_name: 'design_architect',
          content: 'Designing system architecture and UI components...',
          progress: 30
        },
        metadata: {}
      },
      {
        id: 'demo-progress-3',
        type: 'ui',
        name: 'progress',
        props: {
          agent_name: 'code_developer',
          content: 'Implementing core functionality and APIs...',
          progress: 60
        },
        metadata: {}
      }
    ];

    // Add events to the stream
    progressEvents.forEach((event, index) => {
      setTimeout(() => {
        stream.values.ui = [...(stream.values.ui || []), event as any];
        console.log('Added demo progress event:', event);
      }, index * 1000); // Add each event with 1 second delay
    });
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

  // Demo function to simulate deployment events
  const simulateDeploymentEvents = () => {
    console.log('Deployment demo started');
    
    // Simulate deployment events
    const deploymentEvents = [
      {
        id: 'demo-deployment-progress-1',
        type: 'ui',
        name: 'progress',
        props: {
          agent_name: 'deployment_specialist',
          content: 'Building Docker image and preparing deployment...',
          progress: 25
        },
        metadata: {}
      },
      {
        id: 'demo-deployment-progress-2',
        type: 'ui',
        name: 'progress',
        props: {
          agent_name: 'deployment_specialist',
          content: 'Deploying to staging environment for testing...',
          progress: 50
        },
        metadata: {}
      },
      {
        id: 'demo-deployment-progress-3',
        type: 'ui',
        name: 'progress',
        props: {
          agent_name: 'deployment_specialist',
          content: 'Running health checks and performance tests...',
          progress: 75
        },
        metadata: {}
      },
      {
        id: 'demo-deployment-complete',
        type: 'ui',
        name: 'content_ready',
        props: {
          agent_name: 'deployment_specialist',
          content: 'Application successfully deployed to production!',
          progress: 100,
          stage_data: {
            deploymentInfo: {
              applicationName: 'APEX Application',
              environment: 'production',
              url: 'https://apex-app.example.com',
              version: '1.2.3',
              status: 'success',
              timestamp: new Date(),
              buildNumber: '12345',
              commitHash: 'abc123def456',
              healthCheck: 'passed',
              deploymentLogs: 'Deployment completed successfully\nHealth checks passed\nPerformance tests passed\nApplication is live and ready'
            }
          }
        },
        metadata: {}
      }
    ];

    console.log('Deployment events to be added:', deploymentEvents);

    // Add events to the stream
    deploymentEvents.forEach((event, index) => {
      setTimeout(() => {
        stream.values.ui = [...(stream.values.ui || []), event as any];
        console.log('Added demo deployment event:', event);
      }, index * 1000); // Add each event with 1 second delay
    });
  };

  // Comprehensive test function to validate AI response bubbles and content windows
  const runComprehensiveTest = () => {
    console.log('=== COMPREHENSIVE TEST START ===');
    
    // Reset workflow first
    resetWorkflow();
    
    // Clear existing events
    stream.values.ui = [];
    
    // Test sequence: deployment stage only (for quick testing)
    const testEvents = [
      // Progress event to activate deployment stage
      {
        id: 'test-deployment-progress',
        type: 'ui',
        name: 'progress',
        props: {
          agent_name: 'deployment_specialist',
          content: 'Testing deployment stage activation...',
          progress: 50
        },
        metadata: {}
      },
      // Content ready event with deployment info
      {
        id: 'test-deployment-content-ready',
        type: 'ui',
        name: 'content_ready',
        props: {
          agent_name: 'deployment_specialist',
          content: 'Deployment content ready!',
          progress: 100,
          stage_data: {
            deploymentInfo: {
              applicationName: 'Test Application',
              environment: 'staging',
              url: 'https://test.example.com',
              version: '1.0.0',
              status: 'success',
              timestamp: new Date(),
              buildNumber: '99999',
              commitHash: 'test123',
              healthCheck: 'passed',
              deploymentLogs: 'Test deployment completed successfully\nAll checks passed\nReady for testing'
            }
          }
        },
        metadata: {}
      },
      // AI response event (should come AFTER content_ready)
      {
        id: 'test-deployment-ai-response',
        type: 'ui',
        name: 'ai_response',
        props: {
          agent_name: 'deployment_specialist',
          content: '✅ Deployment completed successfully! Application is live and ready.',
          progress: 100
        },
        metadata: {}
      }
    ];

    console.log('Test events to be emitted:', testEvents.map(e => ({
      name: e.name,
      agent: e.props?.agent_name,
      progress: e.props?.progress,
      hasContent: !!e.props?.content,
      hasStageData: !!e.props?.stage_data
    })));

    // Emit events with delays
    testEvents.forEach((event, index) => {
      setTimeout(() => {
        stream.values.ui = [...(stream.values.ui || []), event as any];
        console.log(`✅ Emitted test event ${index + 1}/${testEvents.length}:`, {
          name: event.name,
          agent: event.props?.agent_name,
          progress: event.props?.progress
        });
      }, index * 2000); // 2 second delays
    });
    
    console.log('=== COMPREHENSIVE TEST SETUP COMPLETE ===');
  };

  const toggleWorkflowPause = () => {
    setIsWorkflowPaused(!isWorkflowPaused);
  };

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

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
              onClick={simulateProgressEvents}
              className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 px-4 py-2 rounded-lg font-medium text-sm"
            >
              <Loader2 className="w-4 h-4 mr-2" />
              Progress Demo
            </Button>
            <Button
              onClick={simulateAiResponseEvents}
              className="bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 px-4 py-2 rounded-lg font-medium text-sm"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              AI Response Demo
            </Button>
            <Button
              onClick={simulateDeploymentEvents}
              className="bg-orange-600 hover:bg-orange-700 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 px-4 py-2 rounded-lg font-medium text-sm"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Deployment Demo
            </Button>
            <Button
              onClick={runComprehensiveTest}
              className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 px-4 py-2 rounded-lg font-medium text-sm"
            >
              <PlayIcon className="w-4 h-4 mr-2" />
              Comprehensive Test
            </Button>
            <Button
              onClick={() => setIsHistoryOpen(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-0 shadow-sm hover:shadow-md transition-all duration-200 px-3 py-2 rounded-lg font-medium text-sm"
              title="History"
            >
              <History className="w-5 h-5 mr-2" />
              History
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
          onNewEpicDetected={resetForNewEpic}
        />
      </div>

      {/* History Side Panel */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsHistoryOpen(false)} />
          {/* Side Panel */}
          <div className="relative bg-white w-full max-w-md h-full shadow-2xl border-l border-slate-200 z-50">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <span className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5" />
                History
              </span>
              <Button size="icon" variant="ghost" onClick={() => setIsHistoryOpen(false)}>
                <span className="sr-only">Close</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            <div className="h-[calc(100vh-64px)] overflow-y-auto">
              <ThreadHistory />
            </div>
          </div>
        </div>
      )}
      {/* Removed redundant bottom status bar - progress info already in header */}
    </div>
  );
} 