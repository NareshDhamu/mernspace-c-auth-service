import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import request from "supertest";

describe("POST /auth/login", () => {
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

    describe("Fields are missing", () => {
        it("should login the user", async () => {
            const userData = {
                email: "nareshDhamu@gmail.com",
                password: "naresh123",
            };
            const response = await request(app)
                .post("/auth/login")
                .send(userData);
            expect(response.statusCode).toBe(200);
        });
    });
});
