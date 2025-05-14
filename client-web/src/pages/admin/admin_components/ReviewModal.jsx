// ReviewModal.jsx
import React from "react";
import PlaceHolder from "./PlaceHolder";
import axios from "axios";
import { toast } from "react-toastify";

const ReviewModal = ({ details, onClose, onDelete, onRefreshReviews }) => {
  const { rating, feedback, noReview } = details || {};

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`rmStar ${i <= rating ? "rmStarFilled" : ""}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  const handleDeleteFeedback = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5000/review-tour/admin/${details._id}`
      );

      if (response.data.success) {
        // Update local details to reflect deleted feedback
        const updatedDetails = { ...details, feedback: "" };
        onDelete(updatedDetails); // Notify parent of updated details
        toast.success("Delete feedback successfully");
        if (onRefreshReviews) {
          await onRefreshReviews(); // Re-fetch review to update TableRowTicked
        }
      } else {
        toast.error("Failed to delete feedback");
      }
    } catch (error) {
      console.error("Error deleting feedback:", error);
      toast.error("Failed to delete feedback");
    } finally {
      onClose();
    }
  };

  return (
    <div className="rmModalOverlay">
      <div className="rmModalContent">
        <div className="rmModalHeader ffGTBold">
          <h2>Review Details</h2>
          <button className="rmCloseButton" onClick={onClose}>
            ✕
          </button>
        </div>
        {noReview ? (
          <div className="emptyIcon">
            <PlaceHolder type={"data"} />
          </div>
        ) : details ? (
          <div className="rmFeedbackBody">
            <div className="rmModalBody">
              <div className="rmRatingSection ffGTMedium">
                <label>Transport</label>
                <div className="rmStars">
                  {renderStars(rating?.transport || 0)}
                </div>
              </div>
              <div className="rmRatingSection ffGTMedium">
                <label>Service</label>
                <div className="rmStars">
                  {renderStars(rating?.services || 0)}
                </div>
              </div>
              <div className="rmRatingSection ffGTMedium">
                <label>Price quality</label>
                <div className="rmStars">
                  {renderStars(rating?.priceQuality || 0)}
                </div>
              </div>
              <div className="rmFeedbackSection ffGTMedium">
                <label>Feedback</label>
                <textarea
                  className="rmFeedbackTextarea ffGTRegular"
                  value={feedback || "No feedback provided."}
                  readOnly
                />
              </div>
            </div>
            <div className="rmModalFooter ffGTRegular">
              {feedback ? (
                <button
                  className="rmDeleteFeedbackButton"
                  onClick={handleDeleteFeedback}
                >
                  Delete Feedback
                </button>
              ) : (
                ""
              )}
              <button className="rmCloseButtonFooter" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="emptyIcon">
            <PlaceHolder type={"data"} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;