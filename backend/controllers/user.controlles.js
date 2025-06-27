// user.controller.js
import User from "../models/user.model.js";
import Usermodel from "../models/user.model.js";
import { createUser } from "../services/user.service.js";
import { validationResult } from "express-validator";
import redisClient from "../services/redis.service.js";

export const createUserController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await createUser(req.body);
    const token = user.generateJWT(); // Call on instance
    delete user._doc.password;
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

////////////////////////////// login

export const loginController = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  try {
    const { email, password } = req.body;
    const user = await Usermodel.findOne({ email }).select("password");

    if (!user) {
      res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        errors: "Invalid credentials",
      });
    }

    const token = await user.generateJWT();
    delete user._doc.password;
    res.status(200).json({ user, token });
    req.email = email;
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

///////////////////////////////////////////// profile

export const profileController = async (req, res) => {
  res.status(200).json({
    user: req.user,
  });
};

export const logoutController = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization.split(" ")[1];
    redisClient.set(token, "logout", "EX", 60 * 60 * 24);
    res.status(200).json({
      message: "Logout succesffull!!",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
// controller/user.controller.js
export const getAllUsers = async (req, res) => {
  try {
    // Fetch all users with only _id and email fields

    const validateAdmin = await Usermodel.findById({ _id: req.user._id });
    if (validateAdmin.email == "wiener@gmail.com") {
      const users = await Usermodel.find({}, "_id email").lean();

      res.status(200).json({ users });
    } else {
      res.status(403).json({
        message: "Only Admins are Allowed",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: err.message,
    });
  }
};
