import { Story, CodeFile, TestCase } from '@/components/workflow/workflow-visualization';

// Demo data for each stage
export const DEMO_STAGES = {
  story_generation: {
    agent: 'story_writer',
    name: 'Analyze',
    stories: [
      {
        id: 'story-1',
        jiraId: 'APEX-101',
        title: 'User Authentication & Authorization System',
        description: 'Implement a comprehensive user authentication and authorization system with multi-factor authentication, role-based access control, and secure session management.',
        acceptanceCriteria: [
          'User can register with email, password, and profile information',
          'Email verification required for account activation',
          'Multi-factor authentication (SMS/Email/App-based)',
          'Password reset via secure email link with token expiration',
          'Role-based access control (Admin, Manager, User, Guest)',
          'JWT token management with refresh token rotation'
        ],
        priority: 'High' as const,
        storyPoints: 13
      },
      {
        id: 'story-2',
        jiraId: 'APEX-102',
        title: 'Advanced Dashboard & Analytics Platform',
        description: 'Develop a sophisticated dashboard with real-time analytics, customizable widgets, interactive charts, and data visualization capabilities.',
        acceptanceCriteria: [
          'Real-time data visualization with auto-refresh capabilities',
          'Customizable dashboard layouts with drag-and-drop widgets',
          'Interactive charts (line, bar, pie, scatter plots) with drill-down',
          'Project progress tracking with milestone visualization',
          'Performance metrics dashboard with KPI tracking',
          'Team productivity analytics and time tracking'
        ],
        priority: 'High' as const,
        storyPoints: 21
      },
      {
        id: 'story-3',
        jiraId: 'APEX-103',
        title: 'Enterprise File Management & Collaboration System',
        description: 'Build a comprehensive file management system with advanced collaboration features, version control, real-time editing, and secure sharing capabilities.',
        acceptanceCriteria: [
          'Drag-and-drop file upload with progress tracking and resume capability',
          'File type validation and virus scanning integration',
          'Version control with file history and rollback functionality',
          'Real-time collaborative editing for documents and spreadsheets',
          'Secure file sharing with permission-based access control',
          'Cloud storage integration (AWS S3, Google Drive, Dropbox)'
        ],
        priority: 'High' as const,
        storyPoints: 18
      },
      {
        id: 'story-4',
        jiraId: 'APEX-104',
        title: 'Workflow Automation & Process Management',
        description: 'Create an intelligent workflow automation system that allows users to design, execute, and monitor business processes.',
        acceptanceCriteria: [
          'Visual workflow designer with drag-and-drop interface',
          'Conditional logic and decision branching capabilities',
          'Approval workflows with multi-level authorization',
          'Task assignment and notification system',
          'Workflow templates and reusable components',
          'Process monitoring and performance analytics'
        ],
        priority: 'Medium' as const,
        storyPoints: 16
      },
      {
        id: 'story-5',
        jiraId: 'APEX-105',
        title: 'Advanced Reporting & Business Intelligence',
        description: 'Develop a comprehensive reporting and business intelligence platform with custom report builder, data visualization, and advanced analytics.',
        acceptanceCriteria: [
          'Custom report builder with visual query designer',
          'Advanced data visualization with interactive charts and graphs',
          'Scheduled report generation and automated distribution',
          'Data export in multiple formats (PDF, Excel, CSV, JSON)',
          'Report templates and reusable components',
          'Real-time data integration and live dashboards'
        ],
        priority: 'Medium' as const,
        storyPoints: 14
      }
    ]
  },
  
  design_generation: {
    agent: 'design_architect',
    name: 'Design',
    designContent: `# APEX Enterprise Application - System Design

## 🏗️ System Architecture Overview

### Microservices Architecture
- **API Gateway**: Kong/Envoy for request routing and load balancing
- **Authentication Service**: JWT-based auth with OAuth2/OIDC support
- **User Management Service**: User profiles, roles, and permissions
- **File Management Service**: Document storage and collaboration
- **Workflow Engine**: Business process automation
- **Analytics Service**: Real-time data processing and reporting

### Technology Stack
- **Frontend**: React 18 with TypeScript, Next.js 14
- **Backend**: Node.js with Express, Python with FastAPI
- **Database**: PostgreSQL (primary), Redis (caching), MongoDB (documents)
- **Message Queue**: Apache Kafka for event streaming
- **Search**: Elasticsearch for full-text search
- **Storage**: AWS S3 for file storage

## 🎨 UI/UX Design System

### Design Principles
- **Minimalist**: Clean, uncluttered interfaces
- **Accessible**: WCAG 2.1 AA compliance
- **Responsive**: Mobile-first design approach
- **Consistent**: Unified design language across all components

### Color Palette
- **Primary**: Slate Gray (#64748b) - Professional, trustworthy
- **Secondary**: Emerald Green (#10b981) - Success, growth
- **Accent**: Blue (#3b82f6) - Information, links
- **Warning**: Amber (#f59e0b) - Caution, attention
- **Error**: Red (#ef4444) - Errors, destructive actions

## 🗄️ Database Schema Design

### Core Tables
\`\`\`sql
-- Users and Authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role_id UUID REFERENCES roles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User Stories and Requirements
CREATE TABLE user_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jira_id VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20) CHECK (priority IN ('High', 'Medium', 'Low')),
  story_points INTEGER,
  status VARCHAR(20) DEFAULT 'Backlog',
  created_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

## 🔐 Security Architecture

### Authentication & Authorization
- **Multi-Factor Authentication**: TOTP, SMS, Email verification
- **OAuth2/OIDC**: Google, Microsoft, SAML integration
- **JWT Tokens**: Short-lived access tokens with refresh rotation
- **Role-Based Access Control**: Granular permissions system

### Data Protection
- **Encryption**: AES-256 for data at rest, TLS 1.3 for data in transit
- **Audit Logging**: Comprehensive activity tracking
- **Data Privacy**: GDPR compliance with data retention policies`
  },
  
  code_generation: {
    agent: 'code_developer',
    name: 'Code',
    codeFiles: [
      {
        id: 'file-1',
        name: 'package.json',
        path: '/',
        type: 'file',
        language: 'json',
        content: `{
  "name": "apex-enterprise-app",
  "version": "1.0.0",
  "description": "Enterprise application with workflow automation",
  "main": "src/index.ts",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "jest",
    "lint": "eslint . --ext .ts,.tsx"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "framer-motion": "^10.16.0",
    "lucide-react": "^0.292.0",
    "zustand": "^4.4.0"
  }
}`
      },
      {
        id: 'file-2',
        name: 'src',
        path: '/src',
        type: 'directory',
        children: [
          {
            id: 'file-3',
            name: 'app',
            path: '/src/app',
            type: 'directory',
            children: [
              {
                id: 'file-4',
                name: 'layout.tsx',
                path: '/src/app/layout.tsx',
                type: 'file',
                language: 'typescript',
                content: `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'APEX Enterprise Platform',
  description: 'Advanced workflow automation and collaboration platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
          {children}
        </div>
      </body>
    </html>
  )
}`
              },
              {
                id: 'file-5',
                name: 'page.tsx',
                path: '/src/app/page.tsx',
                type: 'file',
                language: 'typescript',
                content: `'use client'

import { useState } from 'react'
import { WorkflowVisualization } from '@/components/workflow/workflow-visualization'
import { useWorkflowManager } from '@/hooks/useWorkflowManager'
import { Thread } from '@/providers/Thread'

export default function HomePage() {
  const { workflowData, runDemo, resetWorkflow } = useWorkflowManager()
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col">
        <header className="flex-shrink-0 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                APEX
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={runDemo} className="px-4 py-2 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-lg">
                Run Demo
              </button>
              <button onClick={resetWorkflow} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg">
                Reset
              </button>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-hidden">
          <WorkflowVisualization workflowData={workflowData} isChatOpen={isChatOpen} />
        </div>
      </div>
      <Thread isOpen={isChatOpen} onToggle={setIsChatOpen} />
    </div>
  )
}`
              }
            ]
          },
          {
            id: 'file-6',
            name: 'components',
            path: '/src/components',
            type: 'directory',
            children: [
              {
                id: 'file-7',
                name: 'workflow',
                path: '/src/components/workflow',
                type: 'directory',
                children: [
                  {
                    id: 'file-8',
                    name: 'workflow-visualization.tsx',
                    path: '/src/components/workflow/workflow-visualization.tsx',
                    type: 'file',
                    language: 'typescript',
                    content: `// Main workflow visualization component
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
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
  Zap
} from 'lucide-react'

// Component interfaces and implementation...
// (Full component code as shown in the current implementation)`
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  
  testing: {
    agent: 'test_engineer',
    name: 'Test',
    testCases: [
      {
        id: 'test-1',
        name: 'User Authentication Flow',
        description: 'Test complete user authentication including registration, login, MFA, and password reset',
        steps: [
          'Navigate to registration page',
          'Fill in valid user information',
          'Submit registration form',
          'Verify email confirmation',
          'Login with credentials',
          'Complete MFA verification',
          'Test password reset flow',
          'Verify session management'
        ],
        expectedResult: 'User can successfully register, login, and maintain secure session',
        status: 'Pass' as const,
        priority: 'High' as const
      },
      {
        id: 'test-2',
        name: 'Dashboard Analytics',
        description: 'Test real-time dashboard with data visualization and interactive features',
        steps: [
          'Login as authenticated user',
          'Navigate to dashboard',
          'Verify real-time data updates',
          'Test chart interactions',
          'Validate data filtering',
          'Test export functionality',
          'Verify mobile responsiveness',
          'Check performance metrics'
        ],
        expectedResult: 'Dashboard displays accurate real-time data with smooth interactions',
        status: 'Pass' as const,
        priority: 'High' as const
      },
      {
        id: 'test-3',
        name: 'File Management System',
        description: 'Test file upload, download, sharing, and collaboration features',
        steps: [
          'Upload various file types',
          'Verify file validation',
          'Test file sharing permissions',
          'Validate version control',
          'Test collaborative editing',
          'Verify file search functionality',
          'Test cloud storage integration',
          'Check file encryption'
        ],
        expectedResult: 'Files are securely managed with proper access controls and collaboration',
        status: 'Pass' as const,
        priority: 'High' as const
      },
      {
        id: 'test-4',
        name: 'Workflow Automation',
        description: 'Test workflow creation, execution, and monitoring capabilities',
        steps: [
          'Create new workflow template',
          'Design workflow with conditions',
          'Assign tasks to team members',
          'Execute workflow',
          'Monitor progress in real-time',
          'Test approval workflows',
          'Verify notifications',
          'Check audit trail'
        ],
        expectedResult: 'Workflows execute correctly with proper task assignment and monitoring',
        status: 'Pass' as const,
        priority: 'Medium' as const
      },
      {
        id: 'test-5',
        name: 'API Gateway Integration',
        description: 'Test API gateway functionality including authentication, rate limiting, and monitoring',
        steps: [
          'Test API authentication',
          'Verify rate limiting',
          'Test request routing',
          'Validate response transformation',
          'Check API monitoring',
          'Test developer portal',
          'Verify webhook functionality',
          'Check security features'
        ],
        expectedResult: 'API gateway properly handles requests with security and monitoring',
        status: 'Pass' as const,
        priority: 'Medium' as const
      }
    ]
  },
  
  deployment: {
    agent: 'deployment_manager',
    name: 'Deploy',
    content: 'Production deployment completed successfully. All services are running and monitored.'
  }
};

// Event simulation function
export function simulateWorkflowEvents(
  onEvent: (event: any) => void,
  onComplete: () => void
) {
  const stages = Object.entries(DEMO_STAGES);
  let currentStageIndex = 0;
  
  const simulateStage = () => {
    if (currentStageIndex >= stages.length) {
      onComplete();
      return;
    }
    
    const [stageId, stageData] = stages[currentStageIndex];
    
    // Simulate progress events (0% to 100%)
    for (let progress = 0; progress <= 100; progress += 20) {
      setTimeout(() => {
        // Progress event
        const progressEvent = {
          type: 'ui',
          name: 'progress',
          props: {
            agent_name: stageData.agent,
            content: `Processing ${stageData.name} stage... ${progress}% complete`,
            progress: progress
          }
        };
        
        onEvent(progressEvent);
        
        // Content ready event when progress reaches 100%
        if (progress === 100) {
          setTimeout(() => {
            const contentEvent = {
              type: 'ui',
              name: 'content_ready',
              props: {
                agent_name: stageData.agent,
                content: `${stageData.name} stage completed successfully`,
                stage_data: {
                  stories: 'stories' in stageData ? stageData.stories : undefined,
                  designContent: 'designContent' in stageData ? stageData.designContent : undefined,
                  codeFiles: 'codeFiles' in stageData ? stageData.codeFiles : undefined,
                  testCases: 'testCases' in stageData ? stageData.testCases : undefined
                }
              }
            };
            
            onEvent(contentEvent);
            
            // Move to next stage after content is ready
            currentStageIndex++;
            if (currentStageIndex < stages.length) {
              setTimeout(simulateStage, 2000); // 2 second delay between stages
            } else {
              setTimeout(onComplete, 1000);
            }
          }, 1500);
        }
      }, progress * 200); // 200ms between progress updates
    }
  };
  
  // Start simulation
  simulateStage();
}

// Expected content for each stage
export const EXPECTED_CONTENT = {
  story_generation: {
    title: 'User Stories & Requirements',
    description: 'Detailed user stories with acceptance criteria, priorities, and story points',
    content: 'StoriesContent component displays 5 comprehensive user stories with JIRA IDs, titles, descriptions, acceptance criteria, priorities, and story points. Each story is displayed in a card format with proper styling and organization.',
    trigger: 'content_ready event with stage_data.stories array'
  },
  
  design_generation: {
    title: 'System Architecture & Design',
    description: 'Comprehensive system design documentation including architecture, database schema, and UI/UX guidelines',
    content: 'DesignContent component displays markdown-formatted design documentation covering system architecture, technology stack, UI/UX design system, database schema, security architecture, and deployment strategy.',
    trigger: 'content_ready event with stage_data.designContent string'
  },
  
  code_generation: {
    title: 'Code Implementation',
    description: 'File tree structure and code examples for the application',
    content: 'CodeContent component displays a file tree with code files and directories. Users can click on files to view their content with syntax highlighting. Includes package.json, TypeScript files, and component structure.',
    trigger: 'content_ready event with stage_data.codeFiles array'
  },
  
  testing: {
    title: 'Test Cases & Quality Assurance',
    description: 'Comprehensive test cases covering all application functionality',
    content: 'TestContent component displays 5 detailed test cases with descriptions, steps, expected results, status, and priority. Each test case is organized in a card format with clear structure.',
    trigger: 'content_ready event with stage_data.testCases array'
  },
  
  deployment: {
    title: 'Production Deployment',
    description: 'Deployment status and monitoring information',
    content: 'DefaultContent component displays deployment status and monitoring information for the production environment.',
    trigger: 'content_ready event with stage_data.content string'
  }
}; 