const Booking = require("../models/Booking");
const SubTour = require("../models/SubsidiaryTour");
const Cart = require("../models/Cart");
const { getPaymentSocket } = require("../websocket");

class BookingController {
  static pendingBooking = new Map();

  static trackBookingProgress(bookingId, inBooking) {
    // Sau 1 phút, nếu đơn hàng chưa được cập nhật, hoàn lại slot
    const timeout = setTimeout(async () => {
      try {
        const booking = await Booking.findOne({ _id: bookingId });
        if (booking && booking.bookingStatus !== "Confirmed") {
          console.log(
            `⏳ BookingId ${bookingId} không thanh toán trong 10 phút. Hoàn slot...`
          );

          // Cập nhật trạng thái đơn hàng
          booking.bookingStatus = "Failed";
          await booking.save();

          if (!inBooking) {
            // Tìm subTour dựa trên subTourId của booking
            const subTour = await SubTour.findById(booking.subTourId);
            if (subTour) {
              // Cập nhật availableSlots mà không validate lại schema
              await SubTour.findByIdAndUpdate(
                booking.subTourId,
                { $inc: { availableSlots: booking.bookedSlot } }, // Cộng thêm bookedSlot
                { new: true, runValidators: false } // Không chạy lại validate schema
              );
            }
          }


          const wss = getPaymentSocket();
          wss.clients.forEach((client) => {
            if (client.readyState === client.OPEN) {
              client.send(
                JSON.stringify({
                  status: "timeup",
                })
              );
            }
          });
        }
      } catch (error) {
        console.error("❌ Lỗi cập nhật slot:", error);
      } finally {
        BookingController.pendingBooking.delete(bookingId); // Xóa khỏi danh sách theo dõi
      }
    }, 10 * 60 * 1000);

    BookingController.pendingBooking.set(bookingId.toString(), timeout);
  }

  async clearTimeout(req, res, next) {
    try {
      const { bookingId } = req.body;
      if (!bookingId) {
        return res.status(400).json({ error: "Order code is required" });
      }
      console.log("clearTimeout");
      if (BookingController.pendingBooking.has(bookingId)) {
        clearTimeout(BookingController.pendingBooking.get(bookingId));
        BookingController.pendingBooking.delete(bookingId);
        console.log(`🟢 Timeout for order ${bookingId} has been cleared.`);
        return res
          .status(200)
          .json({ message: "Timeout cleared successfully" });
      } else {
        return res
          .status(404)
          .json({ error: "No active timeout found for this order" });
      }
    } catch (error) {
      console.error("❌ Error clearing timeout:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async createBooking(req, res, next) {
    try {
      const {
        orderCode,
        userId,
        originalTourId,
        subTourId,
        bookedSlot,
        totalPrice,
      } = req.body;
      let finalPrice = totalPrice;

      if (!req.body?.inBooking) {
        const updatedSubTour = await SubTour.findOneAndUpdate(
          { _id: subTourId, availableSlots: { $gte: bookedSlot } }, // Chỉ cập nhật nếu slot đủ
          { $inc: { availableSlots: -bookedSlot } }, // Trừ slot
          { new: true } // Lấy dữ liệu mới sau update
        );

        if (!updatedSubTour) {
          return res
            .status(400)
            .json({ message: "Not enough slots available" });
        }
      }

      const newBooking = await Booking.create({
        orderCode,
        userId,
        originalTourId,
        subTourId,
        bookedSlot,
        bookingStatus: "Pending",
        totalPrice,
        finalPrice,
      });

      BookingController.trackBookingProgress(newBooking._id, req.body?.inBooking);

      res.status(201).json({
        message: "Booking created successfully",
        booking: newBooking,
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT booking/update/:bookingId
  async updateBooking(req, res, next) {
    try {
      const { bookingId } = req.params;
      const updates = req.body; // Chứa các thông tin cần cập nhật

      // Tìm booking cần cập nhật
      const updatedBooking = await Booking.findByIdAndUpdate(
        bookingId,
        updates,
        { new: true, runValidators: true } // Trả về dữ liệu mới và chạy validate
      );

      if (!updatedBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.status(200).json({
        message: "Booking updated successfully",
        booking: updatedBooking,
      });
    } catch (error) {
      next(error);
    }
  }
  async getBookingsByUserId(req, res, next) {
    try {
      const { userId } = req.params;
      const bookings = await Booking.find({ userId })
        .populate("subTourId", "subTourCode")
        .lean();

      return res.status(200).json({
        success: true,
        bookings,
      });
    } catch (error) {
      console.error("Error fetching bookings by userId:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  };
  async getBookingById(req, res, next) {
    try {
      const { bookingId } = req.params; // Lấy bookingId từ URL params

      if (!bookingId) {
        return res.status(400).json({ message: "Booking ID is required" });
      }

      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      return res.status(200).json({ booking: booking });
    } catch (error) {
      console.error("Error fetching booking:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async updateSlotSubTourByBookingId(req, res, next) {
    try {
      const { bookingId } = req.params;
      const { paymentSuccess } = req.body;

      // Tìm booking dựa trên bookingId
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Tìm subTour dựa trên subTourId của booking
      const subTour = await SubTour.findById(booking.subTourId);
      if (!subTour) {
        return res.status(404).json({ message: "SubTour not found" });
      }

      // Cập nhật availableSlots mà không validate lại schema
      if (paymentSuccess) {
        console.log("minus booked slot");
        await SubTour.findByIdAndUpdate(
          booking.subTourId,
          { $inc: { availableSlots: -booking.bookedSlot } }, // minus thêm bookedSlot
          { new: true, runValidators: false } // Không chạy lại validate schema
        );
      } else {
        await SubTour.findByIdAndUpdate(
          booking.subTourId,
          { $inc: { availableSlots: booking.bookedSlot } }, // Cộng thêm bookedSlot
          { new: true, runValidators: false } // Không chạy lại validate schema
        );
      }

      res.status(200).json({
        message: "Updated available slots successfully",
        subTour,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BookingController();
