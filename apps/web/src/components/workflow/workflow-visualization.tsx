import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  Palette, 
  Code, 
  CheckSquare, 
  Rocket,
  CheckCircle,
  Clock,
  AlertCircle,
  Play,
  ChevronRight,
  X,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react';

export interface WorkflowStage {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  content?: string;
  agentName?: string;
  startTime?: Date;
  endTime?: Date;
  progress?: number; // 0-100
  // Stage-specific content
  stories?: Story[];
  designContent?: string;
  codeFiles?: CodeFile[];
  testFiles?: CodeFile[]; // Test files (similar to code files)
  testCases?: TestCase[];
}

export interface Story {
  id: string;
  jiraId: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  priority: 'High' | 'Medium' | 'Low';
  storyPoints?: number;
}

export interface CodeFile {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  language?: string;
  content?: string;
  children?: CodeFile[];
}

export interface TestCase {
  id: string;
  name: string;
  description: string;
  steps: string[];
  expectedResult: string;
  status: 'Pass' | 'Fail' | 'Pending';
  priority: 'High' | 'Medium' | 'Low';
}

export interface WorkflowData {
  stages: WorkflowStage[];
  currentStage: string;
  overallProgress: number;
}

interface WorkflowVisualizationProps {
  workflowData: WorkflowData;
  onStageClick?: (stageId: string) => void;
  className?: string;
  isChatOpen?: boolean;
}

const STAGE_CONFIG = {
  story_generation: {
    icon: FileText,
    color: 'from-gray-600 to-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    textColor: 'text-gray-700',
    gradient: 'from-gray-600 to-gray-700',
    shadow: 'shadow-gray-500/20'
  },
  design_generation: {
    icon: Palette,
    color: 'from-gray-500 to-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    textColor: 'text-gray-600',
    gradient: 'from-gray-500 to-gray-600',
    shadow: 'shadow-gray-500/20'
  },
  code_generation: {
    icon: Code,
    color: 'from-gray-700 to-gray-800',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    textColor: 'text-gray-800',
    gradient: 'from-gray-700 to-gray-800',
    shadow: 'shadow-gray-500/20'
  },
  testing: {
    icon: CheckSquare,
    color: 'from-gray-800 to-gray-900',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    textColor: 'text-gray-900',
    gradient: 'from-gray-800 to-gray-900',
    shadow: 'shadow-gray-500/20'
  },
  deployment: {
    icon: Rocket,
    color: 'from-gray-900 to-gray-950',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    textColor: 'text-gray-950',
    gradient: 'from-gray-900 to-gray-950',
    shadow: 'shadow-gray-500/20'
  }
};

export function WorkflowVisualization({ 
  workflowData, 
  onStageClick,
  className,
  isChatOpen = false
}: WorkflowVisualizationProps) {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);
  const [manuallySelected, setManuallySelected] = useState(false);

  // Auto-select stage based on workflowData.currentStage (only if not manually selected)
  useEffect(() => {
    if (workflowData.currentStage && workflowData.currentStage !== selectedStage && !manuallySelected) {
      setSelectedStage(workflowData.currentStage);
    }
  }, [workflowData.currentStage, selectedStage, manuallySelected]);

  // Reset selected stage when workflow resets
  useEffect(() => {
    if (workflowData.overallProgress === 0) {
      setSelectedStage(null);
      setManuallySelected(false);
    }
  }, [workflowData.overallProgress]);

  const handleStageClick = (stageId: string) => {
    const clickedStage = workflowData.stages.find(s => s.id === stageId);
    
    // Allow clicking on any stage that has content or is completed
    if (clickedStage && (clickedStage.status === 'completed' || clickedStage.content || 
        clickedStage.stories || clickedStage.designContent || 
        clickedStage.codeFiles || clickedStage.testFiles)) {
      
      if (selectedStage === stageId) {
        // Deselect if clicking the same stage
        setSelectedStage(null);
        setManuallySelected(false);
      } else {
        // Select the clicked stage
        setSelectedStage(stageId);
        setManuallySelected(true);
      }
      onStageClick?.(stageId);
    }
  };

  const getStatusIcon = (status: WorkflowStage['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'active':
        return <Play className="w-4 h-4 text-white" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: WorkflowStage['status']) => {
    switch (status) {
      case 'completed':
        return { text: 'Completed', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
      case 'active':
        return { text: 'Active', color: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'failed':
        return { text: 'Failed', color: 'bg-red-100 text-red-700 border-red-200' };
      default:
        return { text: 'Pending', color: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
  };

  // Debug: Check if workflow data is available
  if (!workflowData || !workflowData.stages || workflowData.stages.length === 0) {
    return (
      <div className={cn("w-full h-full flex flex-col", className)}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <motion.div 
              className="w-20 h-20 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl flex items-center justify-center shadow-2xl mb-6"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Initializing APEX</h2>
            <p className="text-slate-500">Preparing workflow pipeline...</p>
          </div>
        </div>
      </div>
    );
  }

  const completedStages = workflowData.stages.filter(s => s.status === 'completed').length;
  const activeStages = workflowData.stages.filter(s => s.status === 'active').length;
  const totalStages = workflowData.stages.length;

  return (
    <div className={cn("w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-white", className)}>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
                {/* Pipeline Row - Expanded to match content width */}
        <div className="flex-shrink-0 p-1">
          <div className={cn(
            "mx-auto transition-all duration-300 px-6",
            isChatOpen 
              ? "w-full max-w-none pr-96" // Full width minus chat space
              : "w-full max-w-7xl" // Full width on larger screens
          )}>
            <div className={cn(
              "relative",
              isChatOpen ? "pr-6" : "" // Add right padding when chat is open
            )}>
            <div className={cn(
              "relative",
              isChatOpen ? "pr-6" : "" // Add right padding when chat is open
            )}>
              {/* Background Connection Line */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 transform -translate-y-1/2 rounded-full" />
              
              {/* Progress Connection Line */}
              <motion.div 
                className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-slate-900 to-slate-700 transform -translate-y-1/2 rounded-full shadow-lg"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${(completedStages / totalStages) * 100}%` 
                }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
              
              {/* Stages */}
              <div className="relative flex justify-between items-center py-4 sm:py-6">
                {workflowData.stages.map((stage, index) => {
                  const config = STAGE_CONFIG[stage.id as keyof typeof STAGE_CONFIG];
                  const IconComponent = config?.icon || FileText;
                  const isActive = stage.status === 'active';
                  const isCompleted = stage.status === 'completed';
                  const isCurrent = workflowData.currentStage === stage.id;
                  const isHovered = hoveredStage === stage.id;
                  const isContentSelected = selectedStage === stage.id;
                  const statusBadge = getStatusBadge(stage.status);

                  return (
                    <motion.div
                      key={stage.id}
                      className="relative z-10 flex flex-col items-center group"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.15, duration: 0.6 }}
                      onHoverStart={() => setHoveredStage(stage.id)}
                      onHoverEnd={() => setHoveredStage(null)}
                    >
                      {/* Stage Circle */}
                      <motion.button
                        onClick={() => handleStageClick(stage.id)}
                        className={cn(
                          "relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-500 cursor-pointer shadow-xl",
                          isCompleted ? `bg-gradient-to-br ${config?.gradient} shadow-lg` :
                          isActive ? `bg-gradient-to-br ${config?.gradient} shadow-2xl scale-110 ring-4 ring-slate-200` :
                          stage.status === 'failed' ? "bg-gradient-to-br from-red-500 to-red-600 shadow-lg" :
                          "bg-white shadow-lg border-2 border-slate-200 hover:border-slate-300",
                          isHovered && "scale-105",
                          isContentSelected && "ring-4 ring-emerald-400 shadow-2xl"
                        )}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <IconComponent className={cn(
                          "w-4 h-4 sm:w-6 sm:h-6 transition-all duration-300",
                          isCompleted ? "text-white" : 
                          isActive ? "text-white" : 
                          stage.status === 'failed' ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                        )} />
                        
                        {/* Active Stage Pulse Animation */}
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 rounded-xl sm:rounded-2xl bg-slate-900/20"
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          />
                        )}

                        {/* Content Selected Indicator */}
                        {isContentSelected && (
                          <motion.div
                            className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1.5 bg-emerald-500 rounded-full shadow-lg"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                          />
                        )}

                        {/* Status Badge */}
                        <motion.div
                          className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full flex items-center justify-center shadow-lg border border-slate-200"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.15 + 0.3 }}
                        >
                          {getStatusIcon(stage.status)}
                        </motion.div>
                      </motion.button>

                      {/* Stage Info */}
                      <div className="mt-3 sm:mt-4 text-center max-w-20 sm:max-w-24">
                        <motion.div 
                          className={cn(
                            "font-bold text-xs sm:text-sm mb-1",
                            isContentSelected ? "text-emerald-700" :
                            isActive ? "text-slate-900" : 
                            isCompleted ? "text-emerald-600" : "text-slate-600"
                          )}
                          animate={{ 
                            color: isContentSelected ? "#047857" :
                            isActive ? "#1e293b" : 
                            isCompleted ? "#059669" : "#64748b" 
                          }}
                        >
                          {stage.name}
                        </motion.div>
                        
                        {/* Status Badge */}
                        <motion.div
                          className={cn(
                            "inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium border",
                            statusBadge.color
                          )}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.15 + 0.4 }}
                        >
                          {statusBadge.text}
                        </motion.div>
                        
                        {/* Active Stage Progress */}
                        {isActive && stage.progress !== undefined && (
                          <motion.div 
                            className="mt-2 w-full"
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            transition={{ delay: index * 0.15 + 0.5 }}
                          >
                            <div className="w-full h-1 sm:h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-slate-900 to-slate-700 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${stage.progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                              />
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Display Area - Responsive width */}
        <div className="flex-1 overflow-hidden">
          {selectedStage ? (
            <div className={cn(
              "h-full transition-all duration-300",
              isChatOpen ? "pr-96" : ""
            )}>
              <EnhancedStageDetails
                stage={workflowData.stages.find(s => s.id === selectedStage)!}
                onClose={() => setSelectedStage(null)}
              />
            </div>
          ) : (
            <div className={cn(
              "h-full flex items-center justify-center p-2 transition-all duration-300",
              isChatOpen ? "pr-96" : ""
            )}>
              <div className="text-center text-slate-500 max-w-sm mx-auto">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">Workflow Ready</h3>
                <p className="text-xs">Click on any stage to view details or start the workflow</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface EnhancedStageDetailsProps {
  stage: WorkflowStage;
  onClose: () => void;
}

function EnhancedStageDetails({ stage, onClose }: EnhancedStageDetailsProps) {
  const config = STAGE_CONFIG[stage.id as keyof typeof STAGE_CONFIG];
  const IconComponent = config?.icon || FileText;
  const statusBadge = getStatusBadge(stage.status);

  const renderStageContent = () => {
    switch (stage.id) {
      case 'story_generation':
        return stage.stories && stage.stories.length > 0 ? (
          <StoriesContent stories={stage.stories} />
        ) : (
          <DefaultContent stage={stage} />
        );
      case 'design_generation':
        return stage.designContent ? (
          <DesignContent content={stage.designContent} />
        ) : (
          <DefaultContent stage={stage} />
        );
      case 'code_generation':
        return stage.codeFiles && stage.codeFiles.length > 0 ? (
          <CodeContent files={stage.codeFiles} />
        ) : (
          <DefaultContent stage={stage} />
        );
      case 'testing':
        return stage.testFiles && stage.testFiles.length > 0 ? (
          <TestContent testFiles={stage.testFiles} />
        ) : (
          <DefaultContent stage={stage} />
        );
      default:
        return <DefaultContent stage={stage} />;
    }
  };

  return (
    <motion.div 
      className="h-full bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-2xl overflow-hidden flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-slate-50 to-slate-100 p-4 border-b border-slate-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-10 h-10 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <IconComponent className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-0.5">{stage.name}</h3>
              <p className="text-slate-600 text-xs">{stage.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn(
              "px-2 py-1 rounded-full text-xs font-semibold border",
              statusBadge.color
            )}>
              {statusBadge.text}
            </div>
            <motion.button
              onClick={onClose}
              className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-3 h-3" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Stage-specific content - Directly scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {renderStageContent()}
      </div>
    </motion.div>
  );
}

// Stories Content Component - No duplicate header
function StoriesContent({ stories }: { stories: Story[] }) {
  return (
    <div className="overflow-y-auto p-6 space-y-4">
      {stories.map((story, index) => (
        <motion.div
          key={story.id}
          className="group bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:border-slate-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {/* Story Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white text-sm font-bold">{index + 1}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded-md border">
                  {story.jiraId}
                </span>
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full font-medium border",
                  story.priority === 'High' ? "bg-red-50 text-red-700 border-red-200" :
                  story.priority === 'Medium' ? "bg-amber-50 text-amber-700 border-amber-200" :
                  "bg-green-50 text-green-700 border-green-200"
                )}>
                  {story.priority}
                </span>
                {story.storyPoints && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-200">
                    {story.storyPoints} SP
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Story Title & Description */}
          <div className="mb-4">
            <h4 className="font-semibold text-slate-900 mb-2 leading-tight">{story.title}</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              {story.description}
            </p>
          </div>
          
          {/* Acceptance Criteria */}
          {story.acceptanceCriteria.length > 0 && (
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
              <h5 className="font-medium text-slate-900 text-sm mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                Acceptance Criteria
              </h5>
              <ul className="space-y-2">
                {story.acceptanceCriteria.map((criteria, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="leading-relaxed">{criteria}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// Design Content Component - No duplicate header
function DesignContent({ content }: { content: string }) {
  return (
    <div className="overflow-y-auto p-6">
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="prose prose-sm max-w-none">
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-mono bg-white rounded-lg p-4 border border-slate-100">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}

// Code Content Component - No duplicate header
function CodeContent({ files }: { files: CodeFile[] }) {
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);

  const renderFileTree = (fileList: CodeFile[], level = 0) => {
    return fileList.map((file) => (
      <div key={file.id} style={{ paddingLeft: `${level * 16}px` }}>
        <div
          className={cn(
            "flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer hover:bg-slate-100 transition-all duration-200 group",
            selectedFile?.id === file.id && "bg-slate-200 border border-slate-300"
          )}
          onClick={() => file.type === 'file' && setSelectedFile(file)}
        >
          {file.type === 'directory' ? (
            <div className="w-4 h-4 text-slate-500 group-hover:text-slate-700">📁</div>
          ) : (
            <div className="w-4 h-4 text-slate-500 group-hover:text-slate-700">📄</div>
          )}
          <span className="text-sm text-slate-700 group-hover:text-slate-900 font-medium">
            {file.name}
          </span>
          {file.language && (
            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-md ml-auto">
              {file.language}
            </span>
          )}
        </div>
        {file.children && renderFileTree(file.children, level + 1)}
      </div>
    ));
  };

  return (
    <div className="overflow-y-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* File Tree */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <h5 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
              File Structure
            </h5>
            <div className="space-y-1 overflow-y-auto max-h-96 pr-2">
              {renderFileTree(files)}
            </div>
          </div>
        </div>
        
        {/* File Content */}
        <div className="lg:col-span-2">
          {selectedFile ? (
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-semibold text-slate-900 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                  {selectedFile.name}
                </h5>
                <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-md">
                  {selectedFile.language || 'text'}
                </span>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div className="overflow-auto max-h-96">
                  <pre className="text-sm text-slate-700 p-4 leading-relaxed">
                    <code>{selectedFile.content || '// File content will be displayed here'}</code>
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-8 border border-slate-200 flex items-center justify-center shadow-sm">
              <div className="text-center text-slate-500">
                <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Code className="w-8 h-8 text-slate-400" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Select a File</h4>
                <p className="text-sm">Choose a file from the tree to view its content</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Test Content Component - File view for test files
function TestContent({ testFiles }: { testFiles: CodeFile[] }) {
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);

  const renderFileTree = (fileList: CodeFile[], level = 0) => {
    return fileList.map((file) => (
      <div key={file.id} style={{ paddingLeft: `${level * 16}px` }}>
        <div
          className={cn(
            "flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer hover:bg-slate-100 transition-all duration-200 group",
            selectedFile?.id === file.id && "bg-slate-200 border border-slate-300"
          )}
          onClick={() => file.type === 'file' && setSelectedFile(file)}
        >
          {file.type === 'directory' ? (
            <div className="w-4 h-4 text-slate-500 group-hover:text-slate-700">📁</div>
          ) : (
            <div className="w-4 h-4 text-slate-500 group-hover:text-slate-700">🧪</div>
          )}
          <span className="text-sm text-slate-700 group-hover:text-slate-900 font-medium">
            {file.name}
          </span>
          {file.language && (
            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-md ml-auto">
              {file.language}
            </span>
          )}
        </div>
        {file.children && renderFileTree(file.children, level + 1)}
      </div>
    ));
  };

  return (
    <div className="overflow-y-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test File Tree */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <h5 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
              Test Files
            </h5>
            <div className="space-y-1 overflow-y-auto max-h-96 pr-2">
              {renderFileTree(testFiles)}
            </div>
          </div>
        </div>
        
        {/* Test File Content */}
        <div className="lg:col-span-2">
          {selectedFile ? (
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-semibold text-slate-900 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                  {selectedFile.name}
                </h5>
                <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-md">
                  {selectedFile.language || 'text'}
                </span>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div className="overflow-auto max-h-96">
                  <pre className="text-sm text-slate-700 p-4 leading-relaxed">
                    <code>{selectedFile.content || '// Test content will be displayed here'}</code>
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-8 border border-slate-200 flex items-center justify-center shadow-sm">
              <div className="text-center text-slate-500">
                <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckSquare className="w-8 h-8 text-slate-400" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Select a Test File</h4>
                <p className="text-sm">Choose a test file from the tree to view its content</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Default Content Component - No duplicate header
function DefaultContent({ stage }: { stage: WorkflowStage }) {
  return (
    <div className="overflow-y-auto p-6 space-y-6">
      {/* Current Activity */}
      {stage.content && (
        <motion.div 
          className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-5 border border-slate-200 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
            Current Activity
          </h4>
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-white rounded-lg p-4 border border-slate-100">
            {stage.content}
          </div>
        </motion.div>
      )}

      {/* Timeline */}
      {/* <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Timeline
        </h4>
        
        <div className="space-y-3">
          {stage.startTime && (
            <motion.div 
              className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <div className="text-sm font-medium text-blue-900">Started</div>
                <div className="text-xs text-blue-700">{stage.startTime.toLocaleString()}</div>
              </div>
            </motion.div>
          )}
          
          {stage.endTime && (
            <motion.div 
              className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <div>
                <div className="text-sm font-medium text-emerald-900">Completed</div>
                <div className="text-xs text-emerald-700">{stage.endTime.toLocaleString()}</div>
              </div>
            </motion.div>
          )}

          {stage.progress !== undefined && stage.status === 'active' && (
            <motion.div 
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="w-3 h-3 bg-slate-500 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900 mb-2">Progress</div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-slate-900 to-slate-700 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${stage.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <div className="text-xs text-slate-600 mt-1">{stage.progress}% complete</div>
              </div>
            </motion.div>
          )}
        </div>
      </div> */}
    </div>
  );
}

function getStatusBadge(status: WorkflowStage['status']) {
  switch (status) {
    case 'completed':
      return { text: 'Completed', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    case 'active':
      return { text: 'Active', color: 'bg-blue-100 text-blue-700 border-blue-200' };
    case 'failed':
      return { text: 'Failed', color: 'bg-red-100 text-red-700 border-red-200' };
    default:
      return { text: 'Pending', color: 'bg-slate-100 text-slate-600 border-slate-200' };
  }
} 