import mongoose from "mongoose";
import projectmodel from "../models/project.model.js";
import "../models/user.model.js";
import User from "../models/user.model.js";

export const CreateProject = async ({ name, userId }) => {
  if (!name) {
    throw new Error("Name is required");
  }

  if (!userId) {
    throw new Error("User is required");
  }

  let project;
  try {
    project = await projectmodel.create({
      name,
      users: [userId],
    });
  } catch (err) {
    if ((err.code = 11000)) {
      throw new Error("Project name already Exists!!");
    }
  }
  return project;
};

export const getAllProjectByUserId = async ({ userId }) => {
  if (!userId) {
    throw new Error("UserId is required");
  }

  const allUserProjects = await projectmodel
    .find({ users: userId }) // fetch projects where this user is a collaborator
    .populate("users", "email"); // replace user IDs with their emails

  return allUserProjects;
};

/* export const getAllProjectByUserId = async ({ userId, email }) => {
  if (!userId) {
    throw new Error("UserId is required");
  }
  const allUserProjects = await projectmodel.find({
    users: userId,
    emails: email,
  });
  return allUserProjects;
}; */

export const addUsersToProject = async ({ projectId, users, userId }) => {
  if (!projectId) {
    throw new Error("projectId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid projectId");
  }

  if (!users || !Array.isArray(users)) {
    throw new Error("users must be an array");
  }

  // Validate each user ID
  const areValidUsers = users.every((id) =>
    mongoose.Types.ObjectId.isValid(id),
  );
  if (!areValidUsers) {
    throw new Error("Invalid userId(s) in users array");
  }

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid requester userId");
  }

  const project = await projectmodel.findOne({
    _id: projectId,
    users: userId,
  });

  if (!project) {
    throw new Error("User does not belong to this project");
  }

  // 🔥 THIS IS THE IMPORTANT FIX
  const objectIdUsers = users.map((id) => new mongoose.Types.ObjectId(id));

  const projecting = await projectmodel.findById(projectId).lean();
  console.log("Existing users:", projecting.users);

  const updatedProject = await projectmodel.findOneAndUpdate(
    { _id: projectId },
    {
      $addToSet: {
        users: {
          $each: objectIdUsers,
        },
      },
    },
    { new: true },
  );

  return updatedProject;
};

export const getProjectById = async ({ projectId }) => {
  if (!projectId) {
    throw new Error("projectId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid projectId");
  }

  const project = await projectmodel
    .findOne({
      _id: projectId,
    })
    .populate("users");

  return project;
};
