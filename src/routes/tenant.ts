import express, {
    NextFunction,
    RequestHandler,
    Response,
    Request,
} from "express";
import { TenantControllers } from "../controllers/TenantControllers";
import { TenantService } from "../services/TenantService";
import logger from "../config/logger";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";
import { AuthRequest, CreateTenantRequest } from "../types";
import tenantValidator from "../validators/tenant-validator";
import { UserService } from "../services/UserService";

const router = express.Router();
const tenantService = new TenantService();
const userService = new UserService();
const tenantController = new TenantControllers(
    tenantService,
    logger,
    userService,
);

router.post(
    "/",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]) as RequestHandler,
    tenantValidator,
    (req: CreateTenantRequest, res: Response, next: NextFunction) =>
        tenantController.create(
            req as AuthRequest,
            res,
            next,
        ) as unknown as RequestHandler,
);

router.patch(
    "/:id",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]) as RequestHandler,
    tenantValidator,
    (req: CreateTenantRequest, res: Response, next: NextFunction) =>
        tenantController.update(req, res, next) as unknown as RequestHandler,
);

router.get(
    "/",
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.getAll(req, res, next) as unknown as RequestHandler,
);

router.get(
    "/:id",
    authenticate as RequestHandler,
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.getOne(req, res, next) as unknown as RequestHandler,
);

router.delete(
    "/:id",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]) as RequestHandler,
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.destroy(req, res, next) as unknown as RequestHandler,
);

export default router;
