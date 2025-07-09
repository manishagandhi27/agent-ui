import { Sparkles } from 'lucide-react';

export function AiResponseBubble({ content }: { content?: string }) {
  if (!content) {
    console.warn("AiResponseBubble received undefined content");
    return null;
  }
  
  return (
    <div className="flex items-center gap-2 self-start animate-fade-in">
      <div className="flex items-center px-4 py-3 rounded-xl bg-white/80 backdrop-blur-sm text-slate-800 shadow-lg max-w-sm border-2 border-emerald-400/60 hover:border-emerald-500/80 transition-colors duration-200">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span className="font-medium text-sm leading-relaxed">{content}</span>
        </div>
      </div>
    </div>
  );
} 