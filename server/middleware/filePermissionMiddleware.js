import Room from "../models/Room.js";
import File from "../models/Files.js";
import mongoose from "mongoose";
import User from "../models/User.js";


export const canEditFile = async (req, res, next) => {

  try {

    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        message: "File not found",
      });
    }

    const room = await Room.findOne({
      roomId: file.roomId,
    });

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    
    if (room.owner.toString() === req.user.id) {
      return next();
    }

    
    const member = room.users.find(
      (u) => u.user.toString() === req.user.id
    );

    if (!member) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    
    if (member.role !== "editor") {
      return res.status(403).json({
        message: "Viewer cannot edit files",
      });
    }

    next();

  } catch (err) {

    res.status(500).json({
      message: "Permission check failed",
    });

  }

};