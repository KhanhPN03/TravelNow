import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { connectWebSocket } from "../services/websocket";

export const Context = createContext(null);

const ContextProvider = ({ children }) => {
  const [user, setUser] = useState(undefined);
  const [newNotifications, setNewNotifications] = useState();
  const navigate = useNavigate();

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      setUser({ token, user: JSON.parse(user) });
    } else {
      setUser(null);
    }
  }, []);

  // WebSocket for notifications
  useEffect(() => {
    const socket = connectWebSocket(
      "/ws/notification",
      (data) => {
        setNewNotifications(false);
        setNewNotifications(data.status);
      },
      () => console.log("Disconnected from websocket")
    );

    return () => {
      socket.close();
    };
  }, []);

  // Login function
  const login = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser({ token, user });

    // Redirect user based on role
    if (user.role === "admin" || user.role === "superAdmin") {
      navigate("/admin/dashboard");
    } else if (user.role === "guide") {
      navigate("/guide/attendance");
    } else {
      navigate("/");
    }
  };

  // Logout function
  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

  // Function to reset newNotifications after it's consumed
  const resetNotifications = () => {
    setNewNotifications(null);
  };

  return (
    <Context.Provider value={{ user, login, logout, newNotifications, resetNotifications }}>
      {user === undefined ? <div>Loading...</div> : children}
    </Context.Provider>
  );
};

export default ContextProvider;
