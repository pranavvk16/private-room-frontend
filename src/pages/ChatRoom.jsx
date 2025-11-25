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

  const infoCardClass = "info-card rounded-2xl p-3 text-sm text-slate-900 dark:border-white/15 dark:bg-white/5 dark:text-white";
  const infoLabelClass = "text-[11px] uppercase tracking-wide text-slate-600 dark:text-slate-200/90";
  const infoValueClass = "mt-1 text-base font-semibold text-slate-900 dark:text-white";

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
    };

    hydrate();
  }, [roomId, nickname, navigate]);

  useEffect(() => {
    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    const appendMessage = (payload) => {
      setMessages((prev) => {
        if (payload.timestamp && payload.userId) {
          const duplicate = prev.some(
            (msg) =>
              msg.userId === payload.userId &&
              msg.text === payload.text &&
              msg.timestamp === payload.timestamp,
          );
          if (duplicate) return prev;
        }
        return [...prev, payload];
      });
    };

    const handleMessage = (payload) => {
      log("[SOCKET] message", payload);
      appendMessage(payload);
      if (!muted && payload.username !== nickname) playTone(520);
    };

    const handleUserJoined = (payload) => {
      log("[SOCKET] userJoined", payload);
      setActiveUsers(payload?.activeUsers || 0);
      appendMessage({ ...payload, type: "system", text: `${payload.username} joined` });
      if (!muted) playTone(650);
    };

    const handleUserLeft = (payload) => {
      log("[SOCKET] userLeft", payload);
      setActiveUsers(payload?.activeUsers || 0);
      appendMessage({ ...payload, type: "system", text: `${payload.username} left` });
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
    const payload = { userId: socket.id, username: nickname, text, timestamp: Date.now() };
    socket.emit("message", { text, timestamp: payload.timestamp });
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
    <section className="glass-card w-full max-w-6xl p-6 text-slate-900 dark:text-white md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.32em] text-sky-700/80 dark:text-sky-200/80">
            Room
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">{roomInfo?.name || roomId}</h1>
          <p className="text-sm text-slate-700 dark:text-slate-200/70">
            Keep it focused. Messages are live and tidy.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            className="pill-surface rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition hover:-translate-y-0.5 hover:brightness-110"
          >
            {muted ? "Unmute alerts" : "Mute alerts"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/join")}
            className="pill-surface rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition hover:-translate-y-0.5 hover:brightness-110"
          >
            Leave
          </button>
        </div>
      </div>

      <div className="mt-4 text-[11px] uppercase tracking-[0.28em] text-slate-600 dark:text-slate-300">
        Overview
      </div>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className={infoCardClass}>
          <p className={infoLabelClass}>Status</p>
          <p
            className={`mt-1 text-base font-semibold ${
              connected ? "text-emerald-600 dark:text-emerald-300" : "text-amber-500 dark:text-amber-200"
            }`}
          >
            {connected ? "Connected" : "Disconnected"}
          </p>
        </div>
        <div className={infoCardClass}>
          <p className={infoLabelClass}>Active</p>
          <p className={infoValueClass}>{activeUsers || "—"} user(s)</p>
        </div>
        <div className={infoCardClass}>
          <p className={infoLabelClass}>Time left</p>
          <p className={infoValueClass}>{roomInfo?.isExpired ? "Expired" : countdownLabel || "—"}</p>
        </div>
        <div className={infoCardClass}>
          <p className={infoLabelClass}>You</p>
          <p className={infoValueClass}>{nickname}</p>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-900 dark:text-amber-100">
          {error}
        </div>
      )}

      <div className="mt-6 text-[11px] uppercase tracking-[0.28em] text-slate-600 dark:text-slate-300">
        Thread
      </div>
      <div className="mt-2">
        <MessageList messages={messages} currentUser={nickname} />
      </div>
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
