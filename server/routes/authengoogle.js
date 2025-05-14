const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/Account");
require("../config/authenticate/passport-google");

router.get(
  "/",
  passport.authenticate("google", { scope: ["email", "profile"] })
);
router.get(
  "/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/login",
    successRedirect: "http://localhost:3000",
  })
);
router.get("/profile", (req, res, next) => {
  if (req.isAuthenticated()) {
    res.json({
      username: req.user.username,
      image: req.user.image,
      googleID: req.user.googleID,
      admin: req.user.admin,
    });
  } else {
    res.redirect("http://localhost:3000/login");
  }
});
router.get("/:googleID", (req, res, next) => {
  User.findOne({ googleID: req.params.googleID })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ success: false, message: "not found" });
      } else {
        res.status(200).json({ success: true, user: user });
      }
    })
    .catch(next);
});
module.exports = router;
