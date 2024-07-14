import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import request from "supertest";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";
describe("POST /tenants", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:5501");
        connection = await AppDataSource.initialize();
    });
    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
    });
    afterEach(() => {
        jwks.stop();
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
            const adminToken = jwks.token({
                sub: "1",
                role: Roles.CUSTOMER,
            });
            const response = await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken};`])
                .send(tenantData);
            expect(response.statusCode).toBe(201);
        });

        it("should creact a tenant in the database", async () => {
            const tenantData = {
                name: "Naresh Dhamu",
                address: "Dhaneriya, Siwada. Sanchore, 343041, Raj, India",
            };
            const adminToken = jwks.token({
                sub: "1",
                role: Roles.CUSTOMER,
            });
            await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken};`])
                .send(tenantData);
            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();
            expect(tenants).toHaveLength(1);
            expect(tenants[0].name).toBe(tenantData.name);
            expect(tenants[0].address).toBe(tenantData.address);
            ("id");
        });
        it("should return 401 if user is not authenticated", async () => {
            const tenantData = {
                name: "Naresh Dhamu",
                address: "Dhaneriya, Siwada. Sanchore, 343041, Raj, India",
            };
            const response = await request(app)
                .post("/tenants")
                .send(tenantData);
            expect(response.statusCode).toBe(401);
            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();
            expect(tenants).toHaveLength(0);
        });
    });
});
