import { createContext, useContext, useState, useEffect } from "react";
import { connectWebSocket } from "../services/websocket";

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [newNotifications, setNewNotifications] = useState();

  useEffect(() => {
    const socket = connectWebSocket(
      "/ws/notification",
      (data) => {
        // console.log("Received WebSocket message from server:", data.status);
        // if (data.type === "createTour") {
        setNewNotifications(data.status);
        // }
      },
      () => console.log("Disconnected from websocket")
    );

    return () => {
      socket.close();
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ newNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
