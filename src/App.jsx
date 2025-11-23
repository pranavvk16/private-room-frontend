import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import { DarkModeToggle } from "./components/DarkModeToggle";
import { ChatRoom } from "./pages/ChatRoom";
import { CreateRoom } from "./pages/CreateRoom";
import { JoinRoom } from "./pages/JoinRoom";

const NavLinkItem = ({ to, label }) => {
  const location = useLocation();
  const active = location.pathname === to || location.pathname === `${to}/`;

  return (
    <NavLink
      to={to}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-slate-900 text-white shadow-lg dark:bg-white dark:text-slate-900"
          : "bg-slate-900/5 text-slate-900 hover:bg-slate-900/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
      }`}
    >
      {label}
    </NavLink>
  );
};

const App = () => {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-[#0b1021] dark:text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/30 bg-white/80 p-6 text-slate-900 shadow-xl backdrop-blur md:flex-row md:items-center md:justify-between dark:border-white/10 dark:bg-white/5 dark:text-white">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-sky-700/80 dark:text-sky-200/80">
              Horizon Chat
            </p>
            <h1 className="mt-2 text-3xl font-bold">Realtime MERN Chat Room</h1>
            <p className="text-sm text-slate-600 dark:text-slate-200/80">
              React + Vite + Socket.IO client with Context, Tailwind, and full logging.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <NavLinkItem to="/" label="Create" />
            <NavLinkItem to="/join" label="Join" />
            <NavLinkItem to="/chat" label="Chat" />
            <DarkModeToggle />
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
