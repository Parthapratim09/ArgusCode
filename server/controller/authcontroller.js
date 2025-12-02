import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

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
        const salt=await bcrypt.genSalt(10);
        const hashedPassword= await bcrypt.hash(password,salt);
        const newUser= new User({name,email,password:hashedPassword});
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
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials (Wrong password)" });
        }
        const payload = {
            email: user.email,
            id: user._id,
            name: user.name
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
        return res.status(200).json({ user: payload, token });
    } catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
};

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