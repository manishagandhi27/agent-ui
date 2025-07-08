import { useState, useEffect, useCallback } from 'react';
import { WorkflowData, WorkflowStage, Story, CodeFile, TestCase } from '@/components/workflow/workflow-visualization';
import { useStreamContext } from '@/providers/Stream';
import { simulateWorkflowEvents } from '@/lib/demo-simulation';

const INITIAL_STAGES: WorkflowStage[] = [
  {
    id: 'story_generation',
    name: 'Analyze',
    description: 'Requirements analysis & user stories',
    status: 'pending',
    agentName: 'Story Writer'
  },
  {
    id: 'design_generation',
    name: 'Design',
    description: 'UI/UX design & architecture',
    status: 'pending',
    agentName: 'Design Architect'
  },
  {
    id: 'code_generation',
    name: 'Code',
    description: 'Code implementation & development',
    status: 'pending',
    agentName: 'Code Developer'
  },
  {
    id: 'testing',
    name: 'Test',
    description: 'Quality assurance & testing',
    status: 'pending',
    agentName: 'Test Engineer'
  },
  {
    id: 'deployment',
    name: 'Deploy',
    description: 'Production deployment & launch',
    status: 'pending',
    agentName: 'Deployment Manager'
  }
];

// Enhanced event types for structured content
interface ContentEvent {
  type: 'ui';
  name: 'progress' | 'content_ready' | 'ai_response';
  props: {
    agent_name: string;
    content?: string;
    progress?: number;
    stage_data?: {
      stories?: Story[];
      designContent?: string;
      codeFiles?: CodeFile[];
      testCases?: TestCase[];
    };
    message?: string;
  };
}

export function useWorkflowManager() {
  const [workflowData, setWorkflowData] = useState<WorkflowData>({
    stages: INITIAL_STAGES,
    currentStage: '',
    overallProgress: 0
  });

  // Debug: Log initial workflow data
  console.log('Initial Workflow Data:', workflowData);

  const stream = useStreamContext();
  const uiEvents = stream.values.ui ?? [];

  // Map agent names to stage IDs
  const agentToStageMap: Record<string, string> = {
    'story_writer': 'story_generation',
    'design_architect': 'design_generation',
    'code_developer': 'code_generation',
    'test_engineer': 'testing',
    'deployment_manager': 'deployment',
    'supervisor': 'story_generation' // Default fallback
  };

  // Enhanced event processing for real-time updates
  useEffect(() => {
    const progressEvents = uiEvents.filter((ui) => ui.name === "progress");
    const contentEvents = uiEvents.filter((ui) => ui.name === "content_ready");
    const aiResponseEvents = uiEvents.filter((ui) => ui.name === "ai_response");
    
    // Process all relevant events
    const allEvents = [...progressEvents, ...contentEvents, ...aiResponseEvents];
    
    if (allEvents.length === 0) return;

    const latestEvent = allEvents[allEvents.length - 1];
    const agentName = latestEvent.props?.agent_name as string;
    const content = latestEvent.props?.content as string;
    const progress = latestEvent.props?.progress as number;
    const stageData = latestEvent.props?.stage_data as ContentEvent['props']['stage_data'];
    
    if (!agentName) return;

    // Find the stage this agent corresponds to
    const stageId = agentToStageMap[agentName.toLowerCase()] || 'story_generation';
    
    setWorkflowData(prev => {
      const updatedStages = prev.stages.map(stage => {
        if (stage.id === stageId) {
          // Enhanced stage update with structured content
          const updatedStage = {
            ...stage,
            status: 'active' as const,
            agentName: agentName,
            startTime: stage.startTime || new Date(),
            progress: progress || stage.progress || 0
          };

          // Handle different event types
          switch (latestEvent.name) {
            case 'progress':
              // Update progress and basic content
              return {
                ...updatedStage,
                content: content || stage.content
              };
            
            case 'content_ready':
              // Update with structured content data
              return {
                ...updatedStage,
                content: content || stage.content,
                stories: stageData?.stories || stage.stories,
                designContent: stageData?.designContent || stage.designContent,
                codeFiles: stageData?.codeFiles || stage.codeFiles,
                testCases: stageData?.testCases || stage.testCases
              };
            
            case 'ai_response':
              // Update with AI response content
              return {
                ...updatedStage,
                content: content || stage.content,
                status: progress >= 100 ? 'completed' as const : 'active' as const,
                endTime: progress >= 100 ? new Date() : stage.endTime
              };
            
            default:
              return updatedStage;
          }
        } else if (stage.status === 'active' && stage.id !== stageId) {
          // Mark other active stages as completed when new stage starts
          return {
            ...stage,
            status: 'completed' as const,
            endTime: new Date(),
            progress: 100
          };
        }
        return stage;
      });

      // Calculate overall progress
      const completedStages = updatedStages.filter(s => s.status === 'completed').length;
      const activeStages = updatedStages.filter(s => s.status === 'active');
      const activeProgress = activeStages.length > 0 
        ? activeStages.reduce((sum, stage) => sum + (stage.progress || 0), 0) / activeStages.length 
        : 0;
      const totalStages = updatedStages.length;
      const overallProgress = Math.round(((completedStages + (activeStages.length * (activeProgress / 100))) / totalStages) * 100) || 0;

      return {
        stages: updatedStages,
        currentStage: stageId,
        overallProgress
      };
    });
  }, [uiEvents]);

  // Reset workflow when starting new conversation
  useEffect(() => {
    if (!stream.isLoading && workflowData.overallProgress > 0) {
      setWorkflowData({
        stages: INITIAL_STAGES,
        currentStage: '',
        overallProgress: 0
      });
    }
  }, [stream.isLoading]);

  // Enhanced progress simulation for active stages
  useEffect(() => {
    const activeStages = workflowData.stages.filter(stage => stage.status === 'active');
    
    if (activeStages.length === 0) return;

    const interval = setInterval(() => {
      setWorkflowData(prev => ({
        ...prev,
        stages: prev.stages.map(stage => {
          if (stage.status === 'active' && stage.progress !== undefined) {
            const newProgress = Math.min(stage.progress + Math.random() * 5, 100);
            return {
              ...stage,
              progress: newProgress,
              status: newProgress >= 100 ? 'completed' as const : 'active' as const,
              endTime: newProgress >= 100 ? new Date() : stage.endTime
            };
          }
          return stage;
        })
      }));
    }, 1500); // Faster updates for more responsive feel

    return () => clearInterval(interval);
  }, [workflowData.stages]);

  // Update overall progress when stages change
  useEffect(() => {
    const completedStages = workflowData.stages.filter(s => s.status === 'completed').length;
    const activeStages = workflowData.stages.filter(s => s.status === 'active');
    const activeProgress = activeStages.length > 0 
      ? activeStages.reduce((sum, stage) => sum + (stage.progress || 0), 0) / activeStages.length 
      : 0;
    const totalStages = workflowData.stages.length;
    const overallProgress = Math.round(((completedStages + (activeStages.length * (activeProgress / 100))) / totalStages) * 100) || 0;

    setWorkflowData(prev => ({
      ...prev,
      overallProgress
    }));
  }, [workflowData.stages]);

  const resetWorkflow = useCallback(() => {
    setWorkflowData({
      stages: INITIAL_STAGES,
      currentStage: '',
      overallProgress: 0
    });
  }, []);

  const updateStageContent = useCallback((stageId: string, content: string) => {
    setWorkflowData(prev => ({
      ...prev,
      stages: prev.stages.map(stage => 
        stage.id === stageId 
          ? { ...stage, content }
          : stage
      )
    }));
  }, []);

  const markStageComplete = useCallback((stageId: string) => {
    setWorkflowData(prev => ({
      ...prev,
      stages: prev.stages.map(stage => 
        stage.id === stageId 
          ? { ...stage, status: 'completed' as const, endTime: new Date(), progress: 100 }
          : stage
      )
    }));
  }, []);

  // Enhanced demo function with realistic content for each stage
  const runDemo = useCallback(() => {
    // Reset workflow first
    resetWorkflow();
    
    // Use the demo simulation to trigger real-time events
    simulateWorkflowEvents(
      (event) => {
        // In a real scenario, this would be handled by the backend
        // For demo purposes, we'll manually trigger the event processing
        console.log('Demo Event:', event);
        
        // Simulate adding event to stream context
        // This would normally be done by the backend
        const mockStreamContext = {
          values: {
            ui: [event]
          }
        };
        
        // Process the event manually
        const agentName = event.props?.agent_name as string;
        const content = event.props?.content as string;
        const progress = event.props?.progress as number;
        const stageData = event.props?.stage_data;
        
        if (!agentName) return;
        
        const stageId = agentToStageMap[agentName.toLowerCase()] || 'story_generation';
        
        setWorkflowData(prev => {
          const updatedStages = prev.stages.map(stage => {
            if (stage.id === stageId) {
              const updatedStage = {
                ...stage,
                status: 'active' as const,
                agentName: agentName,
                startTime: stage.startTime || new Date(),
                progress: progress || stage.progress || 0
              };
              
              switch (event.name) {
                case 'progress':
                  return {
                    ...updatedStage,
                    content: content || stage.content
                  };
                
                case 'content_ready':
                  return {
                    ...updatedStage,
                    content: content || stage.content,
                    stories: stageData?.stories || stage.stories,
                    designContent: stageData?.designContent || stage.designContent,
                    codeFiles: stageData?.codeFiles || stage.codeFiles,
                    testCases: stageData?.testCases || stage.testCases
                  };
                
                default:
                  return updatedStage;
              }
            } else if (stage.status === 'active' && stage.id !== stageId) {
              return {
                ...stage,
                status: 'completed' as const,
                endTime: new Date(),
                progress: 100
              };
            }
            return stage;
          });
          
          const completedStages = updatedStages.filter(s => s.status === 'completed').length;
          const activeStages = updatedStages.filter(s => s.status === 'active');
          const activeProgress = activeStages.length > 0 
            ? activeStages.reduce((sum, stage) => sum + (stage.progress || 0), 0) / activeStages.length 
            : 0;
          const totalStages = updatedStages.length;
          const overallProgress = Math.round(((completedStages + (activeStages.length * (activeProgress / 100))) / totalStages) * 100) || 0;
          
          return {
            stages: updatedStages,
            currentStage: stageId,
            overallProgress
          };
        });
      },
      () => {
        console.log('Demo simulation completed');
      }
    );
  }, [resetWorkflow]);

  return {
    workflowData,
    resetWorkflow,
    updateStageContent,
    markStageComplete,
    runDemo
  };
}