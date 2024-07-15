import { toString } from "express-validator/lib/utils";
import { DataSource, Repository } from "typeorm";
import { Tenant } from "../../src/entity/Tenant";

export const truncateTables = async (connection: DataSource) => {
    const entities = connection.entityMetadatas;
    for (const entity of entities) {
        const repository = connection.getRepository(entity.name);
        await repository.clear();
    }
};

export const isJwt = (token: string | null): boolean => {
    if (token === null) return false;
    const parts = token.split(".");
    if (parts.length !== 3) {
        return false;
    }
    try {
        parts.forEach((part) => {
            Buffer.from(part, "base64"), toString("utf-8");
        });
        return true;
    } catch (error) {
        return false;
    }
};

export const createTenant = async (repository: Repository<Tenant>) => {
    const tenant = repository.create({
        name: "Test Tenant",
        address: "Test Address",
    });
    return await repository.save(tenant);
};
// export const createTrnant = async (repository: Repository<Tenant>) => {
//     const tenant = await repository.save({
//         name: "Test Tenant",
//         address: "Test Address",
//     });
//     return tenant;
// };
