import React from "react";
import DropDownMenuItemForTable from "./DropDownMenuItemForTable";

export default function DropDownMenuForTable({
  id,
  hasViewDetails,
  hasViewSubs,
  hasViewFeedbacks,
  hasMarkAsRead,
  hasViewTickets,
  hasViewCheckInDetails,
  hasViewReviewDetails,
  handleViewDetails,
  handleViewFeedbacks,
  handleViewTickets,
  handleViewCheckInDetails,
  handleViewReviewDetails,
  handler, // handleMarkAsRead
  handleViewReview,
  rowData,
}) {
  return (
    <div
      style={{
        height:
          (hasViewDetails ||
            hasViewSubs ||
            hasViewFeedbacks ||
            hasMarkAsRead ||
            hasViewTickets ||
            hasViewCheckInDetails ||
            hasViewReviewDetails) &&
          "fit-content",
        right: "10px",
      }}
      className="dropDownMenuForTable"
    >
      {hasViewDetails && (
        <DropDownMenuItemForTable
          id={id}
          isViewDetails={true}
          handleViewDetails={handleViewDetails}
        />
      )}
      {hasViewFeedbacks && (
        <DropDownMenuItemForTable
          id={id}
          isViewFeedbacks={true}
          handleViewFeedbacks={handleViewFeedbacks}
        />
      )}
      {hasViewSubs && <DropDownMenuItemForTable id={id} isViewSubs={true} />}
      {hasMarkAsRead && (
        <DropDownMenuItemForTable
          id={id}
          isMarkAsRead={true}
          handleMarkAsRead={handler}
        />
      )}
      {hasViewTickets && (
        <DropDownMenuItemForTable
          id={id}
          isViewTickets={true}
          handleViewTickets={handleViewTickets}
        />
      )}
      {hasViewReviewDetails && (
        <DropDownMenuItemForTable
          id={id}
          isViewReviewDetails={true}
          handleViewReviewDetails={handleViewReviewDetails}
        />
      )}
      {hasViewCheckInDetails && (
        <DropDownMenuItemForTable
          id={id}
          isViewCheckInDetails={true}
          handleViewCheckInDetails={handleViewCheckInDetails}
        />
      )}
    </div>
  );
}