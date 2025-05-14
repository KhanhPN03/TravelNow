const express = require("express");
const router = express.Router();
const TrashController = require("../controllers/TrashController");

router.get("/:type", TrashController.getAllRemovedItems);
router.put("/restore/:type/:id/:userId", TrashController.restoreItem);
router.delete("/hardDelete/:type/:id/:userId", TrashController.hardDeleteItem);

module.exports = router;
