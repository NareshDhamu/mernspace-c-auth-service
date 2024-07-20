import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { TokenService } from "../services/TokenService";
import { CredentialService } from "../services/CredentialService";
import { AuthRequest, IError, RegisterUserRequest } from "../types";
import { Roles } from "../constants";

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
        private credentialService: CredentialService,
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

        this.logger.debug("New request to register a user", {
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
                role: Roles.ADMIN,
            });
            this.logger.info("User has been registered", { _id: user._id });
            const payload: JwtPayload = {
                _id: String(user._id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);
            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                refreshTokenId: String(newRefreshToken.refreshTokenId),
            });

            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, // 1h
                httpOnly: true,
            });
            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1y
                httpOnly: true,
            });

            res.status(201).json({ _id: user._id });
        } catch (err) {
            next(err);
        }
    }

    async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        const { email, password } = req.body;

        this.logger.debug("New request to login a user", {
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
                return next(err);
            }

            const passwordMatch = await this.credentialService.comparePassword(
                password,
                user.password,
            );

            if (!passwordMatch) {
                const err = createHttpError(400, "Password does not match");
                return next(err);
            }
            const payload: JwtPayload = {
                _id: user._id.toString(),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);
            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                refreshTokenId: newRefreshToken.refreshTokenId,
            });

            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, // 1h
                httpOnly: true,
            });
            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1y
                httpOnly: true,
            });

            this.logger.info("User has been logged in", { _id: user._id });
            res.status(200).json({ _id: user._id });
        } catch (err) {
            next(err);
        }
    }

    async self(req: AuthRequest, res: Response) {
        try {
            const userId = req.auth._id;

            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw createHttpError(400, "Invalid user ID format");
            }

            const user = await this.userService.findById(userId);

            if (!user) {
                throw createHttpError(404, "User not found");
            }

            res.json({ ...user.toObject(), password: undefined });
        } catch (err) {
            const error = err as IError;

            res.status(error.status || 500).json({
                message: error.message,
            });
        }
    }

    async refresh(req: AuthRequest, res: Response, next: NextFunction) {
        // Extract the payload from the request authentication
        const payload: JwtPayload = {
            _id: req.auth._id,
            role: req.auth.role,
        };

        try {
            // Generate new access token
            const accessToken = this.tokenService.generateAccessToken(payload);

            // Find user by ID
            const user = await this.userService.findById(req.auth._id);
            if (!user) {
                throw createHttpError(
                    400,
                    "User with the token could not be found",
                );
            }

            // Persist new refresh token
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            // Delete old refresh token
            const oldRefreshTokenId = req.auth.refreshTokenId;
            if (oldRefreshTokenId) {
                await this.tokenService.deleteRefreshToken(oldRefreshTokenId);
            } else {
                throw createHttpError(400, "No refresh token ID found");
            }

            // Generate new refresh token
            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                refreshTokenId: String(newRefreshToken.refreshTokenId), // Ensure you're using the correct property
            });

            // Set cookies
            res.cookie("accessToken", accessToken, {
                domain: "localhost", // Adjust for production
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, // 1h
                httpOnly: true,
            });
            res.cookie("refreshToken", refreshToken, {
                domain: "localhost", // Adjust for production
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1y
                httpOnly: true,
            });

            this.logger.info("User has been re-authenticated", {
                _id: user._id,
            });
            res.json({ _id: user._id });
        } catch (err) {
            next(err);
        }
    }

    async logout(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await this.tokenService.deleteRefreshToken(
                String(req.auth.refreshTokenId),
            );
            this.logger.info("Refresh token has been deleted", {
                refreshTokenId: req.auth.refreshTokenId,
            });
            this.logger.info("User has been logged out", { _id: req.auth._id });
            res.clearCookie("accessToken", {
                domain: "localhost",
                sameSite: "strict",
                httpOnly: true,
            });
            res.clearCookie("refreshToken", {
                domain: "localhost",
                sameSite: "strict",
                httpOnly: true,
            });
            res.status(200).json({ message: "Logged out successfully" });
        } catch (err) {
            next(err);
        }
    }
}
