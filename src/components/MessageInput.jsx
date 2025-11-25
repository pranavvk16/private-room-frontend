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
    <form
      onSubmit={handleSubmit}
      className="input-surface flex items-center gap-3 rounded-[18px] bg-white px-4 py-3 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.6)] backdrop-blur-lg dark:bg-[#0c1424]/70"
    >
      <input
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          handleTypingStart();
        }}
        className="app-input input-focus w-full px-4 py-3 text-sm"
        placeholder={placeholder}
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-18px_rgba(15,23,42,0.8)] transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-sky-500 dark:text-white dark:hover:bg-sky-400"
      >
        Send
      </button>
    </form>
  );
};
