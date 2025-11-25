import { useEffect, useRef } from "react";

const formatTime = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const MessageList = ({ messages, currentUser }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="scrollbar-thin chat-surface h-[60vh] max-h-[70vh] w-full overflow-y-auto rounded-[22px] bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-lg dark:border-white/15 dark:bg-[#0d1628]/80 dark:text-white"
    >
      {messages.length === 0 ? (
        <p className="text-center text-sm text-slate-600 dark:text-slate-300">Start the conversation.</p>
      ) : (
        <ul className="space-y-3">
          {messages.map((msg, idx) => {
            const isOwn = msg.username && msg.username === currentUser;
            const isSystem = msg.type === "system";
            return (
              <li
                key={`${msg.timestamp || idx}-${msg.userId || idx}`}
                className={`flex flex-col ${
                  isOwn ? "items-end" : isSystem ? "items-center" : "items-start"
                }`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 shadow-sm ${
                    isSystem
                      ? "bg-slate-100 text-slate-700 dark:border dark:border-white/12 dark:bg-white/10 dark:text-white"
                      : isOwn
                        ? "bg-gradient-to-br from-sky-500 to-blue-600 text-white"
                        : "border border-slate-200/80 bg-white text-slate-900 dark:border-white/15 dark:bg-[#0f1b30] dark:text-white"
                  }`}
                >
                  {!isSystem && (
                    <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-600 dark:text-white/70">
                      <span className="font-semibold">{isOwn ? "You" : msg.username}</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <span className="mt-1 block text-right text-[11px] text-slate-600 dark:text-white/70">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
