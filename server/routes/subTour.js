const express = require("express");
const router = express.Router();

const toursController = require("../controllers/SubsidiaryToursController");

router.get("/allSubTours", toursController.getAllSubTours);
router.get("/:subTourId", toursController.getSubTourById);
router.post("/createSub", toursController.createSubTour);

module.exports = router;
