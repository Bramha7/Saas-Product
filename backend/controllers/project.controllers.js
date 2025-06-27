import {
  CreateProject,
  getAllProjectByUserId,
  getProjectById,
} from "../services/project.service.js";
import usermodel from "../models/user.model.js";
import { validationResult } from "express-validator";
import { addUsersToProject } from "../services/project.service.js";

export const createProject = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name } = req.body;
    const email = req.user.email;
    let userId;
    let newProject;
    if (email != undefined) {
      const loggedinUser = await usermodel.findOne({ email });
      userId = loggedinUser._id;
      newProject = await CreateProject({ name, userId });
    } else {
      userId = req.user._id;
      newProject = await CreateProject({ name, userId });
    }

    res.status(201).json(newProject);
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
};

export const getAllProject = async (req, res) => {
  try {
    let userId;

    let allUserProjects;
    if (req.user.email != undefined) {
      let loggedInUser = await usermodel.findOne({
        email: req.user.email,
      });

      allUserProjects = await getAllProjectByUserId({
        userId: loggedInUser._id,
      });
    } else {
      userId = req.user._id;

      allUserProjects = await getAllProjectByUserId({ userId });
    }

    return res.status(200).json({
      projects: allUserProjects,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      muessage: err.message,
    });
  }
};

// add user

export const addUserToProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { projectId, users } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let userId;

    if (req.user.email) {
      const loggedInUser = await usermodel.findOne({ email: req.user.email });

      if (!loggedInUser) {
        return res.status(404).json({ message: "User not found" });
      }

      userId = loggedInUser._id;
    } else {
      userId = req.user._id;
    }

    const project = await addUsersToProject({ projectId, users, userId });

    return res.status(200).json({ project });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err.message });
  }
};

// get project by id
export const fetchProductById = async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await getProjectById({ projectId });

    return res.status(200).json({
      project,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};
