// user.service.js
import Usermodel from "../models/user.model.js";

export const createUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  const hashedPassword = await Usermodel.hashPassword(password);

  const user = await Usermodel.create({
    email,
    password: hashedPassword,
  });

  return user;
};
