import { useEffect, useRef, useState } from "react";

export const MessageInput = ({
  onSend,
  onTypingStart,
  onTypingStop,
  disabled,
  placeholder = "Type a message...",
}) => {
  const [text, setText] = useState("");
  const typingTimeout = useRef(null);

  useEffect(() => () => clearTimeout(typingTimeout.current), []);

  const handleTypingStart = () => {
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    onTypingStart?.();
    typingTimeout.current = setTimeout(() => {
      onTypingStop?.();
    }, 1200);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value || disabled) return;
    onSend?.(value);
    setText("");
    onTypingStop?.();
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card flex items-center gap-3 px-4 py-3">
      <input
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          handleTypingStart();
        }}
        className="input-focus w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/50"
        placeholder={placeholder}
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-sky-400 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Send
      </button>
    </form>
  );
};
