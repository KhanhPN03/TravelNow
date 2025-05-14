import React, { useContext, useEffect, useState } from "react";

import NotificationOverviewItem from "./NotificationOverViewItem";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../../context/ContextProvider";
import axios from "axios";

import { Context } from "../../../context/ContextProvider";

export default function NotificationOverview() {
  const navigate = useNavigate();

  const { user, newNotifications } = useContext(Context);

  const [fetchedNotifications, setFetchedNotifications] = useState([]);

  const fetchNotifications = () => {
    axios
      .get("http://localhost:5000/notification")
      .then((response) => {
        setFetchedNotifications(response.data);
      })
      .catch((error) => {
        console.error("Error fetching notifications:", error);
      });
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (newNotifications) {
      fetchNotifications();
    }
  }, [newNotifications]);

  return (
    <div className="notificationOverview">
      <div className="notificationOverviewHeader">
        <div className="notificationOverviewHeaderLabel">New Notifications</div>
        <span
          className="notificationOverviewHeaderViewAll"
          onClick={() => navigate("/admin/notification")}
        >
          View all
        </span>
      </div>
      <div className="notificationOverviewList">
        {fetchedNotifications.map((noti, index) => (
          <NotificationOverviewItem noti={noti} />
        ))}
      </div>
    </div>
  );
}
