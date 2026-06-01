import express from "express";
import { createFile, getFilesByRoom, updateFile,getFileById, deleteFile,createFolder } from "../controller/filecontroller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRoomRole } from "../middleware/roomRoleMiddleware.js";
import { canEditFile } from "../middleware/filePermissionMiddleware.js";



const router = express.Router();

router.post("/", authMiddleware,requireRoomRole(["owner", "editor"]), createFile);       
router.post("/folder", authMiddleware,requireRoomRole(["owner", "editor"]), createFolder);
router.get("/room/:roomId", authMiddleware,requireRoomRole(["owner", "editor", "viewer"]), getFilesByRoom);
router.get("/:id", authMiddleware, getFileById);
router.put("/:id", authMiddleware,canEditFile, updateFile);
router.delete("/:id", authMiddleware,requireRoomRole(["owner"]), deleteFile);

export default router;
