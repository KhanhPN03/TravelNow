const express = require("express");
const router = express.Router();


const favoriteToursController = require("../controllers/FavoriteToursController");

router.get("/:userId", favoriteToursController.getFavTours);
router.get("/:userId/:tourId", favoriteToursController.getFavoriteTour);
router.delete("/:userId/:tourId", favoriteToursController.deleteFavoriteTour);
router.put("/:userId/:tourId", favoriteToursController.addToFavoriteList);
router.post("/:userId", favoriteToursController.createFavoriteList);

module.exports = router;
