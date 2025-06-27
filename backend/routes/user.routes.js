// user.routes.js
import { Router } from "express";
import { body } from "express-validator";
import {
  createUserController,
  getAllUsers,
  loginController,
  logoutController,
  profileController,
} from "../controllers/user.controlles.js";
import * as authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/register",
  body("email").isEmail().withMessage("Email must be a valid email address."),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),
  createUserController,
);

router.post(
  "/login",
  body("email").isEmail().withMessage("Invalid email or password"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 character long"),
  loginController,
);
router.get("/profile", authMiddleware.authUser, profileController);
router.get("/logout", authMiddleware.authUser, logoutController);

router.get("/users", authMiddleware.authUser, getAllUsers);
// Assuming this route is protected with authUser middleware
export default router;
