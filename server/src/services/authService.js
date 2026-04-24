import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const generateToken = (user) => {
    return jwt.sign({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
    }, env.jwtSecret, { expiresIn: "7d" });
};


export async function loginUser(formData) {
    const { email, password } = formData;

    const nEmail = email.toLowerCase().trim();

    // Find the user by email
    const user = await User.findOne({ email: nEmail });
    if (!user) {
        const error = new Error("Invalid email or password");
        error.status = 401;
        throw error;
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        const error = new Error("Invalid email or password");
        error.status = 401;
        throw error;
    }

    // Generate JWT token
    const token = generateToken(user);
    return { user, token };

}


export async function registerUser(formData) {
    const { username, email, password } = formData;
    const nEmail = email.toLowerCase().trim();

    // Check if email is a valid McGill email
    const validEmail = email.endsWith("@mcgill.ca") || email.endsWith("@mail.mcgill.ca");
    if (!validEmail) {
        const error = new Error("Only McGill email addresses are allowed");
        error.status = 400;
        throw error;
    }

    // Check if email is already in use
    const existingUser = await User.findOne({ email: nEmail });
    if (existingUser) {
        const error = new Error("Email already in use");
        error.status = 400;
        throw error;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = new User({
        name: username,
        email: nEmail,
        passwordHash: hashedPassword,
        role: email.endsWith("@mcgill.ca") ? "OWNER" : "USER",
    });
    await user.save();

    const token = generateToken(user);
    return { user, token };
}