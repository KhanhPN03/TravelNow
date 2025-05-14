const express = require("express");
const router = express.Router();
const SuperAdminController = require("../controllers/SuperAdminController");
const generateCustomId = require("../middleware/handleCustomId");

router.delete("/softDelete/:accountId/:userId", SuperAdminController.softDeleteAdmin)
router.delete("/:id", SuperAdminController.deleteAdmin);
router.put("/:accountId", SuperAdminController.updateAdmin);
router.post("/", generateCustomId, SuperAdminController.createAdminAccount);
router.get("/", SuperAdminController.getAdmins);

module.exports = router;
