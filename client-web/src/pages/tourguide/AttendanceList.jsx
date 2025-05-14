import React, { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { Context } from "../../context/ContextProvider";
import TourGuideHeader from "./tourguidecomponent/TourGuideHeader";
import "./tourguide.css";

const BASE_URL = "http://localhost:5000";

const mockData = []; // Empty mock data to test no-data case

function AttendanceList() {
  const [subsidiaryToursData, setSubsidiaryToursData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inputErrors, setInputErrors] = useState({});
  const [expandedTour, setExpandedTour] = useState(null);
  const [useMockData, setUseMockData] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [dataLoadState, setDataLoadState] = useState({
    tours: { loading: true, error: null },
  });
  const [filter, setFilter] = useState("all");
  const [originalTicketData, setOriginalTicketData] = useState({});
  const { user, logout } = useContext(Context);
  const guideId = user?.user?._id || null;

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchSubsidiaryTours = useCallback(async () => {
    console.log("Fetching tours, guideId:", guideId);
    if (!guideId) {
      setUseMockData(true);
      setSubsidiaryToursData(mockData);
      setDataLoadState((prev) => ({
        ...prev,
        tours: {
          loading: false,
          error: "Guide ID not found. Using mock data.",
        },
      }));
      console.log("Using mock data:", mockData);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setDataLoadState((prev) => ({
        ...prev,
        tours: { loading: true, error: null },
      }));

      const response = await axios.get(`${BASE_URL}/subsidiaryTours/`);
      console.log("API response:", response.data);

      if (response.data && Array.isArray(response.data.subsidiaryTours)) {
        const toursWithTickets = await Promise.all(
          response.data.subsidiaryTours.map(async (tour) => {
            const tickets = await fetchTicketsBySubTourId(tour._id);
            const mappedTickets = tickets.map((ticket) => {
              const bookedSlot = ticket.bookingId?.bookedSlot || ticket.slots || 1;
              let note = ticket.checkinDetails
                ? ticket.checkinDetails.map((checkin) => ({
                  fullName: checkin.customerName || "",
                  phone: checkin.customerPhoneNumber || "",
                  cccd: checkin.customerIdentityNumber || "",
                }))
                : Array(bookedSlot).fill({ fullName: "", phone: "", cccd: "" });

              if (note.length < bookedSlot) {
                note = note.concat(
                  Array(bookedSlot - note.length).fill({
                    fullName: "",
                    phone: "",
                    cccd: "",
                  })
                );
              }

              return {
                "TICKET REF": ticket.ticketRef || `TICKET-${ticket._id}`,
                "FULL NAME": ticket.bookingId?.buyerName || ticket["FULL NAME"] || "Unknown",
                "PHONE NUMBER": ticket.bookingId?.buyerPhone || ticket["PHONE NUMBER"] || "Unknown",
                slots: bookedSlot,
                ticketId: ticket._id,
                isCheckedIn: ticket.isCheckedIn || false,
                note,
              };
            });
            return { ...tour, tickets: mappedTickets };
          })
        );
        setSubsidiaryToursData(toursWithTickets);
        setUseMockData(false);
        setDataLoadState((prev) => ({
          ...prev,
          tours: { loading: false, error: null },
        }));
        console.log("Fetched tours:", toursWithTickets);
      } else {
        setSubsidiaryToursData(mockData);
        setUseMockData(true);
        setDataLoadState((prev) => ({
          ...prev,
          tours: {
            loading: false,
            error: "Data from API is not in the correct format.",
          },
        }));
        console.log("API data invalid, using mock data:", mockData);
      }
    } catch (error) {
      setUseMockData(true);
      setSubsidiaryToursData(mockData);
      setDataLoadState((prev) => ({
        ...prev,
        tours: {
          loading: false,
          error: error.response?.data?.message || "Failed to fetch tour data.",
        },
      }));
      console.log("Fetch error:", error.message);
    } finally {
      setLoading(false);
    }
  }, [guideId]);

  const fetchTicketsBySubTourId = async (subTourId) => {
    if (useMockData) {
      const mockTour = mockData.find((tour) => tour._id === subTourId);
      return mockTour ? mockTour.tickets : [];
    }

    try {
      const response = await axios.get(`${BASE_URL}/ticket/${subTourId}`);
      console.log(`Tickets for subTourId ${subTourId}:`, response.data);
      return response.data || [];
    } catch (error) {
      console.log(`Error fetching tickets for subTourId ${subTourId}:`, error.message);
      return [];
    }
  };

  const filterToursByDate = (tours) => {
    console.log("Input tours to filter:", tours);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filtered = tours.filter((tour) => {
      const dateStart = new Date(tour.dateStart?.date || tour["Date Start"]);
      if (isNaN(dateStart.getTime())) {
        console.log("Invalid date for tour:", tour);
        return false;
      }
      dateStart.setHours(0, 0, 0, 0);

      switch (filter) {
        case "today":
          return dateStart.getTime() === today.getTime();
        case "nextWeek": {
          const nextWeek = new Date(today);
          nextWeek.setDate(today.getDate() + 7);
          return dateStart >= today && dateStart <= nextWeek;
        }
        case "nextMonth": {
          const nextMonth = new Date(today);
          nextMonth.setMonth(today.getMonth() + 1);
          return dateStart >= today && dateStart <= nextMonth;
        }
        case "all":
          return true;
        default:
          return true;
      }
    });

    console.log(`Filtered tours for ${filter}:`, filtered);
    return filtered;
  };

  const filteredSubsidiaryTours = filterToursByDate(
    useMockData
      ? mockData
      : subsidiaryToursData
        .filter(
          (tour) =>
            tour.guidedBy &&
            guideId &&
            tour.guidedBy.toString() === guideId.toString()
        )
        .filter((tour) => tour.tickets && tour.tickets.length > 0) // Only include tours with tickets
  );

  // Debug: Log filter and filtered tours
  useEffect(() => {
    console.log("Current filter:", filter);
    console.log("Filtered tours:", filteredSubsidiaryTours);
    console.log("Filtered tours length:", filteredSubsidiaryTours.length);
    console.log("Use mock data:", useMockData);
    console.log("Guide ID:", guideId);
    console.log("Subsidiary tours data:", subsidiaryToursData);
    filteredSubsidiaryTours.forEach((tour) =>
      console.log(`Tour ${tour._id} ticket count:`, tour.tickets?.length || 0)
    );
  }, [filter, filteredSubsidiaryTours, useMockData, guideId, subsidiaryToursData]);

  useEffect(() => {
    fetchSubsidiaryTours();
  }, [fetchSubsidiaryTours]);

  const handleRowClick = (tour, ticketIndex) => {
    if (
      expandedTour?._id === tour._id &&
      expandedTour.ticketIndex === ticketIndex
    ) {
      setExpandedTour(null);
      setOriginalTicketData({});
    } else {
      const originalTicket = JSON.stringify(tour.tickets[ticketIndex].note);
      setOriginalTicketData({
        ticketId: tour.tickets[ticketIndex].ticketId,
        data: originalTicket,
        isCheckedIn: tour.tickets[ticketIndex].isCheckedIn
      });
      setExpandedTour({ ...tour, ticketIndex });
    }
  };

  const handleInputChange = (ticketIndex, slotIndex, field, value) => {
    let isValid = true;
    let errorMessage = "";

    if (field === "fullName") {
      const letterRegex = /^[A-Za-z\s]*$/;
      if (!letterRegex.test(value)) {
        isValid = false;
        errorMessage = "Full Name can only contain letters and spaces.";
      }
    } else if (field === "phone") {
      const numberRegex = /^[0-9]*$/;
      if (!numberRegex.test(value)) {
        isValid = false;
        errorMessage = "Phone can only contain numbers.";
      } else if (value.length > 10) {
        isValid = false;
        errorMessage = "Phone cannot exceed 10 digits.";
      }
    } else if (field === "cccd") {
      const numberRegex = /^[0-9]*$/;
      if (!numberRegex.test(value)) {
        isValid = false;
        errorMessage = "Identity Number can only contain numbers.";
      } else if (value.length > 12) {
        isValid = false;
        errorMessage = "Identity Number cannot exceed 12 digits.";
      }
    }

    if (isValid) {
      const updatedTickets = [...expandedTour.tickets];
      updatedTickets[ticketIndex].note[slotIndex] = {
        ...updatedTickets[ticketIndex].note[slotIndex],
        [field]: value,
      };
      setExpandedTour({ ...expandedTour, tickets: updatedTickets });
      setInputErrors((prev) => ({
        ...prev,
        [`${ticketIndex}-${slotIndex}-${field}`]: "",
      }));
    } else {
      setInputErrors((prev) => ({
        ...prev,
        [`${ticketIndex}-${slotIndex}-${field}`]: errorMessage,
      }));
    }
  };

  const validateNotes = (ticket) => {
    return ticket.note.every((slot) => {
      const isEmpty =
        slot.fullName.trim() === "" &&
        slot.phone.trim() === "" &&
        slot.cccd.trim() === "";
      const isComplete =
        slot.fullName.trim() !== "" &&
        slot.phone.trim() !== "" &&
        slot.cccd.trim() !== "";

      return isEmpty || isComplete;
    });
  };

  const hasValidDataToSave = (ticket) => {
    return ticket.note.some(
      (slot) =>
        slot.fullName.trim() !== "" &&
        slot.phone.trim() !== "" &&
        slot.cccd.trim() !== ""
    );
  };

  const hasChanges = (ticket) => {
    if (!originalTicketData.ticketId || originalTicketData.ticketId !== ticket.ticketId) {
      return false;
    }

    const currentData = JSON.stringify(ticket.note);
    return currentData !== originalTicketData.data;
  };

  const isSaveButtonEnabled = (ticket) => {
    return (
      hasValidDataToSave(ticket) &&
      validateNotes(ticket) &&
      hasChanges(ticket) &&
      Object.values(inputErrors).every((err) => err === "")
    );
  };

  const handleSave = async (ticket) => {
    if (!validateNotes(ticket)) {
      setError("Each slot must have either all fields filled or all fields empty.");
      return;
    }

    if (!hasValidDataToSave(ticket) && !ticket.isCheckedIn) {
      setError("At least one slot must have complete information.");
      return;
    }

    if (Object.values(inputErrors).some((err) => err !== "")) {
      setError("Please fix input errors before saving.");
      return;
    }

    if (useMockData) {
      setSuccessMessage("Ticket saved successfully (mock)");
      setTimeout(() => setSuccessMessage(""), 2000);
      return;
    }

    try {
      setLoading(true);
      const checkinData = ticket.note
        .filter(
          (tour) =>
            tour.fullName.trim() !== "" &&
            tour.phone.trim() !== "" &&
            tour.cccd.trim() !== ""
        )
        .map((slot) => ({
          customerName: slot.fullName || "",
          customerPhoneNumber: slot.phone || "",
          customerIdentityNumber: slot.cccd || "",
        }));

      const payload = {
        checkinData
      };

      const response = await axios.post(
        `${BASE_URL}/ticket/ticket/${ticket.ticketId}/checkin`,
        payload
      );
      console.log("Save response:", response.data);

      if (response.data) {
        setSuccessMessage("Ticket saved successfully!");
        setTimeout(() => {
          setSuccessMessage("");
          setExpandedTour(null);
          setOriginalTicketData({});
          fetchSubsidiaryTours();
        }, 2000);
      }
    } catch (error) {
      console.error("Error saving notes:", error);
      setError(error.response?.data?.message || "Failed to save notes.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (ticketIndex) => {
    const updatedTickets = [...expandedTour.tickets];
    updatedTickets[ticketIndex].isCheckedIn = !updatedTickets[ticketIndex].isCheckedIn;
    setExpandedTour({ ...expandedTour, tickets: updatedTickets });
  };

  const EmptyState = ({ message, icon }) => (
    <div className="empty-state-container">
      <div className="empty-state-icon">{icon || "📋"}</div>
      <p className="empty-state-message">{message}</p>
    </div>
  );

  const formatDateStart = (dateStart) => {
    if (dateStart?.date && dateStart?.time) {
      const datePart = new Date(dateStart.date).toISOString().split("T")[0];
      const dateTimeString = `${datePart}T${dateStart.time}`;
      return new Date(dateTimeString).toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
    return dateStart?.date
      ? new Date(dateStart.date).toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      : "N/A";
  };

  return (
    <div className="tourguideLayout containerTourguide">
      <div className="tourguideLayout tourguideSidebarContainer">
        <TourGuideHeader />
        <div className="tourguideLayout attendaceTableContainer">
          <div className="filter-container">
            <div className="filter-wrapper">
              <label htmlFor="tour-filter">Filter tours by: </label>
              <select
                id="tour-filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
              >
                <option value="today">Today</option>
                <option value="nextWeek">Next Week</option>
                <option value="nextMonth">Next Month</option>
                <option value="all">All</option>
              </select>
            </div>
            <button className="logout-button" onClick={logout}>
              <i className="bx bx-log-out"></i>
              <span>Logout</span>
            </button>
          </div>

          {dataLoadState.tours.loading && (
            <div className="loading-message">Loading tour data...</div>
          )}
          {error && <div className="error-message">{error}</div>}
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}

          <div className="tour-cards-container">
            {dataLoadState.tours.loading ? (
              <div className="loading-message">Loading tour data...</div>
            ) : dataLoadState.tours.error ? (
              <EmptyState message={dataLoadState.tours.error} icon="⚠️" />
            ) : filteredSubsidiaryTours.length === 0 ? (
              <EmptyState
                message={`No tours available for ${filter === "today"
                  ? "today"
                  : filter === "nextWeek"
                    ? "next week"
                    : filter === "nextMonth"
                      ? "next month"
                      : "all tours"
                  }`}
                icon="🏝️"
              />
            ) : (
              filteredSubsidiaryTours.map((tour) =>
                (tour.tickets || []).map((ticket, index) => (
                  <div
                    key={`${tour._id}-${ticket["TICKET REF"] || index}`}
                    className="tour-card"
                  >
                    <div
                      className="tour-card-header"
                      onClick={() => handleRowClick(tour, index)}
                    >
                      <div className="checkbox-container">
                        <span className="checkbox-label">Check-in</span>
                        <input
                          type="checkbox"
                          checked={ticket.isCheckedIn}
                          className="checkbox-input"
                          disabled={true}
                          readOnly
                        />
                      </div>
                      <div className="tour-card-field">
                        <span className="tour-card-label">Title</span>
                        <span className="tour-title">
                          {tour.originalTourId?.title || tour.Title || "Unknown"}
                        </span>
                      </div>
                      <div className="tour-card-field">
                        <span className="tour-card-label">Ticket Ref</span>
                        <span>{ticket["TICKET REF"] || "N/A"}</span>
                      </div>
                      <div className="tour-card-field">
                        <span className="tour-card-label">Full Name</span>
                        <span>{ticket["FULL NAME"] || "Unknown"}</span>
                      </div>
                      <div className="tour-card-field">
                        <span className="tour-card-label">Phone Number</span>
                        <span>{ticket["PHONE NUMBER"] || "Unknown"}</span>
                      </div>
                      <div className="tour-card-field">
                        <span className="tour-card-label">Slots</span>
                        <span>{ticket.slots || 1}</span>
                      </div>
                      <div className="tour-card-field">
                        <span className="tour-card-label">Date Start</span>
                        <span>{formatDateStart(tour.dateStart)}</span>
                      </div>
                    </div>
                    {expandedTour?._id === tour._id &&
                      expandedTour.ticketIndex === index && (
                        <div className="tour-card-dropdown">
                          {ticket.note.map((slot, slotIndex) => (
                            <div key={slotIndex} className="slot-form">
                              <h4>Slot {slotIndex + 1}</h4>
                              <div className="slot-form-field">
                                <label>Full Name</label>
                                <input
                                  type="text"
                                  value={slot.fullName}
                                  onChange={(e) =>
                                    handleInputChange(
                                      index,
                                      slotIndex,
                                      "fullName",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Full Name"
                                  className={
                                    inputErrors[`${index}-${slotIndex}-fullName`]
                                      ? "input-error"
                                      : ""
                                  }
                                />
                                {inputErrors[`${index}-${slotIndex}-fullName`] && (
                                  <span className="error-text">
                                    {inputErrors[`${index}-${slotIndex}-fullName`]}
                                  </span>
                                )}
                              </div>
                              <div className="slot-form-field">
                                <label>Phone</label>
                                <input
                                  type="text"
                                  value={slot.phone}
                                  onChange={(e) =>
                                    handleInputChange(
                                      index,
                                      slotIndex,
                                      "phone",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Phone"
                                  className={
                                    inputErrors[`${index}-${slotIndex}-phone`]
                                      ? "input-error"
                                      : ""
                                  }
                                />
                                {inputErrors[`${index}-${slotIndex}-phone`] && (
                                  <span className="error-text">
                                    {inputErrors[`${index}-${slotIndex}-phone`]}
                                  </span>
                                )}
                              </div>
                              <div className="slot-form-field">
                                <label>Identity Number</label>
                                <input
                                  type="text"
                                  value={slot.cccd}
                                  onChange={(e) =>
                                    handleInputChange(
                                      index,
                                      slotIndex,
                                      "cccd",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Identity Number"
                                  className={
                                    inputErrors[`${index}-${slotIndex}-cccd`]
                                      ? "input-error"
                                      : ""
                                  }
                                />
                                {inputErrors[`${index}-${slotIndex}-cccd`] && (
                                  <span className="error-text">
                                    {inputErrors[`${index}-${slotIndex}-cccd`]}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                          <button
                            className={`save-button ${isSaveButtonEnabled(ticket) ? "save-button-enabled" : ""
                              }`}
                            onClick={() => handleSave(ticket)}
                            disabled={!isSaveButtonEnabled(ticket) || loading}
                          >
                            {loading ? "Saving..." : "Save"}
                          </button>
                        </div>
                      )}
                  </div>
                ))
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttendanceList;