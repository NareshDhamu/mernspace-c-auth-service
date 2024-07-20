import express, {
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from "express";
import { UserService } from "../services/UserService";
import logger from "../config/logger";
import registerValidator from "../validators/register-validator";
import { TokenService } from "../services/TokenService";
import loginValidator from "../validators/login-validator";
import { CredentialService } from "../services/CredentialService";
import { AuthRequest } from "../types";
import authenticate from "../middlewares/authenticate";
import validareRefreshToken from "../middlewares/validareRefreshToken";
import parseRefreshToken from "../middlewares/parseRefreshToken";
import { AuthController } from "../controllers/authController";

const router = express.Router();
const userService = new UserService();
const tokenService = new TokenService();
const credentialService = new CredentialService();
const authController = new AuthController(
    userService,
    logger,
    tokenService,
    credentialService,
);

router.post(
    "/register",
    registerValidator,
    (req: Request, res: Response, next: NextFunction) =>
        authController.register(req, res, next) as unknown as RequestHandler,
);

router.post(
    "/login",
    loginValidator,
    (req: Request, res: Response, next: NextFunction) =>
        authController.login(req, res, next) as unknown as RequestHandler,
);

router.get(
    "/self",
    authenticate as RequestHandler,
    (req: Request, res: Response) =>
        authController.self(
            req as AuthRequest,
            res,
        ) as unknown as RequestHandler,
);

router.post(
    "/refresh",
    validareRefreshToken as RequestHandler,
    (req: Request, res: Response, next: NextFunction) =>
        authController.refresh(
            req as AuthRequest,
            res,
            next,
        ) as unknown as RequestHandler,
);

router.post(
    "/logout",
    authenticate as RequestHandler,
    parseRefreshToken as RequestHandler,
    (req: Request, res: Response, next: NextFunction) =>
        authController.logout(
            req as AuthRequest,
            res,
            next,
        ) as unknown as RequestHandler,
);

export default router;
