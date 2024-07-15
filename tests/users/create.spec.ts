import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import createJWKSMock from "mock-jwks";
import request from "supertest";
import { Roles } from "../../src/constants";
import { User } from "../../src/entity/User";
import { Tenant } from "../../src/entity/Tenant";
import { createTenant } from "../utils";

describe("POST /users", () => {
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
        it("should persist the user in the database", async () => {
            const tenant = await createTenant(connection.getRepository(Tenant));
            const adminToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });

            // Register user
            const userData = {
                firstName: "Naresh",
                lastName: "Dhamu",
                email: "nareshDhamu@gmail.com",
                password: "naresh123",
                tenantId: tenant.id,
                role: Roles.MANAGER,
            };

            // Add token to cookie
            await request(app)
                .post("/users")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users).toHaveLength(1);
            expect(users[0].email).toBe(userData.email);
        });

        it("should create a manager user", async () => {
            const tenant = await createTenant(connection.getRepository(Tenant));
            const adminToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });

            // Register user
            const userData = {
                firstName: "Naresh",
                lastName: "Dhamu",
                email: "nareshDhamu@gmail.com",
                password: "naresh123",
                role: Roles.MANAGER,
                tenantId: tenant.id,
            };

            // Add token to cookie
            await request(app)
                .post("/users")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(userData);
            const userRepository = connection.getRepository(User);
            // console.log(response.body);
            const users = await userRepository.find();
            // console.log(users);
            expect(users).toHaveLength(1);
            expect(users[0].role).toBe(Roles.MANAGER);
        });
        it("should return 403 if non admin user tries to create a user", async () => {
            const nonAdminToken = jwks.token({
                sub: "1",
                role: Roles.CUSTOMER,
            });
            const userData = {
                firstName: "Naresh",
                lastName: "Dhamu",
                email: "nareshDhamu@gmail.com",
                password: "naresh123",
                tenantId: 1,
            };

            const response = await request(app)
                .post("/users")
                .set("Cookie", [`accessToken=${nonAdminToken};`])
                .send(userData);

            expect(response.status).toBe(403);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
    });
});
