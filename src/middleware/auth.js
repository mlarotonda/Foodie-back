import jwt from "jsonwebtoken";
import config from "../config/config.js";

const { secretKey } = config;

const authMiddleware = (req, res, next) => {
  const token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).json({ error: "No token provided." });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(500).json({ error: "Failed to authenticate token." });
    }

    req.userId = decoded.id;
    next();
  });
};

export default authMiddleware;