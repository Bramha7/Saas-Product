// server.js
import http from "http";
import "dotenv/config";
import app from "./app.js";
import connect from "./db/db.js";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import mongoose from "mongoose";
import projectmodel from "./models/project.model.js";

connect();

const port = process.env.PORT || 5000;

const server = http.createServer(app);

// socket.io
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
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
  } catch (err) {}
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.join(socket.project._id);

  socket.on("project-message", (data) => {
    socket.broadcast.to(socket.project._id).emit("project-message");
  });

  socket.on("event", (data) => {
    /* … */
  });
  socket.on("disconnect", () => {
    /* … */
  });
});
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
