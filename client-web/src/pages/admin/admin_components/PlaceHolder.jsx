import React from "react";

export default function PlaceHolder({ type }) {
  return (
    <div className="noNotificationWrapper">
      {type === "notification" && (
        <>
          <img src="/images/noNotification.jpg" alt="" />
          <h4>No Notifications Yet</h4>
        </>
      )}
      {type === "data" && (
        <>
          <img src="/images/noData.png" alt="" />
          <h4>No Data Found</h4>
        </>
      )}
      {type === "trash" && (
        <>
          <img src="/images/noTrash.jpg" alt="" />
          <h4>No Data Found</h4>
        </>
      )}
      {type === "chart" && (
        <>
          <img src="/images/noDataChart.png" alt="" />
          <h4>No Data Found</h4>
        </>
      )}
    </div>
  );
}
