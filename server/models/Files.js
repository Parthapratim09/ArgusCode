import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  roomId:{ type: String, required: true,index: true },
  name: { type: String, required: true },         
  language: { type: String },                    
  content: { type: String, default: "" },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false } 
});

fileSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("File", fileSchema);
