import React, { useContext, useEffect, useState } from "react";
import SidebarNavigate from "./admin_components/SidebarNavigate";
import AdminHeader from "./admin_components/AdminHeader";
import axios from "axios";
import Notification from "./admin_components/NotificationItem";
import PlaceHolder from "./admin_components/PlaceHolder";
import { Context } from "../../context/ContextProvider";

const TabTransform = ({
  activeTab,
  setActiveTab,
  unreadAdminNotiCount,
  unreadCusNotiCount,
  filterMode,
  setFilterMode,
}) => {
  return (
    <div className="tabTransformAdmin notificationManage">
      <div className="notificationManageLeftButtonsWrapper">
        <div
          className={`tabTransformLeft notificationTab ${
            activeTab === "admin" ? "active" : ""
          }`}
          onClick={() => setActiveTab("admin")}
        >
          <button>
            <h4>Admin</h4>
            <div className="notificationTab unreadNotiCountWrapper">
              {unreadAdminNotiCount}
            </div>
          </button>
        </div>
        <div
          className={`tabTransformRight notificationTab ${
            activeTab === "customer" ? "active" : ""
          }`}
          onClick={() => setActiveTab("customer")}
        >
          <button>
            <h4>Customer</h4>
            <div className="notificationTab unreadNotiCountWrapper">
              {unreadCusNotiCount}
            </div>
          </button>
        </div>
      </div>
      <div className="notificationManageRightButtonsWrapper">
        <div
          className={`notificationManageRightButtonWrapper ${
            filterMode === "all" ? "active" : ""
          }`}
        >
          <button onClick={() => setFilterMode("all")}>All</button>
        </div>
        <div
          className={`notificationManageRightButtonWrapper ${
            filterMode === "unread" ? "active" : ""
          }`}
          datatype="unread"
        >
          <button datatype="unread" onClick={() => setFilterMode("unread")}>
            Unread
          </button>
        </div>
      </div>
    </div>
  );
};

export default function NotificationManage() {
  const { user, newNotifications } = useContext(Context);
  const userRole = user.user.role;

  const [unReadAdminNotificationCount, setUnReadAdminNotificationCount] =
    useState(0);
  const [unReadCustomerNotificationCount, setUnReadCustomerNotificationCount] =
    useState(0);
  const [fetchedAdminNotifications, setFetchedAdminNotifications] = useState(
    []
  );
  const [fetchedCustomerNotifications, setFetchedCustomerNotifications] =
    useState([]);
  const [activeTab, setActiveTab] = useState("admin");
  const [filterMode, setFilterMode] = useState("unread");
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const getFilteredNotifications = (notifications) => {
    if (filterMode === "all") {
      return notifications;
    } else if (filterMode === "unread") {
      return notifications.filter(
        (noti) =>
          !noti.readBy.some(
            (readByUser) => readByUser.userId.toString() === user?.user._id
          )
      );
    }
    return notifications;
  };

  const fetchNotifications = () => {
    axios
      .get("http://localhost:5000/notification")
      .then((response) => {
        const data = response.data;
        const customerNotifications = [];
        const adminNotifications = [];

        data.forEach((noti) => {
          const recipients = noti.recipients;

          if (
            (recipients.includes("admin") && userRole === "admin") ||
            (recipients.includes("super_admin") &&
              userRole === "super_admin") ||
            (recipients.includes("admin") && recipients.includes("super_admin"))
          ) {
            if (
              recipients.includes("admin") &&
              recipients.includes("super_admin")
            ) {
              adminNotifications.push(noti);
            } else if (
              recipients.includes("super_admin") &&
              userRole === "super_admin"
            ) {
              adminNotifications.push(noti);
            } else if (
              recipients.includes("admin") &&
              userRole === "admin" &&
              !recipients.includes("super_admin")
            ) {
              adminNotifications.push(noti);
            }
          }

          if (recipients.includes("customer")) {
            customerNotifications.push(noti);
          }
        });

        setFetchedCustomerNotifications(customerNotifications);
        setFetchedAdminNotifications(adminNotifications);
      })
      .catch((error) => {
        console.error("Error fetching notifications:", error);
      });
  };

  const unreadNotiCount = (notifications, setState) => {
    const filteredNotifications = getFilteredNotifications(notifications);
    setState(filteredNotifications.length); // Count the filtered notifications
  };

  const handleNotificationUpdate = (notificationId) => {
    const updateNotificationReadStatus = (notificationsList) => {
      return notificationsList.map((noti) => {
        if (noti._id === notificationId) {
          const newReadBy = [...noti.readBy];
          if (
            !newReadBy.some(
              (readUser) => readUser.userId.toString() === user.user._id
            )
          ) {
            newReadBy.push({ userId: user.user._id });
          }
          return { ...noti, readBy: newReadBy };
        }
        return noti;
      });
    };

    setFetchedAdminNotifications(
      updateNotificationReadStatus(fetchedAdminNotifications)
    );
    setFetchedCustomerNotifications(
      updateNotificationReadStatus(fetchedCustomerNotifications)
    );
    setUpdateTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (newNotifications) {
      fetchNotifications();
    }
  }, [newNotifications]);

  useEffect(() => {
    unreadNotiCount(
      fetchedCustomerNotifications,
      setUnReadCustomerNotificationCount
    );
    unreadNotiCount(fetchedAdminNotifications, setUnReadAdminNotificationCount);
  }, [
    filterMode,
    updateTrigger,
    fetchedAdminNotifications,
    fetchedCustomerNotifications,
    user?.user._id,
  ]);

  return (
    <div className="containerAdmin">
      <SidebarNavigate />
      <div datatype="bgFalse" className="rightSidebarContainer">
        <AdminHeader />
        <div className="profileSettingsContainer">
          <TabTransform
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            unreadAdminNotiCount={unReadAdminNotificationCount}
            unreadCusNotiCount={unReadCustomerNotificationCount}
            filterMode={filterMode}
            setFilterMode={setFilterMode}
          />
          <div className="tabContent tabContentNotificationManage ffGTBold">
            <div className="notificationsWrapper">
              {activeTab === "customer" ? (
                <>
                  {getFilteredNotifications(fetchedCustomerNotifications)
                    .length > 0 ? (
                    getFilteredNotifications(fetchedCustomerNotifications).map(
                      (notif, index) => (
                        <Notification
                          key={index}
                          notification={notif}
                          onNotificationUpdate={handleNotificationUpdate}
                        />
                      )
                    )
                  ) : (
                    <PlaceHolder type="notification" />
                  )}
                </>
              ) : (
                <>
                  {getFilteredNotifications(fetchedAdminNotifications).length >
                  0 ? (
                    getFilteredNotifications(fetchedAdminNotifications).map(
                      (notif, index) => (
                        <Notification
                          key={index}
                          notification={notif}
                          onNotificationUpdate={handleNotificationUpdate}
                        />
                      )
                    )
                  ) : (
                    <div className="noNotificationWrapper">
                      <img src="/images/noNotification.jpg" alt="" />
                      <h4>No Notifications Yet</h4>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}