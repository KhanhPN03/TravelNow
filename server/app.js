require("dotenv").config(); // phải nạp đầu file
var express = require("express");
var cookieParser = require("cookie-parser");
var app = express();
const passport = require("passport");
const session = require("express-session");
const db = require("./config/db");
const routes = require("./routes");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
// Import the cron job
const hideToursCron = require('./cron/autoHideExpiredTours');


var methodOverride = require("method-override");
const { log } = require("console");

const imageUploadMiddleware = require("./middleware/handleImageUpload");

app.use(cors());
// app.use(
//   cors({
//     origin: "http://localhost:4000",
//     credentials: true,
//   })
// );
app.use(bodyParser.json({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SECRET_KEY,
    saveUninitialized: false,
    resave: false,
    cookie: { secure: false },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

// Connect to database
db.connect().then(() => {
  // Start the cron job after database connection
  hideToursCron.start();

});

routes(app);
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Cấu hình Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, req.uploadPath); // Sử dụng đường dẫn đã tạo từ middleware
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + Math.random() + path.extname(file.originalname)); // Đổi tên file
  },
});

const upload = multer({ storage });

app.post(
  "/upload",
  imageUploadMiddleware,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 4 },
  ]),
  (req, res) => {
    const currentYear = String(new Date().getFullYear());
    const today = String(new Date().toISOString().split("T")[0]);

    if (!req.files || (!req.files.thumbnail && !req.files.images)) {
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded" });
    }

    // Trả về đường dẫn của ảnh đã lưu
    const thumbnailPath = req.files.thumbnail
      ? `/uploads/${currentYear}/${today}/${req.files.thumbnail[0].filename}`
      : null;
    const imagePaths = req.files.images
      ? req.files.images.map(
          (file) => `/uploads/${currentYear}/${today}/${file.filename}`
        )
      : [];

    res.json({ success: true, thumbnailPath, imagePaths });
  }
);

app.use("/uploads", express.static("uploads"));
module.exports = app;