import Room from "../models/Room.js";

export const roomOwnerOnly = async (req, res, next) => {
  const { roomId } = req.params;

  const room = await Room.findOne({roomId});
  if (!room) return res.status(404).json({ message: "Room not found" });

  if (room.owner.toString() !== req.user.id)
    return res.status(403).json({ message: "Only owner allowed" });

  next();
};
