import React, { useState, useEffect } from "react";
import axios from "axios";
import PlaceHolder from "./PlaceHolder";

const TableRowTicked = ({ item, accountData, onViewDetail, onViewCheckin }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [review, setReview] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);

  const ticket = item; // Item is a ticket

  // Function to fetch review for the ticket
  const fetchReview = async () => {
    if (ticket.ticketStatus === "COMPLETED") {
      setLoadingReview(true);
      try {
        // Add cache-busting query parameter to prevent stale data
        const response = await axios.get(
          `http://localhost:5000/review-tour/ticket/${
            ticket._id
          }?t=${new Date().getTime()}`
        );
        console.log(
          "fetchReview response for ticket:",
          ticket._id,
          response.data
        );
        if (response.data.success && response.data.review) {
          setReview(response.data.review);
        } else {
          console.log(
            "No review found or success false, setting review to null"
          );
          setReview(null);
        }
      } catch (error) {
        console.error("Error fetching review for ticket:", error);
        setReview(null);
      } finally {
        setLoadingReview(false);
      }
    } else {
      console.log("Ticket status not COMPLETED, setting review to null");
      setReview(null);
    }
  };

  // Fetch review on mount or when ticket changes
  useEffect(() => {
    fetchReview();
  }, [ticket._id, ticket.ticketStatus]);

  // Function to refresh reviews after deletion
  const refreshReviews = async () => {
    console.log("Refreshing reviews for ticket:", ticket._id);
    await fetchReview(); // Refetch the review or clear it if deleted
  };

  // Rating logic
  const averageRating = review
    ? (
        (review.rating.transport +
          review.rating.services +
          review.rating.priceQuality) /
        3
      ).toFixed(1)
    : "N/A";

  // Review date (use ticket's createdAt if no review)
  const reviewDate = ticket.createdAt
    ? new Date(ticket.createdAt).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  // User info from booking or accountData
  const fullName = ticket.bookingId?.buyerName
    ? ticket.bookingId.buyerName
    : `${accountData?.firstname || ""} ${accountData?.lastname || ""}`.trim() ||
      "Unknown User";

  const handleViewCheckInDetail = () => {
    console.log("View check-in detail for ticket:", ticket);
    onViewCheckin(ticket._id);
    setShowDropdown(false);
  };

  const handleViewReview = () => {
    console.log("View review for ticket:", ticket);
    console.log("Current review state:", review);
    if (ticket.ticketStatus === "FUTURE" || !review) {
      // Show placeholder modal for no review
      onViewDetail({ ticketId: ticket._id, noReview: true, refreshReviews });
    } else {
      onViewDetail({ ...review, ticketId: ticket._id, refreshReviews });
    }
    setShowDropdown(false);
  };

  return (
    <tr>
      <td>
        <div className="review">
          <div>
            <p className="f-16 clrDarkBlue ffGTRegular">{fullName}</p>
          </div>
        </div>
      </td>
      <td className="clrDarkBlue ffGTRegular">
        {ticket.bookingId?.subTourId?.subTourCode || "N/A"}
      </td>
      <td className="clrDarkBlue ffGTRegular">{ticket.ticketRef || "N/A"}</td>
      <td className="f-20 clrDarkBlue ffGTRegular">
        <div className="rating">
          <strong className="clrDarkBlue">{averageRating}</strong>
          <div className="star"></div>
        </div>
      </td>
      <td>
        <div
          className="trtViewDetailsContainer"
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          <button className="viewDetailsBtn bgDarkblue ffGTRegular">
            View details
          </button>
          {showDropdown && (
            <div className="trtDropdownMenu">
              <button
                className="trtDropdownItem ffGTRegular"
                onClick={handleViewCheckInDetail}
              >
                View check-in detail
              </button>
              <button
                className="trtDropdownItem ffGTRegular"
                onClick={handleViewReview}
              >
                View Review
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default TableRowTicked;
