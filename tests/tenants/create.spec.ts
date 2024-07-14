import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import request from "supertest";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";
describe("POST /tenants", () => {
    let connection: DataSource;
    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });
    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
    });
    afterAll(async () => {
        await connection.destroy();
    });

    describe("Given all fields", () => {
        it("should  return 201 status code", async () => {
            const tenantData = {
                name: "Naresh Dhamu",
                address: "Dhaneriya, Siwada. Sanchore, 343041, Raj, India",
            };
            const response = await request(app)
                .post("/tenants")
                .send(tenantData);
            expect(response.statusCode).toBe(201);
            const userRepository = connection.getRepository(Tenant);
            const tenants = await userRepository.find();
            expect(tenants).toHaveLength(1);
        });
    });
});
