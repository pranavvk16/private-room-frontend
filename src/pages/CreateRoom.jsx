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
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Create a Room</h1>
        <p className="text-sm text-slate-700 dark:text-slate-200">
          Name it, set limits, and share the invite. Nothing extra.
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
              className="app-input input-focus mt-2 w-full px-4 py-3 text-sm"
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
              className="app-input input-focus mt-2 w-full px-4 py-3 text-sm"
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
              className="app-input input-focus mt-2 w-full px-4 py-3 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-18px_rgba(15,23,42,0.8)] transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-white/90"
          >
            {loading ? "Creating..." : "Create room"}
          </button>
          {feedback && (
            <p className="text-sm text-emerald-700 dark:text-emerald-100/90">{feedback}</p>
          )}
        </div>

        <div className="info-card space-y-4 rounded-2xl p-4 text-slate-900 dark:text-white">
          <h3 className="text-lg font-semibold">Room details</h3>
          {created?.roomId ? (
            <>
              <InfoRow label="Room ID" value={created.roomId} />
              <InfoRow label="Frontend share link" value={shareLink} />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={copyLink}
                  className="rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-sm font-medium text-slate-900 transition hover:-translate-y-0.5 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                >
                  Copy share link
                </button>
                <a
                  href={`/join/${created.roomId}`}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                >
                  Go to join page
                </a>
              </div>
              {info && (
                <div className="info-card space-y-2 rounded-xl p-3 text-sm text-slate-900 dark:text-white">
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
            <p className="text-sm text-slate-600 dark:text-slate-200">
              Room metadata and the invite link will show here after creation. We log all API
              responses for quick troubleshooting.
            </p>
          )}
        </div>
      </form>
    </section>
  );
};
