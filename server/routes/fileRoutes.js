import express from "express";
import { createFile, getFilesByRoom, updateFile,getFileById, deleteFile } from "../controller/filecontroller.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createFile);       
router.get("/room/:roomId", authMiddleware, getFilesByRoom);
router.get("/:id", authMiddleware, getFileById);
router.put("/:id", authMiddleware, updateFile);
router.delete("/:id", authMiddleware, deleteFile);

export default router;
