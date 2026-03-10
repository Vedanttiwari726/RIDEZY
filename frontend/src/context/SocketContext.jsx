import React, { createContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext(null);

const SocketProvider = ({ children }) => {

  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {

    if (socketRef.current) return;

    const token =
      localStorage.getItem("captainToken") ||
      localStorage.getItem("token") ||
      null;

    const BASE_URL =
      import.meta.env.VITE_BASE_URL ||
      "http://localhost:3000";

    const socketInstance = io(BASE_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      timeout: 20000
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);



    /* ================= JOIN ================= */

    const joinUserOrCaptain = () => {

      const captainId = localStorage.getItem("captainId");
      const userId = localStorage.getItem("userId");

      if (captainId) {

        socketInstance.emit("join", {
          userId: captainId,
          userType: "captain"
        });

        console.log("Captain joined socket:", captainId);

      }

      if (userId) {

        socketInstance.emit("join", {
          userId: userId,
          userType: "user"
        });

        console.log("User joined socket:", userId);

      }

    };



    /* ================= CONNECT ================= */

    socketInstance.on("connect", () => {

      console.log("Socket connected:", socketInstance.id);

      setConnected(true);

      joinUserOrCaptain();

    });



    /* ================= RECONNECT ================= */

    socketInstance.on("reconnect", () => {

      console.log("Socket reconnected:", socketInstance.id);

      joinUserOrCaptain();

    });



    /* ================= DISCONNECT ================= */

    socketInstance.on("disconnect", (reason) => {

      console.log("Socket disconnected:", reason);

      setConnected(false);

    });



    /* ================= ERROR ================= */

    socketInstance.on("connect_error", (err) => {

      console.log("Socket connection error:", err.message);

    });



    return () => {

      if (socketRef.current) {

        socketRef.current.removeAllListeners();

        socketRef.current.disconnect();

        socketRef.current = null;

      }

    };

  }, []);

  return (

    <SocketContext.Provider value={{ socket, connected }}>

      {children}

    </SocketContext.Provider>

  );

};

export default SocketProvider;