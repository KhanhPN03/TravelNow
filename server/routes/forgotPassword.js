// const express = require('express');
// const router = express.Router();
// const nodemailer = require('nodemailer');
// const crypto = require('crypto');
// const User = require('../models/Account'); // Đảm bảo đường dẫn đến model User đúng

// // Cấu hình nodemailer với Gmail
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASSWORD
//     }
// });

// // Store OTP codes (trong production nên dùng Redis hoặc database)
// const otpStore = new Map();

// // Tạo OTP
// function generateOTP() {
//     return crypto.randomInt(100000, 999999).toString();
// }

// // Route xử lý forgot password
// router.post('/forgot-password', async (req, res) => {
//     try {
//         const { email } = req.body;

//         // Thêm console.log để debug
//         console.log('Searching for email:', email);

//         const user = await User.findOne({ email: email.toLowerCase() });
//         console.log('Found user:', user); // Kiểm tra user có được tìm thấy không

//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Email not found'
//             });
//         }

//         // Tạo OTP mới
//         const otp = generateOTP();

//         // Lưu OTP với timestamp
//         otpStore.set(email, {
//             otp,
//             timestamp: Date.now(),
//             userId: user._id // Lưu thêm userId để dùng khi reset password
//         });

//         // Gửi email
//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to: email,
//             subject: 'Password Reset Verification Code',
//             html: `
//         <h1>Password Reset Request</h1>
//         <p>Your verification code is: <strong>${otp}</strong></p>
//         <p>This code will expire in 10 minutes.</p>
//         <p>If you didn't request this, please ignore this email.</p>
//       `
//         };

//         await transporter.sendMail(mailOptions);

//         res.json({
//             success: true,
//             message: 'OTP sent successfully'
//         });

//     } catch (error) {
//         console.error('Error in forgot password:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to process request'
//         });
//     }
// });

// // Verify OTP
// router.post('/verify-otp', async (req, res) => {
//     try {
//         const { email, otp } = req.body; 
//         const storedData = otpStore.get(email);
//         console.log("store data: ",storedData);
//         if (!storedData) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'OTP expired or invalid'
//             });
//         }

//         // Kiểm tra OTP hết hạn (10 phút)
//         if (Date.now() - storedData.timestamp > 10 * 60 * 1000) {
//             otpStore.delete(email);
//             return res.status(400).json({
//                 success: false,
//                 message: 'OTP expired'
//             });
//         }

//         if (storedData.otp !== otp) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Invalid OTP'
//             });
//         }

//         res.json({ success: true });

//     } catch (error) {
//         console.error('Error in verify OTP:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to verify OTP'
//         });
//     }
// });

// // Reset password
// router.post('/reset-password', async (req, res) => {
//     try {
//         const { email, otp, newPassword } = req.body;

//         const storedData = otpStore.get(email);
//         if (!storedData || storedData.otp !== otp) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Invalid or expired OTP'
//             });
//         }

//         // Find user
//         const user = await User.findById(storedData.userId);
//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'User not found'
//             });
//         }

//         // Use Passport's setPassword method instead of manual hash/salt
//         await new Promise((resolve, reject) => {
//             user.setPassword(newPassword, (err) => {
//                 if (err) reject(err);
//                 else resolve();
//             });
//         });

//         await user.save();

//         // Delete used OTP
//         otpStore.delete(email);

//         res.json({
//             success: true,
//             message: 'Password updated successfully'
//         });

//     } catch (error) {
//         console.error('Error in reset password:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to reset password'
//         });
//     }
// });

// module.exports = router;