import e from "express";
import mongoose from "mongoose";

const roomUserSchema = new mongoose.Schema({
  user: {type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true},
  role: {
    type: String,
    enum: ["editor", "viewer"],
    default: "viewer"
  },
}, { _id: false}
);

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  users: [roomUserSchema],
  roomId: { type: String, required: true, unique: true },
  defaultLanguage: { type: String, default: "javascript" },
  isPrivate: { type: Boolean, default: false },
  slug: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Room", roomSchema);


