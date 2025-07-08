import { Zap } from 'lucide-react';
import clsx from "clsx";

export function ProgressBubble({ content, agentName }: { content?: string; agentName?: string }) {
  return (
    <div className={clsx(
      "flex items-start gap-2",
      "self-start animate-fade-in"
    )}>
      <div className="relative flex items-center px-4 py-2 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md max-w-xs border-l-4 border-emerald-500">
        <span className="mr-2 text-emerald-400 flex items-center">
          <Zap className="w-4 h-4" />
        </span>
        <div className="flex items-center">
          {content && <span className="progress-content mr-3">{content}</span>}
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
      <style jsx>{`
        .progress-content {
          color: #fff;
          font-size: 1rem;
          font-weight: 500;
          white-space: pre-line;
        }
        .dot {
          width: 8px;
          height: 8px;
          margin: 0 2px;
          background-color: #34d399;
          border-radius: 50%;
          animation: blink 1.2s infinite ease-in-out both;
        }
        .dot:nth-child(2) { animation-delay: 0s; }
        .dot:nth-child(3) { animation-delay: 0.2s; }
        .dot:nth-child(4) { animation-delay: 0.4s; }
        @keyframes blink {
          0%, 80%, 100% { transform: scale(0.5); opacity: 0.4; }
          40%          { transform: scale(1);   opacity: 1;   }
        }
      `}</style>
    </div>
  );
} 