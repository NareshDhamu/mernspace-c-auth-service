import express from "express";
import { TenantControllers } from "../controllers/TenantControllers";
import { TenantService } from "../services/TenantService";
import { AppDataSource } from "../config/data-source";
import { Tenant } from "../entity/Tenant";
import logger from "../config/logger";
import authenticate from "../middlewares/authenticate";

const router = express.Router();
const tenantRepository = AppDataSource.getRepository(Tenant);

const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantControllers(tenantService, logger);

router.post("/", authenticate, (req, res, next) =>
    tenantController.creact(req, res, next),
);

export default router;
