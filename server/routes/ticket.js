// ticket.js
const express = require("express");
const router = express.Router();
const TicketController = require("../controllers/TicketController");

router.put("/update/:ticketId", TicketController.updateTicket);
router.put(
  "/check-availability/:subTourId",
  TicketController.checkAvailability
);
router.get(
  "/getCheckInDetails/:ticketId",
  TicketController.getCheckInDetailsByTicketId
);
router.post("/:ticketId/checkin", TicketController.checkInTicket);
router.post("/by-bookings", TicketController.getTicketsByBookingIds);
router.get("/:ticketId/checkin", TicketController.checkInTicket);
router.get("/:subTourId", TicketController.getTicketsBySubTourId);
router.get("/get-all-tickets", TicketController.getAllTicket);
// New endpoint for fetching tickets by userId
router.get("/user/:userId", TicketController.getTicketsByUserId);

module.exports = router;