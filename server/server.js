import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import http from "http";
import { Server as IOServer } from "socket.io";

dotenv.config();
const corsOptions = {
    origin: process.env.CLIENT_ORIGIN,
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};
const app = express();
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

mongoose
  .connect(process.env.MONGO_ATLAS_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

app.get("/", (req, res) => {
  res.send("Server is running");
});
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/files", fileRoutes);


const httpServer = http.createServer(app);


const io = new IOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN, 
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  // console.log("Socket connected:", socket.id);
  console.log("Socket connected");

  socket.on("join-room", (roomId) => {
    if (!roomId) return;
    socket.join(`room-${roomId}`);
    // console.log(`Socket ${socket.id} joined room-${roomId}`);
    console.log("Socket joined room");
  });

  socket.on("leave-room", (roomId) => {
    socket.leave(`room-${roomId}`);
  });

  socket.on("disconnect", () => {
    // console.log("Socket disconnected:", socket.id);
    console.log("Socket disconnected");
  });
});


app.locals.io = io;


const PORT = process.env.PORT;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});