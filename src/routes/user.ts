import express, { NextFunction, Response } from "express";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";
import { UserController } from "../controllers/userController";
import { UserService } from "../services/UserService";
import { User } from "../entity/User";
import { AppDataSource } from "../config/data-source";
import logger from "../config/logger";
import { CreateUserRequest } from "../types";
import createUserValidator from "../validators/create-user-validator";

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService, logger);
router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN]),
    createUserValidator,
    (req: CreateUserRequest, res: Response, next: NextFunction) =>
        userController.create(req, res, next),
);

export default router;
