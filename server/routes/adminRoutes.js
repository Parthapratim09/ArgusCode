import express from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminmiddleware.js";
import User from "../models/User.js";
import Room from "../models/Room.js";
import File from "../models/Files.js";

const router = express.Router();


router.use(authMiddleware);
router.use(isAdmin);


router.get("/stats", async (req, res) => {

  try {

    const users = await User.countDocuments();
    const rooms = await Room.countDocuments();
    const files = await File.countDocuments();

    res.json({
      users,
      rooms,
      files,
    });

  } catch (err) {

    res.status(500).json({
      message: "Failed to fetch stats",
    });

  }

});

router.get("/users", async (req, res) => {

  try {

    const users = await User.find().select("-password");

    res.json(users);

  } catch (err) {

    res.status(500).json({
      message: "Failed to fetch users",
    });

  }

});


router.delete("/users/:id", async (req, res) => {

  try {

    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: "User deleted",
    });

  } catch (err) {

    res.status(500).json({
      message: "Failed to delete user",
    });

  }

});




router.get("/rooms", async (req, res) => {

  try {

    const rooms = await Room.find()
      .populate("owner", "name email");

    res.json(rooms);

  } catch (err) {

    res.status(500).json({
      message: "Failed to fetch rooms",
    });

  }

});



router.delete("/rooms/:id", async (req, res) => {

  try {


    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    await mongoose.model("File").deleteMany({
  roomId: room.roomId,
});


    await Room.findByIdAndDelete(req.params.id);

    res.json({
      message: "Room and all files deleted",
    });

  } catch (err) {

    res.status(500).json({
      message: "Failed to delete room",
    });

  }

});

router.put("/ban/:userId", async (req, res) => {

  try {

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        isBanned: true,
        banReason: req.body?.reason || "",
      },
      { new: true }
    );

    res.json({
      message: "User banned",
      user,
    });

  } catch (err) {

    console.log(err); 

    res.status(500).json({
      message: "Ban failed",
    });

  }

});


router.put("/unban/:userId", async (req, res) => {

  try {

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        isBanned: false,
        banReason: "",
      },
      { new: true }
    );

    res.json({
      message: "User unbanned",
      user,
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Unban failed",
    });

  }

});


router.get("/files", async (req, res) => {

  try {

    const files = await File.find().populate("owner", "name email");

    res.json(files);

  } catch (err) {

    res.status(500).json({
      message: "Failed to fetch files",
    });

  }

});

router.delete("/files/:id", async (req, res) => {
  try {
    await File.findByIdAndDelete(req.params.id);
    res.json({ message: "File metadata deleted permanently" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete file entry",
    });
  }
});


router.get("/room/:roomId", async (req, res) => {

  try {

    const room = await Room.findOne({
      roomId: req.params.roomId,
    })
    .populate("owner", "name email")
    .populate("users.user", "name email");

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    const files = await File.find({
      roomId: req.params.roomId,
    });

    res.json({
      room,
      files,
    });

  } catch (err) {

    res.status(500).json({
      message: "Failed to fetch room",
    });

  }

});

router.put("/room/:roomId/role", async (req, res) => {

  try {

    const { userId, role } = req.body;

    if (!["editor", "viewer"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    const room = await Room.findOne({
      roomId: req.params.roomId,
    });

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

  
    if (room.owner.toString() === userId) {
      return res.status(403).json({
        message: "Cannot change owner role",
      });
    }

    const member = room.users.find(
      (u) => u.user.toString() === userId
    );

    if (!member) {
      return res.status(404).json({
        message: "User not in room",
      });
    }

    member.role = role;

    await room.save();

    res.json({
      message: "Role updated",
    });

  } catch (err) {

    res.status(500).json({
      message: "Update failed",
    });

  }

});


export default router;


