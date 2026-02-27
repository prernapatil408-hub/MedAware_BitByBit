import { io } from "socket.io-client";

export const socket = io("http://192.168.0.114:8080", {
  withCredentials: true,           // ← Sends login session
  transports: ['websocket' , 'polling'],       // ← RN needs this
  timeout: 2000,
  reconnection: true,
  reconnectionAttempts: 5
});

socket.on("connect", () => {
  console.log("✅ SOCKET LIVE:", socket.id);
});

socket.on("success", (data) => {
  console.log("🟢 Backend ready:", data);
});
