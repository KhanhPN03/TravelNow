const WebSocket = require("ws");
const Cart = require("../models/Cart");
const SubTour = require("../models/SubsidiaryTour");
const Booking = require("../models/Booking");

const updateSlotOfSubTour = async (subTourId, slotsBooked) => {
  try {
    const subTour = await SubTour.findById(subTourId);
    if (subTour) {
      const updatedSlots = subTour.availableSlots + slotsBooked;
      // Đảm bảo availableSlots không vượt quá totalSlots
      const availableSlots = Math.min(updatedSlots, subTour.totalSlots);

      await SubTour.findOneAndUpdate(
        { _id: subTourId },
        {
          $set: {
            availableSlots: availableSlots,
          },
        }
      );

      console.log(
        `Updated availableSlots for SubTour ${subTourId}: ${availableSlots}`
      );
    }
  } catch (error) {
    console.log(error);
  }
};

const cartSocket = (server) => {
  const wss = new WebSocket.Server({ noServer: true });
  const countdowns = {}; // Lưu trạng thái countdown cho từng itemId
  let intervalId = null;

  wss.on("connection", (ws) => {
    console.log("Cart WebSocket connected");

    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message);  
        if (
          data?.type === "startCountdown" &&
          data?.userId &&
          data?.itemId &&
          data?.subTourId &&
          data?.slotsBooked
        ) {
          const cart = await Cart.findOne({ userId: data.userId });
          if (cart) {
            const item = cart.cartIds.find(
              (cartItem) => cartItem._id.toString() === data.itemId
            );         
            if (item && item.isActive) {
              const now = new Date();
              const timeLeft = new Date(item.expireAt) - now;
              console.log("Initial TimeLeft for item", item._id, ":", timeLeft);

              if (timeLeft > 0) {
                countdowns[item._id] = {
                  startTime: now,
                  expireAt: item.expireAt,
                  userId: data.userId,
                  subTourId: data.subTourId,
                  slotsBooked: data.slotsBooked,  
                  inPayment: false,           
                };
                ws.send(
                  JSON.stringify({
                    type: "countdown",
                    itemId: item._id,
                    timeLeft: Math.floor(timeLeft / 1000),
                  })
                );
              } else {
                item.isActive = false;
                await updateSlotOfSubTour(item.subTourId, item.slotsBooked);
                await cart.save();
                ws.send(
                  JSON.stringify({
                    type: "expired",
                    itemId: item._id,
                    subTourId: item.subTourId,
                    userId: data.userId,
                  })
                );
              }

              if (!intervalId) {
                intervalId = setInterval(() => {
                  let hasActiveCountdowns = false;

                  for (const itemId in countdowns) {
                    const {
                      expireAt,
                      userId,
                      subTourId,
                      slotsBooked, 
                      inPayment                
                    } = countdowns[itemId];
                    const now = new Date();
                    const timeLeft = Math.max(
                      0,
                      Math.floor((expireAt - now) / 1000)
                    );

                    wss.clients.forEach(async (client) => {
                      if (client.readyState === WebSocket.OPEN) {
                        if (timeLeft > 0) {
                          client.send(
                            JSON.stringify({
                              type: "countdown",
                              itemId: itemId,
                              timeLeft: timeLeft,
                            })
                          );
                          hasActiveCountdowns = true;
                        } else if(!inPayment){
                          // Hết hạn và không trong thanh toán: Hoàn slot ngay
                          delete countdowns[itemId];
                          const cart = await Cart.findOne({ userId });
                          const cartItem = cart.cartIds.find(
                            (i) => i._id.toString() === itemId
                          );
                          if (cartItem && cartItem.isActive) {
                            cartItem.isActive = false;
                            await updateSlotOfSubTour(subTourId, slotsBooked);
                            await cart.save();
                            console.log(
                              "Auto-updated slot due to expiration:",
                              itemId
                            );
                          }
                          client.send(
                            JSON.stringify({
                              type: "expired",
                              itemId: itemId,
                              subTourId: subTourId,
                              userId: userId,
                            })
                          );
                        } else {                  
                          client.send(
                            JSON.stringify({
                              type: "expired",
                              itemId: itemId,
                              subTourId: subTourId,
                              userId: userId,
                            })
                          );
                        }
                      }
                    });
                    // console.log(
                    //   `Sent timeLeft: ${timeLeft} for item: ${itemId}`
                    // );
                  }

                  if (
                    !hasActiveCountdowns &&
                    Object.keys(countdowns).length === 0
                  ) {
                    clearInterval(intervalId);
                    intervalId = null;
                    console.log(
                      "Stopped interval as no active countdowns remain"
                    );
                  }
                }, 1000);
              }
            }
          }
        }

        if (data?.type === "removeItem" && data?.itemId) {
          if (countdowns[data.itemId]) {
            delete countdowns[data.itemId];
            console.log(`Removed countdown for item: ${data.itemId}`);

            if (Object.keys(countdowns).length === 0 && intervalId) {
              clearInterval(intervalId);
              intervalId = null;
              console.log(
                "Stopped interval as no active countdowns remain after remove"
              );
            }
          }
        }

        if (data?.type === "startPayment" && data?.itemId) {
          console.log("startPayment: ", data?.itemId);
          // Đánh dấu item đang trong thanh toán
          if (countdowns[data.itemId]) {
            countdowns[data.itemId].inPayment = true;
            console.log("Item marked as inPayment:", data.itemId);
          }
        }
        if (
          data.type === "outPayment" &&
          data?.itemId   
        ) {
          console.log("Received outPayment for item:", data.itemId);
          const countdown = countdowns[data.itemId];
          if (countdown) {
            const now = new Date();
            const timeLeft = Math.floor((countdown.expireAt - now) / 1000);
            console.log("TimeLeft calculated in cartSocket:", timeLeft);

            if (timeLeft < 0) {
              const cart = await Cart.findOne({ userId: countdown.userId });
              const cartItem = cart.cartIds.find(
                (i) => i._id.toString() === data.itemId
              );
              if (cartItem && cartItem.isActive) {
                cartItem.isActive = false;
                await updateSlotOfSubTour(
                  countdown.subTourId,
                  countdown.slotsBooked
                );
                await cart.save();
                console.log(
                  "Updated slot due to outPayment and expired:",
                  data.itemId
                );
              }
            }
            delete countdowns[data.itemId];
          } 
          // else {  
          //   const cart = await Cart.findOne({ userId: data.userId });
          //   const cartItem = cart.cartIds.find(
          //     (i) => i._id.toString() === data.itemId
          //   );
          //   if (cartItem && cartItem.isActive) {
          //     const now = new Date();
          //     const timeLeft = Math.floor((cartItem.expireAt - now) / 1000);
          //     if (timeLeft < 0) {
          //       cartItem.isActive = false;
          //       await updateSlotOfSubTour(cartItem.subTourId, cartItem.slotsBooked);
          //       await cart.save();
          //       console.log("Updated slot due to outPayment (no countdown):", data.itemId);
          //     }
          //   }
          // }
        }
      } catch (error) {
        console.error("Error in cartSocket:", error);
      }
    });

    ws.on("close", () => {
      console.log("Cart WebSocket disconnected");
    });
  });

  return wss;
};

module.exports = cartSocket;
