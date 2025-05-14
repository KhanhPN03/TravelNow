const Ticket = require("../models/Ticket");
const Booking = require("../models/Booking");
const SubsidiaryTour = require("../models/SubsidiaryTour");
const OriginalTour = require("../models/OriginalTour");
const Refund = require("../models/Refund");
const mongoose = require("mongoose");

class TicketController {
  // [GET] /ticket/get-all-tickets
  async getAllTicket(req, res, next) {
    try {
      const { userId } = req.query;

      // Lấy tất cả booking sessions cho userId
      const userBookingSessions = await Booking.find({ userId });
      const idArray = userBookingSessions.map((session) => session.id);

      // Ngày hôm nay (chỉ lấy phần ngày, bỏ giờ phút giây)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Lấy tất cả ticket và populate subTour để so sánh dateEnd
      const tickets = await Ticket.find({
        bookingId: { $in: idArray },
      }).populate({
        path: "bookingId",
        populate: [
          { path: "subTourId", model: "SubsidiaryTour" },
          { path: "originalTourId", model: "OriginalTour" },
        ],
      });

      const refunds = await Refund.find({
        ticketId: { $in: tickets.map((ticket) => ticket._id) },
      });

      const refundStatusMap = new Map();
      refunds.forEach((refund) => {
        refundStatusMap.set(refund.ticketId.toString(), refund.refundStatus);
      });

      // Phân loại upcoming và completed
      const upcomingTickets = [];
      const completedTickets = [];
      const refundedTickets = [];

      tickets.forEach((ticket) => {
        const subTour = ticket.bookingId?.subTourId;

        if (subTour && subTour.dateEnd) {
          const dateEnd = new Date(subTour.dateEnd);
          dateEnd.setHours(0, 0, 0, 0); // Chỉ lấy phần ngày

          // Chuyển ticket thành plain object để có thể thêm thuộc tính
          const ticketObject = ticket.toObject();

          // Phân loại
          if (refundStatusMap.has(ticket._id.toString())) {
            ticketObject.refundStatus = refundStatusMap.get(
              ticket._id.toString()
            );
            refundedTickets.push(ticketObject);
          } else if (!ticket.isCancel) {
            // Chỉ xét upcoming/completed nếu không bị hủy
            if (dateEnd >= today) {
              upcomingTickets.push(ticketObject);
            } else {
              completedTickets.push(ticketObject);
            }
          }
        }
      });
      res.status(200).json({
        status: "success",
        upcomingTickets,
        completedTickets,
        refundedTickets,
      });
    } catch (error) {
      next(error);
    }
  }

  // [PUT] /ticket/update/:ticketId
  async updateTicket(req, res, next) {
    try {
      const { ticketId } = req.params; // Lấy ticketId từ URL params
      const updateData = req.body; // Dữ liệu cần cập nhật từ body

      // Tìm và cập nhật ticket
      const updatedTicket = await Ticket.findByIdAndUpdate(
        ticketId,
        updateData,
        { new: true, runValidators: true } // Trả về ticket đã cập nhật và chạy validation
      );

      if (!updatedTicket) {
        return res.status(404).json({
          status: "error",
          message: "Ticket not found",
        });
      }

      res.status(200).json({
        status: "success",
        message: "Ticket updated successfully",
        ticket: updatedTicket,
      });
    } catch (error) {
      console.error("Error updating ticket:", error);
      next(error);
    }
  }

  // [GET] /ticket/check-availability/:subTourId
  async checkAvailability(req, res, next) {
    try {
      const { subTourId } = req.params;
      const { bookedSlot, ticketId } = req.body;

      // Tìm subTour theo ID
      const subTour = await SubsidiaryTour.findById(subTourId);
      const ticket = await Ticket.findById(ticketId);
      if (!subTour) {
        return res
          .status(404)
          .json({ status: "error", message: "SubTour not found" });
      }
      if (!ticket) {
        return res
          .status(404)
          .json({ status: "error", message: "Ticket not found" });
      }

      // Kiểm tra điều kiện isHide, isCancel, isDelete
      if (subTour.hide || subTour.isCanceled || subTour.isDeleted) {
        ticket.isCancel = true;
        await ticket.save();
        return res.status(400).json({
          status: "error",
          message: "This tour is not available for booking",
        });
      }

      // Tính số slot còn lại
      const availableSlots = subTour.availableSlots - bookedSlot;

      if (availableSlots < 0) {
        ticket.isCancel = true;
        await ticket.save();
        return res.status(400).json({
          status: "error",
          message: "This tour is not available for booking",
        });
      }

      res.status(200).json({
        status: "success",
      });
    } catch (error) {
      next(error);
    }
  }
  async checkInTicket(req, res, next) {
    try {
      const { ticketId } = req.params;
      // Handle both old and new request format
      const requestBody = req.body;
      let checkinData = [];

      // Check if there is checkinData field in the request
      if (requestBody.checkinData) {
        checkinData = requestBody.checkinData;
      } else if (Array.isArray(requestBody)) {
        // Handle the case where the request body directly is an array
        checkinData = requestBody;
      } else {
        console.error("Invalid request body format:", requestBody);
        return res.status(400).json({
          status: "error",
          message: "Invalid request format. Expected checkinData array",
        });
      }

      // Validate each checkin detail object if there are any
      if (checkinData.length > 0) {
        for (const detail of checkinData) {
          if (
            !detail.customerName ||
            !detail.customerPhoneNumber ||
            !detail.customerIdentityNumber
          ) {
            return res.status(400).json({
              status: "error",
              message:
                "Each checkin detail must include customerName, customerPhoneNumber, and customerIdentityNumber",
            });
          }
        }
      }

      // Find ticket by ID
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        return res.status(404).json({
          status: "error",
          message: "Ticket not found",
        });
      }

      // Find associated booking
      const booking = await Booking.findById(ticket.bookingId);
      if (!booking) {
        return res.status(400).json({
          status: "error",
          message: "Associated booking not found",
        });
      }

      // Check if ticket is cancelled
      if (ticket.isCancel) {
        return res.status(400).json({
          status: "error",
          message: "Cannot check in a cancelled ticket",
        });
      }

      // Update ticket with checkin details
      const wasCheckedIn = ticket.isCheckedIn;
      ticket.checkinDetails = checkinData;

      // If isCheckedIn is explicitly provided in the request, use that value
      if (requestBody.isCheckedIn !== undefined) {
        ticket.isCheckedIn = requestBody.isCheckedIn;
      } else {
        // Otherwise determine it based on checkinData
        ticket.isCheckedIn = checkinData.length > 0;
      }

      const updatedTicket = await ticket.save();

      let message;
      if (ticket.isCheckedIn) {
        message = wasCheckedIn
          ? "Ticket check-in updated successfully"
          : "Ticket checked in successfully";
      } else {
        message = "Ticket check-in cleared successfully";
      }

      return res.status(200).json({
        status: "success",
        message,
        ticket: updatedTicket,
      });
    } catch (error) {
      console.error("Error processing check-in:", error);
      return res.status(500).json({
        status: "error",
        message: "Internal Server Error: Unable to process ticket",
        error: error.message,
      });
    }
  }
  async getTicketsBySubTourId(req, res, next) {

    try {
      const { subTourId } = req.params;

      const tickets = await Ticket.find({}).populate("bookingId");
      // console.log(tickets);

      const filterTicketsBySubTourId = [];

      tickets.forEach((ticket) => {

        if (ticket.bookingId.subTourId == subTourId) {
          filterTicketsBySubTourId.push(ticket);
        }
      });

      // Check if no tickets are found
      if (filterTicketsBySubTourId.length <= 0) {
        return res.status(404).json({ message: "ticket is empty" }); // Return to stop further execution
      }
      // Send filtered tickets
      return res.status(200).json(filterTicketsBySubTourId); // Return to stop further execution
    } catch (error) {
      next(error); // Pass errors to the next middleware (e.g., error handler)
    }
  }


  async getTicketsBySubTourId(req, res, next) {
    try {
      const { subTourId } = req.params;
      console.log(subTourId);

      // Fetch tickets and populate bookingId
      const tickets = await Ticket.find({}).populate("bookingId");

      // Filter tickets where bookingId.subTourId matches subTourId
      const filterTicketsBySubTourId = tickets.filter((ticket) => {
        // Ensure bookingId exists and subTourId is an ObjectId
        if (!ticket.bookingId || !ticket.bookingId.subTourId) return false;

        // Convert ObjectId to string for comparison
        return ticket.bookingId.subTourId.toString() === subTourId;
      });

      // Check if no tickets are found
      if (filterTicketsBySubTourId.length === 0) {
        return res.status(200).json({
          message: "No tickets found for this subTourId",
          length: tickets.length,
          reviews: tickets,
        });
      }

      // Send filtered tickets
      return res.status(200).json({ reviews: filterTicketsBySubTourId });
    } catch (error) {
      next(error); // Pass errors to the error-handling middleware
    }
  }

  async getCheckInDetailsByTicketId(req, res, next) {
    try {
      const { ticketId } = req.params;

      // Validate ticketId
      if (!mongoose.Types.ObjectId.isValid(ticketId)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid ticket ID",
        });
      }

      // Find the ticket by ticketId
      const ticket = await Ticket.findById(ticketId).populate("bookingId");

      if (!ticket) {
        return res.status(404).json({
          status: "error",
          message: "Ticket not found",
        });
      }

      // Ensure checkinDetails exists and is an array
      const checkins = Array.isArray(ticket.checkinDetails)
        ? ticket.checkinDetails
        : [];

      if (checkins.length === 0) {
        return res.status(200).json({
          status: "success",
          message: "No check-in details found for this ticket",
          checkins: [],
        });
      }

      res.status(200).json({
        status: "success",
        checkins,
      });
    } catch (error) {
      console.error("Error fetching check-in details:", error);
      res.status(500).json({
        status: "error",
        message: "Internal Server Error: Unable to fetch check-in details",
        error: error.message,
      });
    }
  }
  async getTicketsByUserId(req, res, next) {
    try {
      const { userId } = req.params;

      // Find bookings for the user
      const bookings = await Booking.find({ userId }).select("_id");
      const bookingIds = bookings.map((booking) => booking._id);

      // Find tickets associated with those bookings
      const tickets = await Ticket.find({ bookingId: { $in: bookingIds } })
        .populate({
          path: "bookingId",
          populate: {
            path: "subTourId",
            select: "subTourCode",
          },
        })
        .lean();

      if (!tickets || tickets.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No tickets found for this user",
          tickets: [],
        });
      }

      return res.status(200).json({
        success: true,
        tickets,
      });
    } catch (error) {
      console.error("Error fetching tickets by userId:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }
  async getTicketsByBookingIds(req, res, next) {
    try {
      const { bookingIds } = req.body;
      if (!bookingIds || !Array.isArray(bookingIds)) {
        return res.status(400).json({
          success: false,
          message: "bookingIds must be an array",
        });
      }

      const tickets = await Ticket.find({ bookingId: { $in: bookingIds } })
        .populate({
          path: "bookingId",
          populate: {
            path: "subTourId",
            select: "subTourCode",
          },
        })
        .lean();

      return res.status(200).json({
        success: true,
        tickets,
      });
    } catch (error) {
      console.error("Error fetching tickets by bookingIds:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }
}
module.exports = new TicketController();
