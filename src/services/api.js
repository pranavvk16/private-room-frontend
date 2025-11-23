import { log } from "../utils/logger";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const inFlight = new Set();

const parseResponse = async (response, label) => {
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  log(`[API] ${label} response`, response.status, data);

  if (!response.ok) {
    const error = new Error(data?.message || "Request failed");
    error.status = response.status;
    error.payload = data;
    throw error;
  }

  return data;
};

const request = async (path, { method = "GET", body } = {}) => {
  const url = `${API_URL}${path}`;
  const label = `${method} ${path}`;
  if (inFlight.has(label)) {
    log("[API] Ignoring duplicate request", label);
    return null;
  }

  inFlight.add(label);
  log("[API] Request", label, body || "");

  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    return await parseResponse(response, label);
  } catch (error) {
    log("[API] Error", label, error?.status || "", error.message);
    throw error;
  } finally {
    inFlight.delete(label);
  }
};

export const createRoom = ({ roomName, expiresInMinutes, maxUsers }) =>
  request("/room/create", {
    method: "POST",
    body: { roomName, expiresInMinutes, maxUsers },
  });

export const joinRoom = ({ roomId }) =>
  request("/room/join", {
    method: "POST",
    body: { roomId },
  });

export const getRoomInfo = (roomId) => request(`/room/info/${roomId}`);
