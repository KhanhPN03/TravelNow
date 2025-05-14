const express = require("express");
const router = express.Router();
const GuideController = require("../controllers/GuideController");
const generateCustomIdMiddleware = require("../middleware/handleCustomId");

router.post(
  "/",
  generateCustomIdMiddleware,
  GuideController.createGuideAccount
);
router.get("/", GuideController.getAllGuide);
router.get("/:guideId", GuideController.getGuideById);
router.put("/:accountId", GuideController.updateGuide);
router.delete("/softDelete/:accountId/:userId", GuideController.softDelete);
router.delete("/:guideId/:userId", GuideController.deleteGuide); // Hard delete
router.put("/restore/:accountId/:userId", GuideController.restoreGuide); // Restore

module.exports = router;
