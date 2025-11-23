import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { joinRoom } from "../services/api";
import { socket, setSocketSession } from "../services/socket";
import { useUser } from "../contexts/UserContext";
import { log } from "../utils/logger";

export const JoinRoom = () => {
  const navigate = useNavigate();
  const { roomId: roomIdFromUrl } = useParams();
  const { nickname: storedName, roomId: storedRoom, setNickname, setRoomId } = useUser();

  const [roomId, setRoomIdInput] = useState(roomIdFromUrl || storedRoom || "");
  const [nickname, setNicknameInput] = useState(storedName || "");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (roomIdFromUrl) setRoomIdInput(roomIdFromUrl);
  }, [roomIdFromUrl]);

  const submit = async (e) => {
    e.preventDefault();
    setFeedback("");
    setLoading(true);

    try {
      log("Attempting room join", roomId);
      await joinRoom({ roomId });
      setNickname(nickname);
      setRoomId(roomId);
      setSocketSession(roomId, nickname);

      if (socket.connected) {
        socket.emit("joinRoom", { roomId, username: nickname });
      }

      log("Join success", roomId);
      navigate("/chat");
    } catch (error) {
      const status = error?.status;
      const reason =
        status === 400
          ? "Check the room code."
          : status === 404
            ? "Room not found."
            : status === 410
              ? "Room expired."
              : status === 429
                ? "Room is full."
                : "Unable to join room.";
      setFeedback(`${reason} ${error?.message || ""}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="glass-card w-full max-w-3xl p-8 text-slate-900 dark:text-white">
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Join a Room</h1>
        <p className="text-slate-600 dark:text-slate-200/80">
          Enter a room ID and a temporary nickname. We log success and failure so you can debug
          quickly.
        </p>
      </div>
      <form className="space-y-5" onSubmit={submit}>
        <div>
          <label className="block text-sm font-medium text-slate-800 dark:text-slate-100">
            Room ID
          </label>
          <input
            value={roomId}
            onChange={(e) => setRoomIdInput(e.target.value)}
            className="input-focus mt-2 w-full rounded-xl border border-white/40 bg-white/70 px-4 py-3 text-sm text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
            placeholder="Paste room code"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-800 dark:text-slate-100">
            Nickname
          </label>
          <input
            value={nickname}
            onChange={(e) => setNicknameInput(e.target.value)}
            className="input-focus mt-2 w-full rounded-xl border border-white/40 bg-white/70 px-4 py-3 text-sm text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
            placeholder="Your handle"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Joining..." : "Join room"}
        </button>
        {feedback && (
          <p className="text-sm text-amber-700 dark:text-amber-100/90">{feedback}</p>
        )}
      </form>
    </section>
  );
};
