import createHttpError from "http-errors";
import Tenant, { ITenant } from "../models/Tenant"; // Adjust the path as needed

export class TenantService {
    async create(tenantData: {
        name: string;
        address: string;
        userId: string;
    }): Promise<ITenant> {
        try {
            const tenant = new Tenant(tenantData);
            await tenant.save();
            return tenant;
        } catch (err) {
            throw createHttpError(500, "Failed to create tenant");
        }
    }

    async update(id: string, tenantData: Partial<ITenant>) {
        return await Tenant.findByIdAndUpdate(id, tenantData, { new: true });
    }

    async getAll() {
        return await Tenant.find();
    }

    async getById(tenantId: string) {
        return await Tenant.findById(tenantId);
    }

    async deleteById(tenantId: string) {
        return await Tenant.findByIdAndDelete(tenantId);
    }
}
