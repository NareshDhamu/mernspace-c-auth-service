import express, {
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from "express";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import logger from "../config/logger";
import registerValidator from "../validators/register-validator";
import { TokenService } from "../services/TokenService";
import { RefreshToken } from "../entity/RefreshToken";
import loginValidator from "../validators/login-validator";
import { CredentialService } from "../services/CredentialService";
import { AuthRequest } from "../types";
import authenticate from "../middlewares/authenticate";
import validareRefreshToken from "../middlewares/validareRefreshToken";
import parseRefreshToken from "../middlewares/parseRefreshToken";
import { AuthController } from "../controllers/authController";
// import authenticate from "../middlewares/authenticate";

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshTokenRepository);
const credenttialService = new CredentialService();
const authController = new AuthController(
    userService,
    logger,
    tokenService,
    credenttialService,
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
