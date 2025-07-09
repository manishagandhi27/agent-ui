import { CheckCircle } from 'lucide-react';

export function AiResponseBubble({ content }: { content?: string }) {
  if (!content) {
    console.warn("AiResponseBubble received undefined content");
    return null;
  }
  
  return (
    <div className="flex items-center gap-2 self-start animate-fade-in">
      <div className="flex items-center px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-800 text-white shadow-md max-w-xs border-l-4 border-emerald-400">
        <CheckCircle className="w-4 h-4 text-emerald-300 mr-2" />
        <span className="font-semibold">{content}</span>
      </div>
    </div>
  );
} 