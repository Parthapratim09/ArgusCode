import Room from "../models/Room.js";
import File from "../models/Files.js";

export const requireRoomRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      console.log("params",req.params,"body", req.body, "query", req.query);
      console.log("allowedRoles",allowedRoles);
      console.log(req.params.id);
      let roomId = req.params?.roomId || req.body?.roomId || req.query?.roomId;
      console.log(roomId);
    

      if (!roomId && req.params.id) {
        console.log(req.params.id);
        const file = await File.findById(req.params.id).lean();
        if (!file) {
          return res.status(404).json({ message: "File not found" });
        }
        roomId = file.roomId;
      }

      if (!roomId) {
        return res.status(400).json({ message: "Room ID missing" });
      }
      const userId = req.user.id;

      const room = await Room.findOne({ roomId });
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      const isOwner = room.owner.toString() === userId;

     if (room.owner.toString() === userId) {
      return next();
    }

      const member = room.users.find(
        (u) => u.user?.toString() === userId
      );

      if(!member || !allowedRoles.includes(member.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error);
      return res.status(500).json({ message: "Authorization error" });
    }
  };
};
