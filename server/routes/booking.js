// hoai change
const express = require("express");
const router = express.Router();
const BookingController = require("../controllers/BookingController");

router.post('/create', BookingController.createBooking);
router.post('/clear-timeout', BookingController.clearTimeout);
router.put('/update/:bookingId', BookingController.updateBooking);
router.put('/subtour/update-slot/:bookingId', BookingController.updateSlotSubTourByBookingId);
router.get('/user/:userId', BookingController.getBookingsByUserId);
router.get('/:bookingId', BookingController.getBookingById);
module.exports = router;
