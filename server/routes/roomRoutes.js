import express from "express";
import { createRoom, getRoom,joinRoom,updateRoom,deleteRoom,getAllRooms,leaveRoom} from "../controller/roomcontroller.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/",authMiddleware, createRoom);
router.get("/", authMiddleware, getAllRooms);
router.get("/:roomId", authMiddleware, getRoom);
router.post("/:roomId/join", authMiddleware, joinRoom);
router.put("/:id", authMiddleware, updateRoom);
router.delete("/:id", authMiddleware, deleteRoom);
router.post("/:roomId/leave", authMiddleware,leaveRoom);

export default router;