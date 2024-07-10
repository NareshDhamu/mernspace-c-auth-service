import { NextFunction, Response } from "express";
import { RequestWithUser } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {}

    async register(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            const { firstName, lastName, email, password } = req.body;
            this.logger.debug("New ewquest to register a user", {
                firstName,
                lastName,
                email,
                password: "********",
            });
            if (!firstName || !lastName || !email || !password) {
                return res
                    .status(400)
                    .json({ message: "All fields are required" });
            }

            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });
            this.logger.info("User has been registered", { id: user.id });
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
