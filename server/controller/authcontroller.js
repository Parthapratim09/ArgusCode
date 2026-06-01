import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import sendEmail  from "../middleware/emailconfig.js";


export const sendVerificationCode = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ msg: "Please provide an email" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }
let verificationCode = Math.floor(1000 + Math.random() * 9000);

    await sendEmail(email, verificationCode);


    user.verificationCode = verificationCode;
    await user.save();


    return res.status(200).json({ msg: "Verification code sent" });
  } catch (error) {
    return res.status(500).json({ msg: "Server error" });
  }
}

export const verifyEmail = async (req, res) => {
 try {
  const { verificationCode } = req.body;
  
  const user = await User.findOne({ verificationCode });
  if (!user) {
    return res.status(400).json({ msg: "Invalid verification code" });
  }
  user.isVerified = true;
  user.verificationCode = null; 
  await user.save();

  return res.status(200).json({ msg: "Email verified successfully" });
 } catch (error) {
  return res.status(500).json({ msg: "Server error" });
 }
}


export const register = async (req, res) => {
    const { name, email, password } = req.body;
    try{
        if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    
        const existingUser= await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message:"User already exists"});
        }
        let verificationCode = Math.floor(1000 + Math.random() * 9000);
        
        await sendEmail(email, verificationCode);

        const salt=await bcrypt.genSalt(10);
        const hashedPassword= await bcrypt.hash(password,salt);
        const newUser= new User({name,email,password:hashedPassword,verificationCode});
        await newUser.save();
        return res.status(201).json({message:"User registered successfully"});
    }catch(error){
        return res.status(500).json({message:"Something went wrong"});
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
        const user = await User.findOne({ email });

    if (user.isBanned) {
    return res.status(403).json({
    message:
      "Your account is temporarily banned. Contact admin.",
    });
    }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials (Wrong password)" });
        }

         if (!user.isVerified) {
      return res.status(400).json({ msg: "Email not verified. Please verify your email." });
    }
        const payload = {
            email: user.email,
            id: user._id,
            name: user.name,
            role:user.role,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
        return res.status(200).json({ user: payload, token });
    } catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
};

export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ msg: "Please provide email and new password" });
  }
  try{
    const user= await User.findOne({email});
    if(!user){
      return res.status(400).json({ msg: "User not found" });
    }
    const salt= await bcrypt.genSalt(10);
    const hashedPassword=await bcrypt.hash(newPassword,salt);
    user.password= hashedPassword;
    await user.save();
    return res.status(200).json({ msg: "Password reset successful" });
  }catch(err){
    console.error("Error during password reset:", err.message);
    return res.status(500).json({ msg: "Server error" });
  }
}

export const getme = async (req, res) => {
    const userId = req.user.id;  
    try {
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
};