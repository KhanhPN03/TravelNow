import React, { useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleInfo,
  faEllipsis,
  faCircle,
} from "@fortawesome/free-solid-svg-icons";
import DropDownMenuForTable from "./DropDownMenuForTable";
import axios from "axios";
import { Context } from "../../../context/ContextProvider";

export default function NotificationItem({
  notification,
  onNotificationUpdate,
}) {
  const { user } = useContext(Context);
  const [markAsReadBtnOpen, setMarkAsReadBtnOpen] = useState(false);
  const [read, setRead] = useState(false);
  const userId = user.user._id;

  // Check if the notification is intended for admin or super_admin
  const isVisible = notification.recipients.some(recipient =>
    ["admin", "super_admin"].includes(recipient)
  );

  useEffect(() => {
    // Reset read state when notification changes
    setRead(false);

    // Check if current user has read this notification
    if (notification.readBy && notification.readBy.length > 0) {
      notification.readBy.forEach((readUser) => {
        if (readUser.userId.toString() === user.user._id) {
          setRead(true);
        }
      });
    }
  }, [notification, user.user._id]);

  const convertDate = (date) => {
    const newDate = new Date(date);
    const formattedDate = newDate
      .toLocaleString("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "numeric",
        minute: "2-digit",
        hour12: false,
      })
      .replace(",", "");
    return formattedDate;
  };

  const handleMarkAsRead = async () => {
    try {
      await axios.put(
        `http://localhost:5000/notification/${notification._id}`,
        {
          userId,
        }
      );
      setRead(true);
      setMarkAsReadBtnOpen(false);
      if (onNotificationUpdate) {
        onNotificationUpdate(notification._id);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Function to dynamically render information fields
  const renderInformation = () => {
    const info = notification.information;
    if (!info) return null;

    // List of all possible sub-objects in the information field
    const infoContent =
      info.createTour ||
      info.softDeleteTour ||
      info.hardDeleteTour ||
      info.restoreTour ||
      info.createAccount ||
      info.softDeleteAccount ||
      info.hardDeleteAccount ||
      info.restoreAccount ||
      info.creatediscount ||
      info.updatediscount ||
      info.softDeleteDiscount ||
      info.restoreDiscount ||
      info.hardDeleteDiscount ||
      info.refund ||
      info.bookTour;

    if (!infoContent) return null;

    // Map the fields of the sub-object to display them
    return Object.entries(infoContent).map(([key, value]) => {
      if (value === null || value === undefined) return null;

      // Format the key to a readable label
      const label = key
        .replace(/([A-Z])/g, " $1") // Add space before capital letters
        .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
        .trim();

      // Special formatting for dates and ObjectId
      let displayValue;
      if (key.toLowerCase().includes("date") && value instanceof Date) {
        displayValue = convertDate(value);
      } else if (key === "userId" && typeof value === "object") {
        displayValue = value.toString(); // Handle ObjectId for userId in refund
      } else {
        displayValue = value.toString();
      }

      return (
        <div key={key} className="notificationItemBodyInfo">
          <div className="notificationItemBodyInfoItem">
            <div className="notificationItemBodyInfoItemLabel">• {label}:</div>
            <span>{displayValue}</span>
          </div>
        </div>
      );
    });
  };

  // Only render the notification if it's intended for admin or super_admin
  if (!isVisible) return null;

  return (
    <div className="notificationItem">
      <div className="notificationItemHeader">
        <div className="notificationItemHeaderLabel">
          <div className="notificationItemIcon">
            <i style={{ color: "#1a2b49" }} className="bx bx-bell"></i>
          </div>
          <span>{notification.type}</span>
        </div>
        <div className="notificationItemHeaderDate">
          <span>{convertDate(notification.createdAt)}</span>
        </div>
      </div>
      <div className="notificationItemBodyLabel">
        <div className="notificationItemIcon">
          <FontAwesomeIcon color="#1a2b49" icon={faCircleInfo} />
        </div>
        <span>{notification.message}</span>
      </div>
      {/* Dynamically render the information fields */}
      {renderInformation()}
      <div className="notificationMarkAsReadButtonWrapper">
        {!read && (
          <button
            onClick={() => setMarkAsReadBtnOpen(!markAsReadBtnOpen)}
            className="notificationMarkAsReadButton"
          >
            <FontAwesomeIcon icon={faEllipsis} />
          </button>
        )}
        {!read && (
          <FontAwesomeIcon
            style={{ fontSize: "12px", color: "#5aa7ff" }}
            icon={faCircle}
          />
        )}
        {markAsReadBtnOpen && (
          <DropDownMenuForTable
            id={notification._id}
            hasMarkAsRead={!read}
            handler={handleMarkAsRead}
          />
        )}
      </div>
    </div>
  );
}