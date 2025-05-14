// subsidiaryTours.js
const express = require("express");
const router = express.Router();
const subsidiaryToursController = require("../controllers/SubsidiaryToursController");
const generateCustomIdMiddleware = require("../middleware/handleCustomId");

router.get(
  "/getSubToursByOrgTourId/:orgTourId",
  subsidiaryToursController.getSubTourByOrgTourId
);
router.get(
  "/deleted/get-all-subtours",
  subsidiaryToursController.getAllRemovedSubTours
);
router.post(
  "/",
  generateCustomIdMiddleware,
  subsidiaryToursController.createSubTour
);
router.delete(
  "/softDelete/:subTourId/:userId",
  subsidiaryToursController.softDeleteSubTourById
);
router.delete(
  "/hardDelete/:subTourId/:userId",
  subsidiaryToursController.hardDeleteSubTourById
);
router.put("/restore/:subTourId/:userId", subsidiaryToursController.restoreSubTourById);
router.get(
  "/getByOriginal/:originalTourId",
  subsidiaryToursController.getSubsidiaryToursByOriginalTour
);
router.get("/byGuide/:guideId", subsidiaryToursController.getSubToursByGuideId);
router.get("/:subTourId", subsidiaryToursController.getSubTourById);
router.get("/", subsidiaryToursController.getAllSubTours);
// New endpoint for fetching tours by guide ID

module.exports = router;