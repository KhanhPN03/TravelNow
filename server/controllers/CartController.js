const Cart = require("../models/Cart");
const SubTour = require("../models/SubsidiaryTour");
const OriginalTour = require("../models/OriginalTour");

class CartController {
  // [GET] /:userId
  async getCart(req, res, next) {
    try {
      const cart = await Cart.findOne({ userId: req.params.userId })
        .populate("userId")
        .populate({
          path: "cartIds.originalTourId",
          model: "OriginalTour",
        })
        .populate({
          path: "cartIds.subTourId",
          model: "SubsidiaryTour",
        });

      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      res.status(200).json({
        cart,
      });
    } catch (error) {
      console.log("Error cart: ", error);
      next(error);
    }
  }

  //[PUT] cart/update-inbooking-status
  async updateInBookingStatus(req, res, next) {
    try {
      const { userId, cartItemId, inBooking } = req.body;

      // Kiểm tra dữ liệu đầu vào
      if (!userId || !cartItemId || typeof inBooking !== "boolean") {
        return res
          .status(400)
          .json({ error: "Missing or invalid required fields" });
      }

      // Tìm và cập nhật thuộc tính inBooking của cart item
      const cart = await Cart.findOneAndUpdate(
        {
          userId: userId,
          "cartIds._id": cartItemId,
        },
        {
          $set: {
            "cartIds.$.inBooking": inBooking,
          },
        },
        { new: true }
      );

      if (!cart) {
        return res.status(404).json({ error: "Cart or Cart Item not found" });
      }

      return res
        .status(200)
        .json({ message: "Updated inBooking status", cart });

    } catch (error) {
      next(error);
    }
  }

  // [POST] /
  async addToCart(req, res, next) {
    try {
      console.log(req.body);
      const { userId, originalTourId, subTourId, slotsBooked } = req.body;

      if (!userId || !originalTourId || !subTourId || !slotsBooked) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Tìm Cart của người dùng
      let cart = await Cart.findOne({ userId });

      if (!cart) {
        // Nếu không có Cart, tạo mới
        cart = new Cart({ userId, cartIds: [] });
      }

      // Kiểm tra tour đã có trong Cart chưa
      const existingTourIndex = cart.cartIds.findIndex(
        (item) => item.subTourId.toString() === subTourId
      );

      let expireTime = new Date(Date.now() + 10 * 1000);

      if (existingTourIndex > -1) {
        // Nếu tour đã có, cộng dồn số slot
        cart.cartIds[existingTourIndex].slotsBooked += slotsBooked;
        // Cập nhật thời gian hết hạn khi thêm slot mới
        cart.cartIds[existingTourIndex].expireAt = expireTime;
        cart.cartIds[existingTourIndex].isActive = true;
      } else {
        // Nếu tour chưa có, thêm mới
        cart.cartIds.push({
          originalTourId,
          subTourId,
          slotsBooked,
          expireAt: expireTime, // 10 phút kể từ khi thêm
          isActive: true,
        });
      }

      // Trừ số slot của tour
      const subTour = await SubTour.findById(subTourId);
      if (subTour.availableSlots < slotsBooked) {
        return res.status(400).json({ message: "Not enough available slots" });
      }
      subTour.availableSlots -= slotsBooked;

      // Lưu cả Cart và Tour
      await cart.save();
      await subTour.save();

      return res.status(200).json({ message: "Tour added to cart", cart });
    } catch (err) {
      console.error("Error adding to cart:", err);
      next(err);
    }
  }

  // [PUT] cart/add-back-to-cart
  async addbackToCart(req, res, next) {
    try {
      const { subTourId, slotsBooked, cartItemId } = req.body;
     
      if (!subTourId) {
        return res
          .status(404)
          .json({ status: "failed", message: "Not found subTourId" });
      }

      let expireTime = new Date(Date.now() + 10 * 1000);

      const subTour = await SubTour.findById(subTourId);
      if (subTour && !subTour.hide && !subTour.isCanceled && !subTour.isDeleted) {
        if (subTour.availableSlots >= slotsBooked) {
          const cartItem = await Cart.findOneAndUpdate(
            { "cartIds._id": cartItemId },
            {
              // Dấu $ sẽ đại diện cho chỉ mục của phần tử đó trong mảng,
              // cho phép bạn cập nhật trực tiếp thuộc tính của phần tử đó mà không cần biết chính xác nó ở vị trí nào trong mảng.
              $set: {
                "cartIds.$.isActive": true,
                "cartIds.$.expireAt": expireTime,
              },
            }
          );
          const blockedSlots = subTour.availableSlots - slotsBooked;
          subTour.availableSlots = blockedSlots;
          if (cartItem) {
            await subTour.save();
            return res.status(200).json({ status: "success" });
          } else {
            return res
              .status(404)
              .json({ status: "failed", message: "Cart item not found" });
          }
        }
        else {
          return res.status(400).json({
            status: "failed",
            message: "Not enough slots available",
          });
        }
      } else {
        return res
          .status(404)
          .json({ status: "failed", message: "SubTour not found" });
      }
    } catch (error) {
      next(error);
    }
  }

  // [DELETE] /:userId/:cartItemId/slotsBooked
  async deleteCartTour(req, res, next) {
    try {
      const { userId, cartItemId, slotsBooked } = req.params;

      // Ép kiểu slotsBooked sang Number
      const bookedSlots = Number(slotsBooked);

      const cart = await Cart.findOne({ userId: userId });
      if (!cart) {
        return res.status(404).json({ error: "Cart not found" });
      }

      const existingTourIndex = cart.cartIds.findIndex(
        (item) => item._id.toString() === cartItemId
      );

      // Kiểm tra nếu không tìm thấy cartItemId
      if (existingTourIndex === -1) {
        return res.status(404).json({ error: "Cart item not found" });
      }

      if (cart.cartIds[existingTourIndex].isActive) {
        const subTourId = cart.cartIds[existingTourIndex].subTourId;

        if (subTourId) {
          const subTour = await SubTour.findById(subTourId);
          if (subTour) {
            subTour.availableSlots += bookedSlots;
            await subTour.save();
          }
        }
      }
      // Xóa tour khỏi giỏ hàng
      cart.cartIds.splice(existingTourIndex, 1);

      //update slot
      await cart.save();

      return res.status(200).json({ message: "Tour removed from cart", cart });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CartController();
