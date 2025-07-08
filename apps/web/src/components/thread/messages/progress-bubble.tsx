import clsx from "clsx";

export function ProgressBubble({ content, agentName }: { content?: string; agentName?: string }) {
  return (
    <div className={clsx(
      "flex items-start gap-2",
      "self-start animate-fade-in"
    )}>
      <div className="thinking-bubble">
        <div className="flex items-center">
          {content && <span className="progress-content mr-3">{content}</span>}
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
      <style jsx>{`
        .thinking-bubble {
          position: relative;
          display: inline-flex;
          align-items: center;
          padding: 6px 16px;
          background-color: #f3f4f5;
          border-radius: 20px;
          margin: 4px 0;
          min-width: 60px;
          box-shadow: 0 2px 8px 0 rgba(0,0,0,0.04);
          overflow: hidden;
        }
        .thinking-bubble::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: 0;
          background: linear-gradient(
            120deg,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.7) 50%,
            rgba(255,255,255,0) 100%
          );
          background-size: 200% 100%;
          animation: shimmer-bg 3s infinite linear;
        }
        @keyframes shimmer-bg {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .thinking-bubble > div {
          position: relative;
          z-index: 1;
        }
        .progress-content {
          color: #222;
          font-size: 1rem;
          font-weight: 500;
          white-space: pre-line;
        }
        .dot {
          width: 8px;
          height: 8px;
          margin: 0 2px;
          background-color: #555;
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