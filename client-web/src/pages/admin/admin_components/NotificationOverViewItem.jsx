import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

export default function NotificationOverviewItem({ noti }) {
  const navigate = useNavigate();

  const convertDate = (date) => {
    const newDate = new Date(date);

    const formattedDate = newDate
      .toLocaleString("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "numeric",
        minute: "2-digit",
        // second: "2-digit",
        hour12: false,
      })
      .replace(",", "");

    return formattedDate;
  };

  return (
    <div
      className="notificationItem"
      datatype="overview"
      onClick={() => navigate("/admin/notification")}
    >
      <div className="notificationItemHeader">
        <div className="notificationItemHeaderLabel">
          <div className="notificationItemIcon">
            <i style={{ color: "#1a2b49" }} class="bx bx-bell"></i>
          </div>
          <span>{noti.type}</span>
        </div>
        <div className="notificationItemHeaderDate">
          <span>{convertDate(noti.createdAt)}</span>
        </div>
      </div>
      <div className="notificationItemBodyLabel">
        <div className="notificationItemIcon">
          <FontAwesomeIcon color="#1a2b49" icon={faCircleInfo} />
        </div>
        <span>{noti.message}</span>
      </div>
      
    </div>
  );
}
