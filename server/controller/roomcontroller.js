import Room from "../models/Room.js";
import {nanoid} from "nanoid";


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
             roomId, 
             owner: req.user.id,
             slug });
        await newRoom.save();
        res.status(201).json({ message: "Room created successfully", room: newRoom });
    }catch(error){
        res.status(500).json({ message: "Error creating room", error });
    }
}

export const getRoom= async(req,res)=>{
    try{
        const { roomId } = req.params;
        const room = await Room.findOne({ roomId }).populate('owner', 'name email').populate('users', 'name email');
        if(!room){
            return res.status(404).json({ message: "Room not found" });
        }
        res.status(200).json({ room });
    }catch(error){
        res.status(500).json({ message: "Error fetching room", error });
    }
}
export const joinRoom= async(req,res)=>{
    try{
        const { roomId } = req.params;
        const room = await Room.findOne({ roomId });
        if(!room){
            return res.status(404).json({ message: "Room not found" });
        }
        if(!room.users.includes(req.user.id)){
            room.users.push(req.user.id);
            await room.save();
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

    // OPTIONAL: check for edited files / collaborators before delete
    // If you implement File model later, check here for edited files or other conditions.

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
    // return rooms where user is owner OR a member
    const rooms = await Room.find({
      $or: [{ owner: userId }, { users: userId }]
    }).populate('owner', 'name email').populate('users', 'name email');

    return res.json(rooms);
  } catch (err) {
    console.error("getAllRooms error:", err);
    return res.status(500).json({ message: "Server error fetching rooms" });
  }
};