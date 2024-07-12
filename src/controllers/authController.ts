import { NextFunction, Response } from "express";
import { RequestWithUser } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../entity/User";
import { TokenService } from "../services/TokenService";
export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
    ) {}

    async register(req: RequestWithUser, res: Response, next: NextFunction) {
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
}

// import { Response } from "express";
// import { RequestWithUser } from "../types";
// import { UserService } from "../services/UserService";

// export class AuthController {
//     constructor(private userService: UserService) {
//         this.userService = userService;
//     }
//     async register(req: RequestWithUser, res: Response) {
//         const { firstName, lastName, email, password } = req.body;
//         const user = await this.userService.create({
//             firstName,
//             lastName,
//             email,
//             password,
//         });
//         res.status(201).json({ id: user.id });
//     }
// }
