import express from "express";
import { login,register,getme } from "../controller/authcontroller.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/login",login);
router.post("/register",register);
router.get("/me",authMiddleware,getme);

export default router;
