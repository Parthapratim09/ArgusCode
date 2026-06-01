import Room from "../models/Room.js";
import {nanoid} from "nanoid";
import mongoose from "mongoose";


async function generateUniqueRoomId(len = 6) {
  let tries = 0;
  while (tries < 5) {
    const id = nanoid(len);
    const exists = await Room.findOne({ roomId: id }).lean().exec();
    if (!exists) return id;
    tries++;
  }
  
  return nanoid(len + 2);
}

export const createRoom= async(req,res)=>{
    try{
        const { name, defaultLanguage, isPrivate } = req.body;

        const roomId = await generateUniqueRoomId(6);

        const slug = name.toLowerCase().replace(/\s+/g, "-") + "-" + nanoid(5);
        const newRoom = new Room({ name,
             defaultLanguage, 
             isPrivate, 
             users:[],
             roomId, 
             owner: req.user.id,
             slug });
        await newRoom.save();
        await newRoom.populate("owner", "name email");
        res.status(201).json({ message: "Room created successfully", room: newRoom });
    }catch(error){
        res.status(500).json({ message: "Error creating room", error });
    }
}

export const getRoom= async(req,res)=>{
    try{
        const { roomId } = req.params;
        const room = await Room.findOne({ roomId }).populate('owner', 'name email').populate('users.user', 'name email');
        const myRole =room.owner.toString() === req.user.id? "owner": room.users.find(u => u.user._id.toString() === req.user.id)?.role || null;

        if(!room){
            return res.status(404).json({ message: "Room not found" });
        }
        res.status(200).json({ room,myRole});
    }catch(error){
        res.status(500).json({ message: "Error fetching room", error });
    }
}
export const joinRoom= async(req,res)=>{
    try{
        const { roomId } = req.params;
        const userId = req.user.id;
        const room = await Room.findOne({ roomId });
        if(!room){
            return res.status(404).json({ message: "Room not found" });
        }
        const isOwner = room.owner.toString() === req.user.id;
    const isMember = room.users.some((m) => m.user.toString() === req.user.id);
         
        if(isOwner){
          return res.status(200).json({ message: "You are The Owner", room ,myRole: "owner"});
        }
        if (!isMember) {
      room.users.push({ 
        user: req.user.id,
        role: "viewer" 
      });
      await room.save();
      await room.populate("users.user","name email");

      req.app.locals.io?.to(`room-${roomId}`).emit(
        "room-user-joined",
        {
          roomId,
          user:room.users.at(-1)
        }
      );
    }
        res.status(200).json({ message: "Joined room successfully", room });
    }catch(error){
        res.status(500).json({ message: "Error joining room", error });
    }
}

export const updateRoom = async (req, res) => {
  const updated = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only owner can delete this room" });
    }

    if (room.users.length > 0) {
      return res.status(400).json({ 
        message: "Cannot delete room while collaborators are still inside. Ask them to leave first." 
      });
    }

    await mongoose.model("File").deleteMany({
  roomId: room.roomId,
});


    await Room.findByIdAndDelete(id);
    return res.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("deleteRoom error:", error);
    return res.status(500).json({ message: "Error deleting room", error: error.message });
  }
};

export const getAllRooms = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const rooms = await Room.find({
      $or: [{ owner: userId }, { "users.user": userId }]
    }).populate('owner', 'name email').populate('users.user', 'name email');
    return res.json(rooms);
  } catch (err) {
    console.error("getAllRooms error:", err);
    return res.status(500).json({ message: "Server error fetching rooms" });
  }
};


export const leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (room.owner.toString() === req.user.id) {
      return res.status(400).json({ message: "Owner cannot leave their own room. You can delete it instead." });
    }

    
      room.users = room.users.filter(
    (member) => member.user.toString() !== req.user.id
  );
    await room.save();
    req.app.locals.io
    ?.to(`room-${roomId}`)
    .emit("room-user-left", {
    roomId,
    userId: req.user.id,
  });
    return res.status(200).json({ message: "You left the room successfully" });

  } catch (error) {
    console.error("leaveRoom error:", error);
    return res.status(500).json({ message: "Error leaving room" });
  }
};

export const updateUserRole = async (req, res) => {
  const { roomId } = req.params;
  const { userId, role } = req.body;

  if (!["editor", "viewer"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const room = await Room.findOne({ roomId });
  if (!room) return res.status(404).json({ message: "Room not found" });
  
  if (room.owner.toString() !== req.user.id) {
  return res.status(403).json({ message: "Only owner can change roles" });
}

  const member = room.users.find(
    (u) => u.user.toString() === userId
  );

  if (!member) {
    return res.status(404).json({ message: "User not in room" });
  }

  member.role = role;
  await room.save();

  res.json({ message: "Role updated successfully" });
};

export const kickUserFromRoom = async (req,res)  =>{
  const {roomId}=req.params;
  const userId=req.body.userId;

  const room= await Room.findOne({roomId});
  if(!room) return res.status(404).json({message:"Room not found"});

  if(room.owner.toString() === userId){
    return res.status(403).json({message:"Cannot Kick Owner"});
  }

  room.users= room.users.filter(
    (m) => m.user.toString() !== userId
  );
  await room.save();
  req.app.locals.io.to(userId).emit("kicked-from-room",{roomId});

  res.json({message:"User Kicked Successfully"});
}