import { io } from "socket.io-client";
import { log } from "../utils/logger";

const API_URL = import.meta.env.VITE_API_URL;

export const socket = io(API_URL, {
  transports: ["websocket"],
  autoConnect: true,
});

let session = { roomId: null, username: null };

socket.on("connect", () => {
  log("[SOCKET] connected", socket.id);
  if (session.roomId && session.username) {
    log("[SOCKET] rejoining room after reconnect");
    socket.emit("joinRoom", { roomId: session.roomId, username: session.username });
  }
});

socket.on("disconnect", (reason) => {
  log("[SOCKET] disconnected", reason);
});

socket.io.on("reconnect_attempt", (attempt) => log("[SOCKET] reconnect attempt", attempt));
socket.io.on("error", (err) => log("[SOCKET] transport error", err?.message || err));

export const setSocketSession = (roomId, username) => {
  session = { roomId, username };
  if (socket.connected && roomId && username) {
    socket.emit("joinRoom", { roomId, username });
  }
};

export const clearSocketSession = () => {
  session = { roomId: null, username: null };
};
