const mongoose = require("mongoose");
const FavoriteTour = require("../models/FavoriteTour");
const OriginalTour = require("../models/OriginalTour");

class FavoriteToursController {
  // [GET] /:userId
  async getFavTours(req, res, next) {
    try {
      const userId = req.params.userId;

      // Find favorite tours for this user
      let favTours = await FavoriteTour.findOne({ userId })
        .populate("userId");
      
      if (!favTours) {
        favTours = new FavoriteTour({ userId: userId, favoriteTourIds: [] });
        await favTours.save();
        return res.status(200).json(favTours);
      }
      
      // If there are no favorite tours, return early
      if (!favTours.favoriteTourIds || favTours.favoriteTourIds.length === 0) {
        return res.status(200).json(favTours);
      }
      
      // Get all original tour data
      const populatedTours = [];
      const toursToRemove = [];
      
      for (const tourId of favTours.favoriteTourIds) {
        try {
          // Handle potential invalid tourId
          if (!tourId || !mongoose.Types.ObjectId.isValid(tourId)) {
            toursToRemove.push(tourId);
            continue;
          }
          
          const originalTour = await OriginalTour.findOne({
            _id: tourId,
            deleted: false  // Thêm điều kiện kiểm tra deleted
          });
          
          if (!originalTour) {
            toursToRemove.push(tourId);
            continue;
          }
          
          // Find subsidiary tours for this original tour (filtered for display)
          const SubsidiaryTour = mongoose.model("SubsidiaryTour");
          const subsidiaryTours = await SubsidiaryTour.find({
            originalTourId: tourId,
            isCanceled: { $ne: true },
            isDeleted: { $ne: true },
            hide: { $ne: true },
            status: true
          }).sort({ price: 1 });
          
          // Find ALL subsidiary tours for review calculation (no filtering)
          const allSubsidiaryTours = await SubsidiaryTour.find({
            originalTourId: tourId
          });
          
          const tourObject = originalTour.toObject();
          
          // Check if we have valid subsidiary tours with price for display
          if (subsidiaryTours.length === 0 || !subsidiaryTours[0].price) {
            toursToRemove.push(tourId);
            continue;
          }
          
          // Set price from first subsidiary tour
          tourObject.price = subsidiaryTours[0].price;
          
          // Add simplified subsidiary tour info (filtered for display)
          tourObject.subsidiaryTours = subsidiaryTours.map(sub => ({
            _id: sub._id,
            price: sub.price,
            dateStart: sub.dateStart,
            availableSlots: sub.availableSlots
          }));
          
          // Add all subTourIds for review calculation
          tourObject.allSubTourIds = allSubsidiaryTours.map(sub => sub._id);
          
          populatedTours.push(tourObject);
        } catch (tourError) {
          console.error(`Error processing tour ${tourId}:`, tourError);
          toursToRemove.push(tourId);
          continue;
        }
      }
      
      // If we found tours to remove, update the user's favorites list
      if (toursToRemove.length > 0) {
        favTours.favoriteTourIds = favTours.favoriteTourIds.filter(
          id => !toursToRemove.includes(id.toString())
        );
        await favTours.save();
      }
      
      // Return result with populated tours
      const result = {
        ...favTours.toObject(),
        favoriteTourIds: populatedTours
      };
      
      return res.status(200).json(result);
    } catch (error) {
      console.error("getFavTours error:", error);
      return res.status(500).json({ 
        message: "Error fetching favorite tours", 
        error: error.message 
      });
    }
  }

  // [GET] /:userId/:tourId
  async getFavoriteTour(req, res, next) {
    const userId = req.params.userId;
    const tourId = req.params.tourId;

    try {
      let favTour = await FavoriteTour.findOne({ userId: userId });

      if (!favTour) {
        favTour = new FavoriteTour({ userId, favoriteTourIds: [] });
        await favTour.save();
      }

      const tourExists = favTour.favoriteTourIds.includes(tourId);
      res.json({ existed: tourExists });
    } catch (error) {
      next(error);
    }
  }

  // [PUT] /:userId/:tourId
  async addToFavoriteList(req, res, next) {
    const userId = req.params.userId;
    const tourId = req.params.tourId;

    try {
      let favoriteTours = await FavoriteTour.findOne({ userId });

      if (favoriteTours) {
        const tourExists = favoriteTours.favoriteTourIds.includes(tourId);

        if (!tourExists) {
          favoriteTours.favoriteTourIds.push(tourId);
          await favoriteTours.save();
          res.status(200).json(favoriteTours);
        } else {
          res.status(400).json({ message: "Tour already in favorites" });
        }
      } else {
        const newFavoriteTour = await FavoriteTour.create({
          userId,
          favoriteTourIds: [tourId],
        });
        res.status(200).json(newFavoriteTour);
      }
    } catch (error) {
      next(error);
    }
  }

  // [DELETE] /:userId/:tourId
  async deleteFavoriteTour(req, res, next) {
    const { userId, tourId } = req.params;

    try {
      const favoriteTour = await FavoriteTour.findOne({ userId });

      if (!favoriteTour) {
        return res.status(404).json({ message: "Favorite list not found" });
      }

      favoriteTour.favoriteTourIds = favoriteTour.favoriteTourIds.filter(
        id => id.toString() !== tourId
      );

      await favoriteTour.save();
      res.json(favoriteTour);
    } catch (error) {
      next(error);
    }
  }

  // [POST] /:userId
  async createFavoriteList(req, res, next) {
    const userId = req.params.userId;

    try {
      let favoriteTours = await FavoriteTour.findOne({ userId })
        .populate("userId")
        .populate("favoriteTourIds");

      if (favoriteTours) {
        res.json({ existed: true });
      } else {
        favoriteTours = await FavoriteTour.create({
          userId,
          favoriteTourIds: [],
        });
        res.status(200).json(favoriteTours);
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FavoriteToursController();