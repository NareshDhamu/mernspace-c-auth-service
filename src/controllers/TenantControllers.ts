import { NextFunction, Request, Response } from "express";
import { TenantService } from "../services/TenantService";
import { AuthRequest, CreateTenantRequest } from "../types";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import { UserService } from "../services/UserService";

export class TenantControllers {
    constructor(
        private tenantService: TenantService,
        private logger: Logger,
        private userService: UserService,
    ) {}

    async create(
        req: AuthRequest & CreateTenantRequest,
        res: Response,
        next: NextFunction,
    ) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const userId = req.auth._id;
        if (!userId) {
            return next(createHttpError(400, "User ID is missing"));
        }

        const { name, address }: { name: string; address: string } =
            req.body as { name: string; address: string };
        this.logger.debug("Request to create a tenant", req.body);

        try {
            const tenant = (await this.tenantService.create({
                name,
                address,
                userId,
            })) as { _id: string };

            // Update user with tenantId
            const updatedUser = await this.userService.update(userId, {
                tenantId: tenant._id, // Ensure tenantId is included
            });

            if (!updatedUser) {
                return next(createHttpError(404, "User not found"));
            }
            this.logger.info("Tenant has been created", { id: tenant._id });
            return res.status(201).json({ id: tenant._id });
        } catch (err) {
            return next(err);
        }
    }

    async update(req: CreateTenantRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const { name, address } = req.body;
        const tenantId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(tenantId)) {
            next(createHttpError(400, "Invalid URL param."));
            return;
        }

        this.logger.debug("Request to update a tenant", req.body);
        try {
            await this.tenantService.update(tenantId, { name, address });
            this.logger.info("Tenant has been updated", { id: tenantId });
            res.json({ id: tenantId });
        } catch (err) {
            next(err);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const tenants = await this.tenantService.getAll();
            this.logger.info("All tenants have been fetched");
            res.json(tenants);
        } catch (err) {
            next(err);
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(tenantId)) {
            next(createHttpError(400, "Invalid URL param."));
            return;
        }

        try {
            const tenant = await this.tenantService.getById(tenantId);
            if (!tenant) {
                next(createHttpError(404, "Tenant not found"));
                return;
            }
            this.logger.info("Tenant has been fetched", { id: tenantId });
            res.json(tenant);
        } catch (err) {
            next(err);
        }
    }

    async destroy(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(tenantId)) {
            next(createHttpError(400, "Invalid URL param."));
            return;
        }

        try {
            await this.tenantService.deleteById(tenantId);
            this.logger.info("Tenant has been deleted", { id: tenantId });
            res.json({ id: tenantId });
        } catch (err) {
            next(err);
        }
    }
}
