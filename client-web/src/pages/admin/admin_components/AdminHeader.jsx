import React, { useContext, useEffect, useState } from "react";
import NotificationOverview from "./NotificationOverview";
import { Context } from "../../../context/ContextProvider";
import axios from "axios";

const AdminHeader = () => {
  const { user, newNotifications, resetNotifications } = useContext(Context);

  // Toggle list notification overview
  const [notificationOverview, setNotificationOverview] = useState(false);

  // Tổng số noti unread
  const [unReadNotificationCount, setUnReadNotificationCount] = useState(0);

  // hàm fetch ds noti
  const fetchNotifications = () => {
    axios
      .get("http://localhost:5000/notification")
      .then((response) => {
        let unreadCount = 0;

        response.data.forEach((noti) => {
          // Check if readBy array doesn't include the current user's ID
          const isRead = noti.readBy.some(
            (readUser) => readUser.userId === user?.user._id
          );

          if (!isRead) {
            unreadCount += 1;
          }
        });

        setUnReadNotificationCount(unreadCount);
      })
      .catch((error) => {
        console.error("Error fetching notifications:", error);
      });
  };

  // fetch mỗi khi component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // fetch mỗi khi nhận newNotifications từ websocket
  useEffect(() => {
    if (newNotifications) {
      fetchNotifications();
      resetNotifications();
    }
  }, [newNotifications]);

  return (
    <nav className="adminHeader">
      <div className="adminIcon">
        <div
          // onMouseEnter={() => setNotificationOverview(true)}
          // onMouseLeave={() => setNotificationOverview(false)}
          onClick={() => setNotificationOverview(!notificationOverview)}
          className="notificationIcon"
        >
          <i className="bx bxs-bell adminIconBell"></i>

          {unReadNotificationCount > 0 && (
            <div className="notificationDot">{unReadNotificationCount}</div>
          )}

          {notificationOverview && <NotificationOverview />}
        </div>

        <div className="adminAvatarWrapper">
          <img src={user?.user?.avatar} alt="Avatar" className="adminAvatar" />
        </div>
      </div>
    </nav>
  );
};

export default AdminHeader;
