// server.js
import http from "http";
import "dotenv/config";
import app from "./app.js";
import connect from "./db/db.js";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import mongoose from "mongoose";
import projectmodel from "./models/project.model.js";
import { generateResult } from "./services/ai.service.js";

connect();

const port = process.env.PORT || 5000;

const server = http.createServer(app);

// socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

//////////////////////////// middleware for socket connnection
io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers.authorization?.split(" ")[1];

    const projectId = socket.handshake.query.projectId;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error("Invalid ProjectId"));
    }

    socket.project = await projectmodel.findById(projectId);

    if (!token) {
      return next(new Error("Authentication error"));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return next(new Error("Authentication error"));
    }
    socket.user = decoded;
    next();
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// socket connection
io.on("connection", (socket) => {
  socket.roomId = socket.project._id.toString();

  console.log("a user connected");

  socket.join(socket.roomId);

  socket.on("project-message", async (data) => {
    const message = data.message;
    const aiPresnetInMessage = message.includes("@ai");

    socket.broadcast.to(socket.roomId).emit("project-message", data);

    if (aiPresnetInMessage) {
      const prompt = message.replace("@ai", "");
      const result = await generateResult(prompt);

      io.to(socket.roomId).emit("project-message", {
        message: result,
        sender: {
          _id: "ai",
          name: "AI",
        },
      });
      return;
    }
  });

  socket.on("disconnect", () => {
    /* … */
    console.log("user-disconnected");
    socket.leave(socket.roomId);
  });
});
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
