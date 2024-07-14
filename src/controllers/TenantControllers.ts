import { NextFunction, Response } from "express";
import { TenantService } from "../services/TenantService";
import { CreactTenantRequest } from "../types";
import { Logger } from "winston";

export class TenantControllers {
    constructor(
        private tenantService: TenantService,
        private logger: Logger,
    ) {}
    async creact(req: CreactTenantRequest, res: Response, next: NextFunction) {
        const { name, address } = req.body;
        this.logger.debug("Request to create a tenant", req.body);
        try {
            const tenant = await this.tenantService.creact({ name, address });
            this.logger.info("Tenant has been created", { id: tenant.id });
            res.status(201).json({ id: tenant.id });
        } catch (err) {
            next(err);
        }
    }
}
