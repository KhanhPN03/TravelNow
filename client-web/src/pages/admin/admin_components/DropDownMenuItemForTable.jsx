import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenNib,
  faMessage,
  faChevronRight,
  faSitemap,
  faCheck,
  faTicket,
  faStar,
  faListCheck,
} from "@fortawesome/free-solid-svg-icons";

export default function DropDownMenuItemForTable({
  id,
  isViewDetails,
  isViewFeedbacks,
  isViewSubs,
  isMarkAsRead,
  isViewTickets,
  isViewReviewDetails,
  isViewCheckInDetails,
  handleViewDetails,
  handleViewFeedbacks,
  handleMarkAsRead,
  handleViewTickets,
  handleViewReviewDetails,
  handleViewCheckInDetails,
}) {
  const navigate = useNavigate();
  const handleViewSubs = () => {
    navigate(`subsidiarytoursmanage/${id}`);
  };

  return (
    <div className="dropDownMenuItemForTable">
      {isViewDetails && (
        <div
          className="dropDownMenuItemForTableContent"
          onClick={() => handleViewDetails && handleViewDetails(id)}
        >
          <FontAwesomeIcon
            className="dropDownMenuItemForTableIcon"
            color="#4C4C4C"
            icon={faPenNib}
          />
          <span className="dropDownMenuItemForTableLabel">View details</span>
        </div>
      )}
      {isViewFeedbacks && (
        <div
          className="dropDownMenuItemForTableContent"
          onClick={() => handleViewFeedbacks && handleViewFeedbacks(id)}
        >
          <FontAwesomeIcon
            className="dropDownMenuItemForTableIcon"
            color="#4C4C4C"
            icon={faMessage}
          />
          <span className="dropDownMenuItemForTableLabel">View reviews</span>
        </div>
      )}
      {isViewSubs && (
        <div
          className="dropDownMenuItemForTableContent"
          onClick={handleViewSubs}
        >
          <FontAwesomeIcon
            className="dropDownMenuItemForTableIcon"
            color="#4C4C4C"
            icon={faSitemap}
          />
          <span className="dropDownMenuItemForTableLabel">
            View subsidiary tours
          </span>
        </div>
      )}
      {isMarkAsRead && (
        <div
          className="dropDownMenuItemForTableContent"
          onClick={() => handleMarkAsRead && handleMarkAsRead(id)}
        >
          <FontAwesomeIcon
            className="dropDownMenuItemForTableIcon"
            color="#4C4C4C"
            icon={faCheck}
          />
          <span className="dropDownMenuItemForTableLabel">Mark as read</span>
        </div>
      )}
      {isViewTickets && (
        <div
          className="dropDownMenuItemForTableContent"
          onClick={() => handleViewTickets && handleViewTickets(id)}
        >
          <FontAwesomeIcon
            className="dropDownMenuItemForTableIcon"
            color="#4C4C4C"
            icon={faTicket}
          />
          <span className="dropDownMenuItemForTableLabel">View tickets</span>
        </div>
      )}
      {isViewReviewDetails && (
        <div
          className="dropDownMenuItemForTableContent"
          onClick={() => handleViewReviewDetails && handleViewReviewDetails(id)}
        >
          <FontAwesomeIcon
            className="dropDownMenuItemForTableIcon"
            color="#4C4C4C"
            icon={faStar}
          />
          <span className="dropDownMenuItemForTableLabel">
            View review details
          </span>
        </div>
      )}
      {isViewCheckInDetails && (
        <div
          className="dropDownMenuItemForTableContent"
          onClick={() => {
            console.log("Clicked View Check-in Details for ID:", id);
            handleViewCheckInDetails && handleViewCheckInDetails(id);
          }}
        >
          <FontAwesomeIcon
            className="dropDownMenuItemForTableIcon"
            color="#4C4C4C"
            icon={faListCheck}
          />
          <span className="dropDownMenuItemForTableLabel">
            View check-in details
          </span>
        </div>
      )}

      <div>
        <FontAwesomeIcon icon={faChevronRight} />
      </div>
    </div>
  );
}