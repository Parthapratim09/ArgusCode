import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, 
            required: [true, "Email is required"],  
            unique: true , 
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"]
          },
  password: { type: String, required: [true, "Password is required"]  },
   role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  isBanned: {
    type: Boolean,
    default: false,
  },
  banReason: {
  type: String,
  default: "",
},
isVerified:{
  type:Boolean,
  required:true,
  default:false
},
  verificationCode:{
    type:String,
    default:null
  },
  createdAt: { type: Date, default: Date.now },

});

export default mongoose.model("User", userSchema);
