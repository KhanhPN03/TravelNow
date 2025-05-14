import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import PlaceHolder from "./PlaceHolder";

const TicketCheckinDetails = ({ onClose, rowId }) => {
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("rowId:", rowId);

  // Define fetchCheckInData in the component scope
  const fetchCheckInData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `http://localhost:5000/ticket/getCheckInDetails/${rowId}`
      );
      setScheduleData(response.data.checkins || []);
    } catch (error) {
      console.error("Error fetching check-in details:", error);
      setError(
        error.response?.data?.message ||
          "Failed to load check-in details. Please try again."
      );
      setScheduleData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rowId) {
      fetchCheckInData();
    }
  }, [rowId]);

  return (
    <div className="checkInDetailsModalOverlay">
      <div className="checkInDetailsModalContent">
        <div className="checkInDetailsModalCloseButtonContainer">
          <button onClick={onClose} className="checkInDetailsModalCloseButton">
            <FontAwesomeIcon
              style={{
                fontSize: "15px",
                color: "#fe6956",
              }}
              icon={faCircleXmark}
            />
          </button>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <div className="errorMessage" style={{ color: "red", textAlign: "center" }}>
            {error}
            <button
              onClick={fetchCheckInData} // Call the function directly
              style={{ marginLeft: "10px", padding: "5px 10px" }}
            >
              Retry
            </button>
          </div>
        ) : scheduleData.length === 0 ? (
          <div className="emptyIcon">
            <PlaceHolder type={"data"} />
          </div>
        ) : (
          <div className="checkInDetailsModalTableContainer">
            <table className="checkInDetailsModalTable">
              <thead>
                <tr>
                  <th className="customerNameColumn">Customer Name</th>
                  <th>Phone Number</th>
                  <th>Identity Number</th>
                </tr>
              </thead>
              <tbody>
                {scheduleData.map((classItem, index) => (
                  <tr key={index}>
                    <td className="customerNameColumn">{classItem.customerName || "N/A"}</td>
                    <td>{classItem.customerPhoneNumber || "N/A"}</td>
                    <td>{classItem.customerIdentityNumber || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketCheckinDetails;