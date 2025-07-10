import { Loader2 } from 'lucide-react';

export function ProgressBubble({ content, agentName }: { content?: string; agentName?: string }) {
  return (
    <div className="flex items-center gap-2 self-start animate-fade-in">
      <div className="flex items-center px-4 py-3 rounded-xl bg-white/80 backdrop-blur-sm text-slate-800 shadow-lg max-w-sm border-2 border-orange-400/60 hover:border-orange-500/80 transition-colors duration-200">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
          <span className="font-medium text-sm leading-relaxed">{content || 'Processing...'}</span>
        </div>
      </div>
    </div>
  );
} 