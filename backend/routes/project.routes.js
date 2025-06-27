import { Router } from "express";
import "../models/user.model.js";
import { body } from "express-validator";
import {
  addUserToProject,
  createProject,
  fetchProductById,
} from "../controllers/project.controllers.js";
import * as authMiddleware from "../middleware/auth.middleware.js";
import { getAllProject } from "../controllers/project.controllers.js";

const router = Router();

router.post(
  "/create",
  authMiddleware.authUser,
  body("name").isString().withMessage("Name is required"),
  createProject,
);
router.get("/all", authMiddleware.authUser, getAllProject);
router.put(
  "/add-user",
  authMiddleware.authUser,
  body("projectId").isString().withMessage("Project ID is required"),
  body("users")
    .isArray({ min: 1 })
    .withMessage("Users must be an array of strings")
    .bail()
    .custom((users) => users.every((user) => typeof user === "string"))
    .withMessage("Each user must be a string"),
  addUserToProject,
);

router.get("/fetch/:projectId", authMiddleware.authUser, fetchProductById);

export default router;
