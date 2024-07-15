import { NextFunction, Response } from "express";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../entity/User";
import { TokenService } from "../services/TokenService";
import createHttpError from "http-errors";
import { CredentialService } from "../services/CredentialService";
import { AuthRequest, RegisterUserRequest } from "../types";
import { Roles } from "../constants";
export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
        private credenttialService: CredentialService,
    ) {}

    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        const { firstName, lastName, email, password } = req.body;

        this.logger.debug("New ewquest to register a user", {
            firstName,
            lastName,
            email,
            password: "********",
        });
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role: Roles.CUSTOMER,
            });
            this.logger.info("User has been registered", { id: user.id });
            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            const newRefreshToken = await this.tokenService.persistRefreshToken(
                user as unknown as User,
            );

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });
            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, //1h
                httpOnly: true, // Very important
            });
            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, //1y
                httpOnly: true, // Very important
            });
            res.status(201).json({ id: user.id });
        } catch (err) {
            next(err);
            return;
        }
    }
    async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        const { email, password } = req.body;

        this.logger.debug("New ewquest to login a register a user", {
            email,
            password: "********",
        });

        try {
            const user = await this.userService.findByEmailWithPassword(email);
            if (!user) {
                const err = createHttpError(
                    400,
                    "Email or password does not match",
                );
                next(err);
                return;
            }

            const passwordMatch = await this.credenttialService.comparePassword(
                password,
                user.password,
            );

            if (!passwordMatch) {
                const err = createHttpError(400, "Password not match");
                next(err);
                return;
            }
            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });
            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, //1h
                httpOnly: true, // Very important
            });
            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, //1y
                httpOnly: true, // Very important
            });

            this.logger.info("User has been logged in", { id: user.id });
            res.status(200).json({ id: user.id });
        } catch (err) {
            next(err);
            return;
        }
    }
    async self(req: AuthRequest, res: Response) {
        const user = await this.userService.findById(Number(req.auth.sub));

        res.json({ ...user, password: undefined });
    }
    async refresh(req: AuthRequest, res: Response, next: NextFunction) {
        const payload: JwtPayload = {
            sub: req.auth.sub,
            role: req.auth.role,
        };

        try {
            const accessToken = this.tokenService.generateAccessToken(payload);
            const user = await this.userService.findById(Number(req.auth.sub));
            if (!user) {
                const err = createHttpError(
                    400,
                    "User with the token could not find",
                );
                next(err);
                return;
            }

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);
            await this.tokenService.deleteRefreshToken(Number(req.auth.id));
            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });
            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, //1h
                httpOnly: true, // Very important
            });
            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, //1y
                httpOnly: true, // Very important
            });

            this.logger.info("User has been logged in", { id: user.id });

            res.json({ id: user.id });
        } catch (err) {
            next(err);
        }
    }
    async logout(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await this.tokenService.deleteRefreshToken(Number(req.auth.id));
            this.logger.info("Refresh token has been deleted", {
                id: req.auth.id,
            });
            this.logger.info("User has been logged out", { id: req.auth.sub });
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            res.json({});
        } catch (err) {
            next(err);
            return;
        }
    }
}
