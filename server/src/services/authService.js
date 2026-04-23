import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

const isAllowedEmail = email =>
  email.endsWith("@mcgill.ca") || email.endsWith("@mail.mcgill.ca");

const getRoleForEmail = email => (email.endsWith("@mcgill.ca") ? "BOTH" : "USER");

export async function registerUser({ name, email, password }) {
  const normalizedEmail = email.toLowerCase().trim();

  if (!isAllowedEmail(normalizedEmail)) {
    const error = new Error("Only McGill emails can register");
    error.status = 400;
    throw error;
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const error = new Error("Email already registered");
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: normalizedEmail,
    passwordHash,
    role: getRoleForEmail(normalizedEmail),
  });

  const token = generateToken({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  return { user, token };
}

export async function loginUser({ email, password }) {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user || !user.passwordHash) {
    const error = new Error("Invalid credentials");
    error.status = 400;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    const error = new Error("Invalid credentials");
    error.status = 400;
    throw error;
  }

  const token = generateToken({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  return { user, token };
}
