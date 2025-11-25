import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import { ChatRoom } from "./pages/ChatRoom";
import { CreateRoom } from "./pages/CreateRoom";
import { JoinRoom } from "./pages/JoinRoom";

const NavLinkItem = ({ to, label }) => {
  const location = useLocation();
  const active = location.pathname === to || location.pathname === `${to}/`;
  return (
    <NavLink
      to={to}
      className={`pill-surface inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium shadow-lg transition hover:-translate-y-0.5 hover:brightness-110 ${
        active
          ? "bg-slate-900 text-white ring-1 ring-slate-900/30 dark:bg-white dark:text-slate-900 dark:ring-white/50"
          : "bg-slate-900/5 text-slate-900 hover:bg-slate-900/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
      }`}
    >
      {label}
    </NavLink>
  );
};

const App = () => {
  return (
    <div className="min-h-screen px-4 py-8 text-slate-900 dark:text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="glass-card flex flex-col gap-4 rounded-[28px] p-6 text-slate-900 md:flex-row md:items-center md:justify-between dark:text-white">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.32em] text-sky-700/80 dark:text-sky-200/80">
              Horizon
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">Minimal realtime chat</h1>
            <p className="text-sm text-slate-700 dark:text-slate-200">
              Create a room, invite a friend, and keep the thread clean.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <NavLinkItem to="/" label="Create" />
            <NavLinkItem to="/join" label="Join" />
            <NavLinkItem to="/chat" label="Chat" />
          </div>
        </header>

        <Routes>
          <Route path="/" element={<CreateRoom />} />
          <Route path="/join" element={<JoinRoom />} />
          <Route path="/join/:roomId" element={<JoinRoom />} />
          <Route path="/chat" element={<ChatRoom />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
