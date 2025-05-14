const express = require("express");
const router = express.Router();
const passport = require("passport");
const authenticate = require("../config/authenticate");

const accountsController = require("../controllers/CustomersController");
const generateCustomId = require("../middleware/handleCustomId");

router.post("/register", accountsController.register);
router.post("/login", passport.authenticate("local"), accountsController.login);
router.post("/login-google", accountsController.loginWithGoogle);
router.get("/logout", accountsController.logout);
// GET /user/details/:id - Lấy thông tin chi tiết của một người dùng theo ID
// PUT /user/details/:id - Cập nhật thông tin của một người dùng theo ID

// GET /user/delete/:id - Xóa một người dùng theo ID
router.delete(
  "/softDelete/:accountId/:userId",
  accountsController.softDeleteAccountById
);
router.delete("/:id", accountsController.delete);
// GET /user - Lấy danh sách tất cả người dùng
// POST /user - Tạo một người dùng mới

router.put("/restore/:userId", accountsController.restoreUserById);
router.put("/:customerId", accountsController.updateAccount);
router.put("/change-password/by-admin/:userId", accountsController.changePasswordByAdmin);
router.put("/change-password/:userId", accountsController.changePassword);
router.post("/", generateCustomId, accountsController.createCustomerAccount);
router.post("/verify-otp", accountsController.verifyOTP);
router.post("/reset-password", accountsController.resetPassword);
router.post("/forgot-password", accountsController.forgotPassword);
router.get(
  "/deleted/get-all-accounts",
  accountsController.getAllRemovedAccounts
);
router.get("/:id", accountsController.getOne);
router.get("/:customerId", accountsController.getCustomerById);
router.get("/", accountsController.getAllCustomer);
router.get("/", accountsController.getAll);
module.exports = router;
