import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
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
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
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
app.use("/api/admin", adminRoutes);


const httpServer = http.createServer(app);


const io = new IOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN, 
    methods: ["GET", "POST"],
  },
});


io.on("connection", (socket) => {
  
  console.log("Socket connected");

  const userId = socket.handshake.auth?.userId;
  const username = socket.handshake.auth?.username;

  if (userId) {
    socket.join(userId); 
    console.log("Socket joined user room:", userId);
  }

  socket.on("join-room", (roomId) => {
    if (!roomId) return;
    socket.join(`room-${roomId}`);
    
    console.log("Socket joined room");
  });

  socket.on("leave-room", (roomId) => {
    socket.leave(`room-${roomId}`);
  });

 
socket.on("join-file",({ fileId }) => {
  if (!fileId) return;
  socket.join(`file-${fileId}`);
  console.log(`Socket joined file-${fileId}`);
});

socket.on("code-change", ({ fileId, content }) => {
  socket.to(`file-${fileId}`).emit("receive-code-change", { content });
});

socket.on("cursor-change", (data) => {
  socket.to(`file-${data.fileId}`).emit("receive-cursor-change", data);
});

 socket.on("kick-user", ({ roomId, userId }) => {
  io.to(userId).emit("force-leave-room", { roomId });
});



socket.on("user-online", ({ roomId, userName }) => {
  console.log("ONLINE EVENT RECEIVED:", roomId, userName);

  socket.to(`room-${roomId}`).emit("online-user", {
    userName,
  });

});

socket.on("user-left", ({ roomId, userName }) => {

  socket.to(`room-${roomId}`).emit("remove-online-user", {
    userName,
  });

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