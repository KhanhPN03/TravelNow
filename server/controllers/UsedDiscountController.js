const UsedDiscount = require("../models/UsedDiscount");

class UsedDiscountController {
  // [POST] /usedDiscount/create
  async createUsedDiscount(req, res, next) {
    try {
      const usedDiscount = await UsedDiscount.create(req.body);
      res.status(201).json({ success: true, usedDiscount });
    } catch (error) {
      next(error);
    }
  }

  // [GET] /usedDiscount
  async getUsedDiscounts(req, res, next) {
    try {
      const usedDiscounts = await UsedDiscount.find();
      res.status(200).json({ success: true, usedDiscounts });
    } catch (error) {
      next(error);
    }
  }

  // [GET] /usedDiscount/user/:userId
  async getUsedDiscountsByUser(req, res, next) {
    try {
      const usedDiscounts = await UsedDiscount.find({ userId: req.params.userId });
      success
      res.status(200).json({ success: true, usedDiscounts });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UsedDiscountController();
