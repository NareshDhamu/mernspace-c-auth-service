import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/UserService";
import { CreateUserRequest } from "../types";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";

export class UserController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {}
    async create(req: CreateUserRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        const { firstName, lastName, email, password, role, tenantId } =
            req.body;
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role,
                tenantId,
            });

            res.status(201).json({ id: user.id });
        } catch (err) {
            next(err);
        }
    }
    async update(req: CreateUserRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        const { firstName, lastName, role } = req.body;
        const userId = req.params.id;
        if (isNaN(Number(userId))) {
            next(createHttpError(400, "Invalid url param."));
            return;
        }
        this.logger.debug("Request to update a user", req.body);
        try {
            await this.userService.update(Number(userId), {
                firstName,
                lastName,
                role,
            });
            this.logger.info("User has been updated", { id: userId });
            res.json({ id: Number(userId) });
        } catch (err) {
            next(err);
        }
    }
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await this.userService.getAll();
            this.logger.info("All users has been fetched");
            res.json(users);
        } catch (err) {
            next(err);
        }
    }
    async getOne(req: Request, res: Response, next: NextFunction) {
        const userId = req.params.id;
        if (isNaN(Number(userId))) {
            next(createHttpError(400, "Invalid url param."));
            return;
        }
        try {
            const user = await this.userService.findById(Number(userId));
            if (!user) {
                next(createHttpError(404, "User does not exist."));
                return;
            }
            this.logger.info("User has been fetched", { id: userId });
            res.json(user);
        } catch (err) {
            next(err);
        }
    }
    async destroy(req: Request, res: Response, next: NextFunction) {
        const userId = req.params.id;
        if (isNaN(Number(userId))) {
            next(createHttpError(400, "Invalid url param."));
            return;
        }
        try {
            await this.userService.deleteById(Number(userId));
            this.logger.info("User has been deleted", { id: userId });
            res.json({ id: Number(userId) });
        } catch (err) {
            next(err);
        }
    }
}
