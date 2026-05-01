// EnYi Hou (261165635)

import { loginUser, registerUser } from "../services/authService.js";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
};

function userToPayload(user) {
  return ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  })
}


export async function register(req, res, next) {
  try {
    const { user, token } = await registerUser(req.body);
    console.log("Registered user:", user);
    res.cookie("token", token, cookieOptions);
    res.status(200).json({ user: userToPayload(user) });
  }
  catch (err) {
    next(err);
  }

}

export async function login(req, res, next) {
  try {

    const { user, token } = await loginUser(req.body);

    res.cookie("token", token, cookieOptions);
    res.status(200).json({ user: userToPayload(user) });
  } catch (err) {
    next(err);
  }

}

export async function logout(req, res) {
  res.clearCookie("token", cookieOptions).json({ message: "Logged out successfully" });
}

export async function me(req, res) {
  res.json({ user: req.user });
}
