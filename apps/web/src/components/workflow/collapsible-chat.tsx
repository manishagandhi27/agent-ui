import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react';
import { SidePanelChat } from './side-panel-chat';

interface CollapsibleChatProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
  onNewEpicDetected?: (epicId: string) => void; // Callback to reset workflow with Epic ID
}

export function CollapsibleChat({ isOpen, onToggle, className, onNewEpicDetected }: CollapsibleChatProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Calculate chat panel width and style
  const chatPanelStyle = isExpanded
    ? {
        width: 'min(100vw, 900px)',
        right: 0,
        left: 'unset',
        maxHeight: 'calc(100vh - 80px)',
        height: 'calc(100vh - 80px)',
        top: '80px',
      }
    : {
        width: 'min(400px, 90vw)',
        right: 0,
        left: 'unset',
        maxHeight: 'calc(100vh - 80px)',
        height: 'calc(100vh - 80px)',
        top: '80px',
      };

  return (
    <div className={cn("relative", className)}>
      {/* Professional Chat Toggle Button */}
      <motion.button
        onClick={onToggle}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center",
          isOpen && "hidden"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <MessageCircle className="w-7 h-7" />
      </motion.button>

      {/* Professional Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed top-0 right-0 z-30 bg-white shadow-xl border-l border-slate-200 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={chatPanelStyle}
          >
            {/* Professional Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white flex-shrink-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg flex items-center justify-center shadow-sm">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 text-sm">APEX Commander</span>
                    <span className="text-xs text-slate-600">SDLC Workflow Manager</span>
                  </div>
                </motion.div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExpand}
                    className={cn(
                      "w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-800 hover:bg-slate-200 transition-colors",
                      isExpanded && "ring-2 ring-slate-400"
                    )}
                    title={isExpanded ? "Restore" : "Expand"}
                  >
                    {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={onToggle}
                    className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-800 hover:bg-slate-200 transition-colors"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

            {/* Chat Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key="chat-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-h-0"
              >
                <SidePanelChat onNewEpicDetected={onNewEpicDetected} />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No backdrop needed for side panel - keeps main content visible */}
    </div>
  );
} 