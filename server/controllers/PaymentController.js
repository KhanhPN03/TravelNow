require("dotenv").config();
const crypto = require("crypto");
const PayOS = require("@payos/node");
const Booking = require("../models/Booking");
const SubTour = require("../models/SubsidiaryTour");
const Ticket = require("../models/Ticket");
const Discount = require("../models/Discount");
const UsedDiscount = require("../models/UsedDiscount");
const payos = new PayOS(
  process.env.CLIENT_ID_PAYOS,
  process.env.API_KEY_PAYOS,
  process.env.CHECKSUM_KEY_PAYOS
);
const { getPaymentSocket } = require("../websocket");

class PaymentController {
  async createOrder(req, res, next) {
    const generateSignature = (order) => {
      const { amount, cancelUrl, description, orderCode, returnUrl } = order;
      console.log("amount: ", amount);
      const rawSignature = `amount=${amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;
      return crypto
        .createHmac(
          "sha256",
          "93612a2ecb5394d6556011b2f68a6d9365b8d7bccf812b6a5627b22a4b5bf726"
        )
        .update(rawSignature)
        .digest("hex");
    };

    try {
      const order = req.body;
      order.signature = generateSignature(order);
      const paymentLink = await payos.createPaymentLink(order);

      res.status(200).json(paymentLink);
    } catch (error) {
      console.error("Payment creation error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  static generateTicketRef() {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  }

  async listenWebhook(req, res, next) {
    try {
      const { code, data } = req.body;
      console.log("data: ", data);
      if (code === "00") {
        const { orderCode, amount } = data;

        // 1️⃣ Truy vấn đơn hàng theo orderCode
        const booking = await Booking.findOne({ orderCode });
        if (!booking) {
          console.error("Order not found:", orderCode);
          return res.status(404).json({ error: "Order not found" });
        }

        // 2️⃣ Kiểm tra và xử lý Discount nếu có
        if (booking.discountId) {
          const discount = await Discount.findById(booking.discountId);
          if (!discount) {
            console.error("Discount not found:", booking.discountId);
          } else {
            const currentDate = new Date();
            // Kiểm tra tính hợp lệ của Discount
            if (
              new Date(discount.discountDateStart) > currentDate ||
              new Date(discount.discountDateEnd) < currentDate
            ) {
              console.error("Discount is invalid", discount.discountCode);
              return res.status(400).json({ error: "Discount is invalid" });
            }
            if (discount.discountAvailableSlots <= 0) {
              console.error("Discount slots exhausted:", discount.discountCode);
              return res
                .status(400)
                .json({ error: "Discount slots exhausted" });
            }

            // Tạo bản ghi UsedDiscount
            await UsedDiscount.create({
              bookingId: booking._id,
              discountId: discount._id,
              userId: booking.userId, // Giả định Booking có trường userId
            });

            // Giảm số lượt sử dụng còn lại
            discount.discountAvailableSlots -= 1;

            // Kiểm tra nếu slots còn lại bằng 0 thì đặt isActive = false
            if (discount.discountAvailableSlots === 0) {
              discount.isActive = false;
              console.log(
                `✅ Discount ${discount.discountCode} deactivated (no slots left)`
              );
            }

            await discount.save();
            console.log(
              `✅ Discount ${discount.discountCode} applied, slots left: ${discount.discountAvailableSlots}`
            );
          }
        }

        try {
          // 2️⃣ Cập nhật doanh thu cho SubTour
          const subTour = await SubTour.findById(booking.subTourId);
          if (!subTour) {
            console.error("SubTour not found:", booking.subTourId);
          } else {
            subTour.revenue += amount; // Cộng doanh thu
            await subTour.save();
            console.log(
              `✅ Revenue updated: +${amount} for SubTour ${subTour._id}`
            );
          }

          const ticket = await Ticket.create({
            bookingId: booking._id,
            ticketRef: PaymentController.generateTicketRef(),
          });
          console.log("✅ Ticket created:", ticket);
          booking.bookingStatus = "Confirmed";
          await booking.save();

          const wss = getPaymentSocket();
          wss.clients.forEach((client) => {
            if (client.readyState === client.OPEN) {              
              client.send(
                JSON.stringify({
                  status: true,
                })
              );
            }
          });
        } catch (error) {
          console.error("❌ Error creating ticket:", error);
        }
      }
      // Gửi phản hồi ngay lập tức
      res.status(200).send("Webhook received");
    } catch (error) {
      next(error);
    }
  }

  async cancelOrder(req, res, next) {
    const { orderCode } = req.body;
    const reason = "";
    try {
      const cancelledPaymentLink = await payos.cancelPaymentLink(
        orderCode,
        reason
      );
      res.status(200).json(cancelledPaymentLink);
    } catch (error) {
      console.log(error.message);
    }
  }
  async infoOrder(req, res, next) {
    const orderCode = "1739095777534";
    try {
      const paymentLink = await payos.getPaymentLinkInformation(orderCode);
      res.status(200).json(paymentLink);
    } catch (error) {
      console.log(error.message);
      Minh;
    }
  }
}

module.exports = new PaymentController();
