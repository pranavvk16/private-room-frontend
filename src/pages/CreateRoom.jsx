import { useState } from "react";
import { createRoom, getRoomInfo } from "../services/api";
import { log } from "../utils/logger";

const initialForm = { roomName: "", expiresInMinutes: 60, maxUsers: 10 };

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between text-sm text-slate-700 dark:text-slate-100/80">
    <span className="font-medium text-slate-800 dark:text-slate-100">{label}</span>
    <span className="text-slate-700 dark:text-slate-100/80">{value}</span>
  </div>
);

export const CreateRoom = () => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [created, setCreated] = useState(null);
  const [info, setInfo] = useState(null);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const shareLink =
    created?.roomId && typeof window !== "undefined"
      ? `${window.location.origin}/join/${created.roomId}`
      : "";

  const copyLink = async () => {
    if (!shareLink || !navigator?.clipboard) return;
    await navigator.clipboard.writeText(shareLink);
    setFeedback("Share link copied");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback("");
    try {
      const result = await createRoom({
        roomName: form.roomName,
        expiresInMinutes: Number(form.expiresInMinutes),
        maxUsers: Number(form.maxUsers),
      });
      setCreated(result);
      log("[CLIENT] Room created", result);

      if (result?.roomId) {
        const meta = await getRoomInfo(result.roomId);
        setInfo(meta);
      }

      setFeedback("Room created successfully.");
    } catch (error) {
      const status = error?.status;
      const reason =
        status === 400
          ? "Invalid room data."
          : status === 429
            ? "Room limit reached."
            : "Unable to create room.";
      setFeedback(`${reason} ${error?.message || ""}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="glass-card w-full max-w-4xl p-8 text-slate-900 dark:text-white">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create a Room</h1>
        <p className="text-slate-600 dark:text-slate-200/80">
          Spin up a fresh space, then share the invite link built for this frontend.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-800 dark:text-slate-100">
              Room name
            </label>
            <input
              value={form.roomName}
              onChange={(e) => handleChange("roomName", e.target.value)}
              className="input-focus mt-2 w-full rounded-xl border border-white/40 bg-white/70 px-4 py-3 text-sm text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
              placeholder="Team Sync"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800 dark:text-slate-100">
              Expires in (minutes)
            </label>
            <input
              type="number"
              value={form.expiresInMinutes}
              min={5}
              onChange={(e) => handleChange("expiresInMinutes", e.target.value)}
              className="input-focus mt-2 w-full rounded-xl border border-white/40 bg-white/70 px-4 py-3 text-sm text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800 dark:text-slate-100">
              Max users
            </label>
            <input
              type="number"
              min={2}
              value={form.maxUsers}
              onChange={(e) => handleChange("maxUsers", e.target.value)}
              className="input-focus mt-2 w-full rounded-xl border border-white/40 bg-white/70 px-4 py-3 text-sm text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-emerald-400 to-sky-500 px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create room"}
          </button>
          {feedback && (
            <p className="text-sm text-emerald-700 dark:text-emerald-100/90">{feedback}</p>
          )}
        </div>

        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/60 p-4 text-slate-900 dark:bg-white/5 dark:text-white">
          <h3 className="text-lg font-semibold">Room details</h3>
          {created?.roomId ? (
            <>
              <InfoRow label="Room ID" value={created.roomId} />
              <InfoRow label="Frontend share link" value={shareLink} />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={copyLink}
                  className="rounded-lg bg-white/80 px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-white/90 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                >
                  Copy share link
                </button>
                <a
                  href={`/join/${created.roomId}`}
                  className="rounded-lg bg-sky-500/90 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-sky-400"
                >
                  Go to join page
                </a>
              </div>
              {info && (
                <div className="space-y-2 rounded-xl border border-white/10 bg-white/70 p-3 text-sm text-slate-900 dark:bg-white/5 dark:text-white">
                  <InfoRow label="Name" value={info.name} />
                  <InfoRow label="Max users" value={info.maxUsers} />
                  <InfoRow
                    label="Expires at"
                    value={new Date(info.expiresAt).toLocaleString()}
                  />
                  <InfoRow label="Expired?" value={info.isExpired ? "Yes" : "No"} />
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-200/70">
              Room metadata and the invite link will show here after creation. We log all API
              responses for quick troubleshooting.
            </p>
          )}
        </div>
      </form>
    </section>
  );
};
