const express = require("express");
const router = express.Router();
const originalToursController = require("../controllers/OriginalToursController");
const generateCustomIdMiddleware = require("../middleware/handleCustomId");

router.get("/searchOriginal", originalToursController.searchOriginal);
router.get("/:originalTourId", originalToursController.getOriginalTourById);
router.get(
  "/deleted/get-all-orgtours",
  originalToursController.getAllRemovedOriginalTours
);
router.post(
  "/",
  generateCustomIdMiddleware,
  originalToursController.createOriginalTour
);
router.delete(
  "/softDelete/:originalTourId/:userId",
  originalToursController.softDeleteOriginalTourById
);
router.delete(
  "/hardDelete/:originalTourId/:userId",
  originalToursController.hardDeleteOriginalTourById
);
router.put(
  "/restore/:originalTourId/:userId",
  originalToursController.restoreOriginalTourById
);
router.get("/", originalToursController.getAllOriginalTours);

module.exports = router;
