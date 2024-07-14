import { Repository } from "typeorm";
import { ITenant } from "../types";
import { Tenant } from "../entity/Tenant";
export class TenantService {
    constructor(private tenantRepository: Repository<Tenant>) {}
    async creact(tenantData: ITenant) {
        return await this.tenantRepository.save(tenantData);
    }
}
