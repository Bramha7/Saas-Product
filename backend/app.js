// app.js
import express from "express";
import morgan from "morgan";
import router from "./routes/user.routes.js";
import cookieParser from "cookie-parser";
import projectroutes from "./routes/project.routes.js";
import cors from "cors";
import User from "./models/user.model.js";

const app = express();

app.use(morgan("dev")); // 1. Logging
app.use(cors()); // 2. Enable CORS early

app.use(express.json()); // 3. Parse JSON body
app.use(express.urlencoded({ extended: true })); // 4. Parse URL-encoded body
app.use(cookieParser()); // 5. Parse cookies

// 6. Routes
app.use("/api/v2", router);
app.use("/api/v2", projectroutes);

app.get("/", (req, res) => {
  res.send("Hello world");
});

export default app;
