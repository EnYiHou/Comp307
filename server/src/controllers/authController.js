import { loginUser, registerUser } from "../services/authService.js";

const userPayload = user => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
};

export async function register(req, res, next) {
  try {
    const { user, token } = await registerUser(req.body);
    res.cookie("token", token, cookieOptions);
    res.status(201).json({ user: userPayload(user) });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { user, token } = await loginUser(req.body);
    res.cookie("token", token, cookieOptions);
    res.json({ user: userPayload(user) });
  } catch (error) {
    next(error);
  }
}

export function logout(req, res) {
  res.clearCookie("token");
  
  res.json({ message: "Logged out" });
}

export function me(req, res) {
  res.json({ user: req.user });
}
