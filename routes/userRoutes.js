import express from "express";
const router = express.Router();
import { authUser, getUserProfile, registerUser, updateUserProfile, verifyOTP, getUser } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

// /api/auth/login - POST - Login
// /api/auth/otp - POST - Validate OTP
// /api/auth/register - POST - Register
// /api/auth/profile - POST - Update profile
// /api/auth/user - GET - Get user status

router.post("/login", authUser);
router.route("/register").post(registerUser);
router.route("/otp").post(verifyOTP);
router.route("/profile").put(protect, updateUserProfile);
router.get("/user", protect, getUser);

export default router;
