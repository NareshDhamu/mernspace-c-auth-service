import { NextFunction, Response } from "express";
import { RequestWithUser } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
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
