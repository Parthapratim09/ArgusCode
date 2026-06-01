import express from "express";
import { login,register,getme } from "../controller/authcontroller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { verifyEmail, sendVerificationCode, resetPassword } from "../controller/authcontroller.js";

const router = express.Router();

router.post("/login",login);
router.post("/register",register);
router.get("/me",authMiddleware,getme);
router.post('/verify', verifyEmail);
router.post('/send-verification-code', sendVerificationCode);
router.post('/reset-password', resetPassword);  

export default router;
