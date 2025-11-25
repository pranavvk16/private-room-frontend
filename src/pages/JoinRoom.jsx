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
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-50">Join a Room</h1>
        <p className="text-sm text-slate-700 dark:text-slate-200">
          Drop in with a room code and a short nickname. You can leave anytime.
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
            className="app-input input-focus mt-2 w-full px-4 py-3 text-sm"
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
            className="app-input input-focus mt-2 w-full px-4 py-3 text-sm"
            placeholder="Your handle"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-18px_rgba(15,23,42,0.8)] transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-60 dark:bg-sky-500 dark:text-white dark:hover:bg-sky-400"
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
