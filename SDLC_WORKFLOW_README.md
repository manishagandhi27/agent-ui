# SDLC Workflow Visualization System

## Overview

This system provides a comprehensive Software Development Life Cycle (SDLC) workflow visualization with real-time progress monitoring and an integrated AI chat interface. It's designed to give users a professional, modern view of their development process with live updates as different AI agents work on various stages.

## Features

### 🎯 **Visual Workflow Pipeline**
- **5 SDLC Stages**: Story Generation → Design Generation → Code Generation → Testing → Deployment
- **Real-time Status Updates**: Pending, Active, Completed, Failed states
- **Progress Indicators**: Individual stage progress bars and overall completion percentage
- **Interactive Stages**: Click any stage to view detailed information

### 💬 **Integrated Chat Interface**
- **Collapsible Chat Panel**: Toggle chat on/off without losing workflow view
- **Minimizable**: Can be minimized to just an icon when not needed
- **Real-time Communication**: Chat with AI agents while monitoring workflow progress

### 📊 **Professional Dashboard**
- **Status Bar**: Bottom status bar showing current stage and overall progress
- **Stage Counters**: Live counts of pending, active, and completed stages
- **Control Buttons**: Pause/Resume workflow and reset functionality

## Architecture

### Frontend Components

1. **`WorkflowVisualization`** (`/components/workflow/workflow-visualization.tsx`)
   - Main workflow pipeline display
   - Stage circles with status indicators
   - Progress animations and transitions
   - Stage detail panels

2. **`CollapsibleChat`** (`/components/workflow/collapsible-chat.tsx`)
   - Floating chat panel with slide-in animation
   - Minimize/maximize functionality
   - Backdrop overlay for focus

3. **`useWorkflowManager`** (`/hooks/useWorkflowManager.ts`)
   - Manages workflow state and progress
   - Maps agent names to workflow stages
   - Handles real-time updates from chat events

### Pages

1. **Dashboard** (`/app/page.tsx`)
   - Interface selection page
   - Choose between Chat and SDLC Workflow

2. **SDLC Workflow** (`/app/sdlc/page.tsx`)
   - Main workflow visualization page
   - Integrated chat panel
   - Status monitoring

3. **Chat Interface** (`/app/chat/page.tsx`)
   - Traditional chat-only interface
   - Full-screen chat experience

## How It Works

### 1. **Workflow Stages**
The system defines 5 SDLC stages:
- **Story Generation** (📝): User stories and requirements
- **Design Generation** (🎨): UI/UX designs and architecture  
- **Code Generation** (💻): Implementation and coding
- **Testing** (🧪): Quality assurance and testing
- **Deployment** (🚀): Production deployment

### 2. **Agent Mapping**
Progress events from the chat system are mapped to workflow stages:
```typescript
const agentToStageMap = {
  'story_writer': 'story_generation',
  'design_architect': 'design_generation', 
  'code_developer': 'code_generation',
  'test_engineer': 'testing',
  'deployment_manager': 'deployment'
};
```

### 3. **Real-time Updates**
- Progress events from LangGraph UI events trigger stage updates
- Active stages show progress bars with simulated progress
- Completed stages automatically transition to the next stage
- Overall progress is calculated based on completed and active stages

### 4. **Chat Integration**
- Chat panel can be toggled on/off
- Minimizable to save screen space
- Maintains full chat functionality while showing workflow
- Progress events in chat update the workflow visualization

## Usage

### Starting a Workflow
1. Navigate to `/sdlc` to access the workflow dashboard
2. The workflow starts in "pending" state for all stages
3. Begin chatting with AI agents to trigger workflow progress

### Monitoring Progress
- **Visual Indicators**: Each stage shows its current status with icons and colors
- **Progress Bars**: Active stages display progress bars
- **Status Bar**: Bottom bar shows current stage and overall progress
- **Stage Details**: Click any stage to view detailed information

### Chat Integration
- Click the chat button (bottom-right) to open the chat panel
- Chat normally with AI agents
- Watch as workflow stages update based on agent activities
- Minimize chat to focus on workflow visualization

### Controls
- **Pause/Resume**: Temporarily pause workflow updates
- **Reset**: Clear all progress and start fresh
- **Stage Click**: View detailed information for any stage

## Technical Implementation

### State Management
```typescript
interface WorkflowStage {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  content?: string;
  agentName?: string;
  startTime?: Date;
  endTime?: Date;
  progress?: number; // 0-100
}
```

### Event Handling
- Progress events from `useStreamContext` are filtered and processed
- Agent names are mapped to corresponding workflow stages
- Stage content is updated with real-time progress information
- Automatic stage transitions based on completion

### Animations
- Framer Motion for smooth transitions
- Progress bar animations
- Stage circle hover effects
- Chat panel slide animations

## Customization

### Adding New Stages
1. Update `INITIAL_STAGES` in `useWorkflowManager.ts`
2. Add stage configuration to `STAGE_CONFIG` in `workflow-visualization.tsx`
3. Update agent mapping in `agentToStageMap`

### Styling
- Tailwind CSS for styling
- Custom color schemes for each stage
- Responsive design for different screen sizes
- Dark mode support (can be added)

### Backend Integration
- Currently uses simulated progress for demonstration
- Can be connected to real LangGraph agents
- Supports custom event types and progress tracking

## Future Enhancements

1. **Real Agent Integration**: Connect to actual LangGraph agents
2. **Custom Workflows**: Allow users to define custom stage sequences
3. **Team Collaboration**: Multi-user workflow monitoring
4. **Analytics**: Workflow performance metrics and insights
5. **Notifications**: Real-time alerts for stage completions
6. **Export**: Generate reports and documentation
7. **Timeline View**: Historical workflow timeline
8. **Branching**: Support for parallel workflow branches

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Access the Application**:
   - Dashboard: `http://localhost:3000`
   - SDLC Workflow: `http://localhost:3000/sdlc`
   - Chat Interface: `http://localhost:3000/chat`

4. **Configure Backend**:
   - Set up LangGraph deployment URL
   - Configure agent IDs
   - Test progress event streaming

## Contributing

This system is designed to be extensible and modular. Key areas for contribution:
- Additional workflow stage types
- Enhanced visualization components
- Backend agent integration
- Performance optimizations
- Accessibility improvements 