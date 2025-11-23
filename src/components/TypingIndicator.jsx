export const TypingIndicator = ({ users = [] }) => {
  if (!users.length) return null;

  const label =
    users.length === 1
      ? `${users[0]} is typing...`
      : `${users.slice(0, 2).join(", ")}${users.length > 2 ? " and others" : ""} are typing...`;

  return (
    <div className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-700 dark:text-slate-200">
      {label}
    </div>
  );
};
