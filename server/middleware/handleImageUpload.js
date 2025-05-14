const fs = require("fs");
const path = require("path");

const imageUploadMiddleware = async (req, res, next) => {
  const currentYear = String(new Date().getFullYear());
  const today = String(new Date().toISOString().split("T")[0]);
  try {
    const rootDir = path.resolve(__dirname, "..");
    req.uploadPath = path.join(rootDir, "uploads", currentYear, today);

    if (!fs.existsSync(req.uploadPath)) {
      fs.mkdirSync(req.uploadPath, { recursive: true });
    } else {
      // console.log("Directory already exists:", req.uploadPath);
    }
  } catch (error) {
    // console.error("Error creating upload directory:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error creating upload directory" });
  }
  next();
};

module.exports = imageUploadMiddleware;
