import React from "react";

const ModalTicked = ({ details, onDelete, onCancel }) => {
  return (
    <div className="modalDetail">
      <div className="modalContentDetail">
        <p>
          <strong className="titleFeedbackmodal ffRobotoBold">
            Full name:
          </strong>{" "}
          <span className="ffRobotoRegular"> {details.fullName}</span>
        </p>
        <p>
          <strong className="titleFeedbackmodal ffRobotoBold">Tour Ref:</strong>{" "}
          <span className="ffRobotoRegular"> {details.tourRef}</span>
        </p>
        <p>
          <strong className="titleFeedbackmodal ffRobotoBold">
            Ticket Ref:
          </strong>{" "}
          <span className="ffRobotoRegular"> {details.ticketRef}</span>
        </p>
        <p>
          <strong className="titleFeedbackmodal ffRobotoBold">
            Total Slot:
          </strong>{" "}
          <span className="ffRobotoRegular"> {details.slots} Adult</span>
        </p>
        <p>
          <strong className="titleFeedbackmodal ffRobotoBold">
            Total price:
          </strong>{" "}
          <span className="ffRobotoRegular"> {details.totalPrice}₫</span>
        </p>
        <p className="FeedbackmodalRD  ffRobotoBoldRating">
          <strong className="titleFeedbackmodal ffRobotoBoldRating">
            <div className="ratingModal f18">
              {" "}
              <strong className=" ffRobotoBold"> {details.rating} </strong>
              <div className="starModal ">
                <img src="../../../../images/star.svg" alt="star" />{" "}
              </div>
            </div>
          </strong>
          <span className="SpanDate"> {details.date}</span>

          <div className="deleteEnd">
            <button
              className=" deleteButtonTicket ffGTRegular f14"
              onClick={onDelete}
            >
              {" "}
              <div className="rac">
                <img src="../../../../images/thungrac.svg" alt="star" />
              </div>
              <div className=" deleteButtonTicketConten">Delete</div>
            </button>
          </div>
        </p>

        <input
          type="text"
          className="titleFeedbackmodal ffRobotoBold commentInput"
          value={details.comment}
          onChange={(e) =>
            console.log("Comment changed, need to add logic here!")
          }
        />
        <div class="lineModal"></div>
        <div className="modalActions">
          <button className="cancelButton ffGTRegular f14" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalTicked;
