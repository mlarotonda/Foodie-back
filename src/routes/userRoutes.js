import { Router } from "express";
import UserController from "../controller/UserController.js";

const userRoutes = Router()
const userController = new UserController()

//CRUD ROLES
userRoutes.post("", userController.createUser)
userRoutes.get("", userController.getAllUsers)
userRoutes.get("/:id", userController.getUserById)
userRoutes.put("/:id", userController.updateUser)
userRoutes.delete("/:id", userController.deleteUser)
userRoutes.post("/login", userController.login)

export default userRoutes