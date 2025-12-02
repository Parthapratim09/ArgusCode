import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, 
            required: [true, "Email is required"],  
            unique: true , 
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"]
          },
  password: { type: String, equired: [true, "Password is required"]  },
  createdAt: { type: Date, default: Date.now },

});

export default mongoose.model("User", userSchema);
