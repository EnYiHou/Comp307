export default function requireOwner(req, res, next) {
  if (!req.user || !["OWNER", "BOTH"].includes(req.user.role)) {
    return res.status(403).json({ message: "Owner access required" });
  }

  return next();
}
