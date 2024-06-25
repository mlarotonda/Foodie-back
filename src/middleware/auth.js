import jwt from "jsonwebtoken";
import config from "../config/config.js";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    console.log("No token provided.");
    return res.status(403).send({ message: "No token provided." });
  }

  const token = authHeader.split(" ")[1];
  console.log("Token received:", token);

  jwt.verify(token, config.secretKey, (err, decoded) => {
    if (err) {
      console.log("Failed to authenticate token:", err);
      return res.status(500).send({ message: "Failed to authenticate token." });
    }

    req.user = { id: decoded.id }; // Asegúrate de que req.user esté correctamente configurado
    console.log("Token authenticated. User ID:", req.user.id);
    next();
  });
};

export default authMiddleware;
