import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageInput } from "../components/MessageInput";
import { MessageList } from "../components/MessageList";
import { TypingIndicator } from "../components/TypingIndicator";
import { useUser } from "../contexts/UserContext";
import { getRoomInfo, joinRoom } from "../services/api";
import { clearSocketSession, setSocketSession, socket } from "../services/socket";
import { log } from "../utils/logger";

const useCountdown = (expiresAt, onExpire) => {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!expiresAt) return undefined;
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      setRemaining(diff > 0 ? diff : 0);
      if (diff <= 0 && onExpire) onExpire();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpire]);

  return remaining;
};

const playTone = (freq = 440) => {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.value = 0.05;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
};

export const ChatRoom = () => {
  const navigate = useNavigate();
  const { nickname, roomId } = useUser();
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [roomInfo, setRoomInfo] = useState(null);
  const [connected, setConnected] = useState(socket.connected);
  const [expired, setExpired] = useState(false);
  const [error, setError] = useState("");
  const [activeUsers, setActiveUsers] = useState(0);
  const [muted, setMuted] = useState(false);
  const bootstrapped = useRef(false);

  const countdownMs = useCountdown(
    roomInfo?.expiresAt,
    () => setExpired(true),
  );

  const countdownLabel = useMemo(() => {
    if (countdownMs === null) return "";
    const totalSeconds = Math.max(0, Math.floor(countdownMs / 1000));
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [countdownMs]);

  useEffect(() => {
    if (!roomId || !nickname) {
      navigate("/join");
      return;
    }

    if (bootstrapped.current) return;
    bootstrapped.current = true;

    const hydrate = async () => {
      try {
        const info = await getRoomInfo(roomId);
        setRoomInfo(info);
        setExpired(Boolean(info.isExpired));
      } catch (err) {
        setError(err?.message || "Room lookup failed.");
        navigate("/join");
      }

      try {
        await joinRoom({ roomId });
      } catch (err) {
        log("[CLIENT] join check failed", err);
      }

      setSocketSession(roomId, nickname);
      if (socket.connected) {
        socket.emit("joinRoom", { roomId, username: nickname });
      }
    };

    hydrate();
  }, [roomId, nickname, navigate]);

  useEffect(() => {
    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    const handleMessage = (payload) => {
      log("[SOCKET] message", payload);
      setMessages((prev) => [...prev, payload]);
      if (!muted && payload.username !== nickname) playTone(520);
    };

    const handleUserJoined = (payload) => {
      log("[SOCKET] userJoined", payload);
      setActiveUsers(payload?.activeUsers || 0);
      setMessages((prev) => [
        ...prev,
        { ...payload, type: "system", text: `${payload.username} joined` },
      ]);
      if (!muted) playTone(650);
    };

    const handleUserLeft = (payload) => {
      log("[SOCKET] userLeft", payload);
      setActiveUsers(payload?.activeUsers || 0);
      setMessages((prev) => [
        ...prev,
        { ...payload, type: "system", text: `${payload.username} left` },
      ]);
      if (!muted) playTone(280);
    };

    const handleTyping = (payload) => {
      setTypingUsers((prev) => ({
        ...prev,
        [payload.userId]: payload.username,
      }));
    };

    const handleStopTyping = (payload) => {
      setTypingUsers((prev) => {
        const clone = { ...prev };
        delete clone[payload.userId];
        return clone;
      });
    };

    const handleError = (payload) => {
      setError(payload?.message || "Socket error");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("message", handleMessage);
    socket.on("userJoined", handleUserJoined);
    socket.on("userLeft", handleUserLeft);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
    socket.on("error", handleError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("message", handleMessage);
      socket.off("userJoined", handleUserJoined);
      socket.off("userLeft", handleUserLeft);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      socket.off("error", handleError);
      clearSocketSession();
    };
  }, [nickname, muted]);

  const sendMessage = (text) => {
    const payload = {
      userId: socket.id,
      username: nickname,
      text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, payload]);
    socket.emit("message", { text });
    log("[SOCKET] send message", payload);
  };

  const handleExpireExit = () => {
    navigate("/join");
  };

  const typingNames = Object.values(typingUsers).filter((name) => name !== nickname);

  useEffect(() => {
    if (expired) {
      socket.disconnect();
      setConnected(false);
    }
  }, [expired]);

  return (
    <section className="glass-card w-full max-w-6xl p-6 text-slate-900 dark:text-white">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-sky-600/80 dark:text-sky-200/80">
            Room
          </p>
          <h1 className="text-3xl font-bold">{roomInfo?.name || roomId}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-200/80">
            <span className={`rounded-full px-3 py-1 ${connected ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
              {connected ? "Connected" : "Disconnected"}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1">Users: {activeUsers || "—"}</span>
            <span className="rounded-full bg-white/70 px-3 py-1 text-slate-900 dark:bg-white/10 dark:text-white">
              Expires in: {roomInfo?.isExpired ? "Expired" : countdownLabel || "—"}
            </span>
            <span className="rounded-full bg-white/70 px-3 py-1 text-slate-900 dark:bg-white/10 dark:text-white">
              You: {nickname}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-white/40 dark:hover:bg-white/10"
          >
            {muted ? "Unmute alerts" : "Mute alerts"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/join")}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-white/40 dark:hover:bg-white/10"
          >
            Leave
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-amber-300/40 bg-amber-400/10 p-3 text-sm text-amber-100">
          {error}
        </div>
      )}

      <MessageList messages={messages} currentUser={nickname} />
      <TypingIndicator users={typingNames} />
      <div className="mt-3">
        <MessageInput
          onSend={sendMessage}
          onTypingStart={() => socket.emit("typing", { roomId, username: nickname })}
          onTypingStop={() => socket.emit("stopTyping", { roomId, username: nickname })}
          disabled={!connected || expired}
          placeholder={expired ? "Room expired" : "Send a message"}
        />
      </div>

      {expired && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-slate-900 p-6 text-center text-white shadow-2xl">
            <h3 className="text-2xl font-semibold">Room expired</h3>
            <p className="text-slate-200/80">
              This chat room can no longer accept messages. We disconnected you from the socket.
            </p>
            <button
              type="button"
              onClick={handleExpireExit}
              className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
            >
              Back to join
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
