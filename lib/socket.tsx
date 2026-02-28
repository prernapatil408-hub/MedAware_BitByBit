import { io } from "socket.io-client";

export const socket = io("http://10.203.52.34:8080", {
  withCredentials: true,           // ← Sends login session
  transports: ['websocket' , 'polling'],       // ← RN needs this
  timeout: 60000, // Increase to 10 seconds
  reconnectionDelay: 1000,
  reconnection: true,
  reconnectionAttempts: 5,
});

socket.on("connect", () => {
  console.log("✅ SOCKET LIVE:", socket.id);

});

socket.on("success", (data) => {
  console.log("🟢 Backend ready:", data);
});

socket.on("app_error",(data)=>{
   console.log(data.message);
})