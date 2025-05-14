const favoriteTourRouter = require("./favoriteTours");
const reviewRouter = require("./review");
const ticketRouter = require("./ticket");
const paymentRouter = require("./payment");
const chatRouter = require("./chatbot");
const originalToursRoutes = require("./originalTours"); // Thêm dòng này
const subsidiaryToursRoutes = require("./subsidiaryTours"); // Thêm dòng này
const bookingRouter = require("./booking"); // Thêm dòng này

const discountRouter = require("./discount");
const superAdminRouter = require("./superAdmin");
const usedDiscountRouter = require("./usedDiscount");
const customerRouter = require("./customer");
const authengoogleRouter = require("./authengoogle");
const guideRouter = require("./guide");

const subTourRouter = require("./subTour");
const cartRouter = require("./cart");
const refundRouter = require("./refund");

const notificationRouter = require("./notification");

const trashRouter = require("./trash");

function routes(app) {
  app.use("/payment", paymentRouter);
  app.use("/originalTour", originalToursRoutes);
  // app.use("/subTour", subTourRouter);
  // app.use("/subsidiaryTours", subTourRouter);
  app.use("/discount", discountRouter);
  app.use("/account/superAdmin", superAdminRouter);
  app.use("/usedDiscount", usedDiscountRouter);
  app.use("/auth/google", authengoogleRouter);
  app.use("/account/customer", customerRouter);
  app.use("/account/guide", guideRouter);
  app.use("/account", customerRouter);

  app.use("/review-tour", reviewRouter); // change
  app.use("/ticket", ticketRouter); // change
  app.use("/refund", refundRouter); // change
  app.use("/favoriteTours", favoriteTourRouter);
  app.use("/cart", cartRouter);
  app.use("/chat", chatRouter);

  app.use("/booking", bookingRouter);
  app.use("/originalTours", originalToursRoutes); // Thêm dòng này
  app.use("/subsidiaryTours", subsidiaryToursRoutes); // Thêm dòng này

  app.use("/notification", notificationRouter);

  app.use("/trash", trashRouter);
}

module.exports = routes;
