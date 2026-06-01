import express from "express";
import { createRoom, getRoom,joinRoom,updateRoom,deleteRoom,getAllRooms,leaveRoom,updateUserRole,kickUserFromRoom} from "../controller/roomcontroller.js";
import { authMiddleware} from "../middleware/authMiddleware.js";
import { requireRoomRole } from "../middleware/roomRoleMiddleware.js";
import { roomOwnerOnly as roomOwnerMiddleware } from "../middleware/roomOwnerOnly.js";


const router = express.Router();

router.post("/",authMiddleware, createRoom);
router.get("/", authMiddleware, getAllRooms);
router.get("/:roomId", authMiddleware, getRoom);
router.post("/:roomId/join", authMiddleware, joinRoom);
router.put("/:id", authMiddleware, updateRoom);
router.delete("/:id", authMiddleware, deleteRoom);
router.post("/:roomId/leave", authMiddleware,leaveRoom);
router.put("/:roomId/role",authMiddleware,requireRoomRole(["owner"]),updateUserRole);
router.post(
  "/:roomId/kick",
  authMiddleware,
  roomOwnerMiddleware,
  kickUserFromRoom
);


export default router;