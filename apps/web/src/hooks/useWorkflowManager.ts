import { useState, useEffect, useCallback } from 'react';
import { WorkflowData, WorkflowStage, Story, CodeFile, TestCase, DeploymentInfo } from '@/components/workflow/workflow-visualization';
import { useStreamContext } from '@/providers/Stream';

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
      deploymentInfo?: DeploymentInfo;
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
    'deployment_specialist': 'deployment',
    'supervisor': 'story_generation' // Default fallback
  };

  // Robust event processing for reliable workflow progression
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
    
    console.log('Processing workflow event:', {
      eventName: latestEvent.name,
      agentName,
      content,
      progress,
      stageData,
      hasDeploymentInfo: !!stageData?.deploymentInfo
    });
    
    if (!agentName) return;

    // Find the stage this agent corresponds to
    const stageId = agentToStageMap[agentName.toLowerCase()] || 'story_generation';
    
    console.log('Mapped agent to stage:', { agentName, stageId });
    
    setWorkflowData(prev => {
      // Get current workflow state
      const currentStages = prev.stages;
      const currentActiveStage = currentStages.find(s => s.status === 'active');
      const targetStage = currentStages.find(s => s.id === stageId);
      
      // Robust stage progression logic
      const updatedStages = currentStages.map(stage => {
        if (stage.id === stageId) {
          // Target stage logic
          const currentStatus = stage.status;
          let newStatus = currentStatus;
          let newProgress = stage.progress || 0;
          
          // Determine new status based on event and current state
          if (latestEvent.name === 'content_ready') {
            // Content ready always marks stage as completed
            newStatus = 'completed';
            newProgress = 100;
          } else if (latestEvent.name === 'progress') {
            if (progress !== undefined) {
              newProgress = progress;
              // Only move to completed if progress is 100
              if (progress >= 100) {
                newStatus = 'completed';
              } else if (currentStatus === 'pending') {
                // Move from pending to active only if this is the first progress event
                newStatus = 'active';
              }
            }
          } else if (latestEvent.name === 'ai_response') {
            if (progress !== undefined && progress >= 100) {
              newStatus = 'completed';
              newProgress = 100;
            }
          }
          
          // Enhanced stage update with structured content
          const updatedStage = {
            ...stage,
            status: newStatus,
            agentName: agentName,
            startTime: stage.startTime || (newStatus === 'active' ? new Date() : stage.startTime),
            endTime: newStatus === 'completed' ? new Date() : stage.endTime,
            progress: newProgress,
            content: content || stage.content
          };

          // Handle different event types for content
          switch (latestEvent.name) {
            case 'content_ready':
              return {
                ...updatedStage,
                stories: stageData?.stories || stage.stories,
                designContent: stageData?.designContent || stage.designContent,
                codeFiles: stageData?.codeFiles || stage.codeFiles,
                testCases: stageData?.testCases || stage.testCases,
                deploymentInfo: stageData?.deploymentInfo || stage.deploymentInfo
              };
            
            default:
              return updatedStage;
          }
        } else if (stage.status === 'active' && stage.id !== stageId) {
          // If a different stage becomes active, complete the current active stage
          // This ensures only one stage is active at a time
          return {
            ...stage,
            status: 'completed' as const,
            endTime: new Date(),
            progress: 100
          };
        }
        return stage;
      });

      // Auto-select logic: Select the first active stage, or the first pending stage if no active
      let newCurrentStage = prev.currentStage;
      const activeStage = updatedStages.find(s => s.status === 'active');
      const firstPendingStage = updatedStages.find(s => s.status === 'pending');
      
      if (activeStage && activeStage.id) {
        // Auto-select active stage
        newCurrentStage = activeStage.id;
      } else if (firstPendingStage && firstPendingStage.id && !prev.currentStage) {
        // Auto-select first pending stage if no stage is currently selected
        newCurrentStage = firstPendingStage.id;
      } else if (activeStage && activeStage.id && prev.currentStage !== activeStage.id) {
        // Auto-select newly activated stage
        newCurrentStage = activeStage.id;
      }

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
        currentStage: newCurrentStage,
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
    
    console.log('Demo simulation started - this would trigger real backend events in production');
    
    // In a real scenario, the backend would emit these events:
    // 1. progress event for story_writer with progress: 0
    // 2. content_ready event for story_writer with stage_data.stories
    // 3. progress event for design_architect with progress: 0
    // 4. content_ready event for design_architect with stage_data.designContent
    // 5. And so on for each stage...
    
    // For demo purposes, we'll just log what should happen
    console.log('Expected event sequence:');
    console.log('1. progress event: agent_name: "story_writer", progress: 0');
    console.log('2. content_ready event: agent_name: "story_writer", stage_data: { stories: [...] }');
    console.log('3. progress event: agent_name: "design_architect", progress: 0');
    console.log('4. content_ready event: agent_name: "design_architect", stage_data: { designContent: "..." }');
    console.log('5. Continue for each stage...');
    
  }, [resetWorkflow]);

  return {
    workflowData,
    resetWorkflow,
    updateStageContent,
    markStageComplete,
    runDemo
  };
}