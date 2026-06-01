import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  roomId:{ type: String, required: true,index: true },
  name: { type: String, required: true },         
  language: { type: String },                    
  content: { type: String, default: "" },
  type: {
    type: String,
    enum: ["file", "folder"],
    default: "file",
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "File",
    default: null,
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  lastEditedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
},
isDeleted: {
  type: Boolean,
  default: false,
},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false } 
});

fileSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("File", fileSchema);
