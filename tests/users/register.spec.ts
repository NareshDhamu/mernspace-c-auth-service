/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";

describe("POST /auth/register", () => {
    let connection: DataSource;
    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });
    beforeEach(async () => {
        // Databace truncate
        await connection.dropDatabase();
        await connection.synchronize();
    });
    afterAll(async () => {
        await connection.destroy();
    });
    describe("Given all fields", () => {
        it("should return 201 status", async () => {
            // AAA
            // Arrange
            const userData = {
                firstName: "Naresh",
                lastName: "Dhamu",
                email: "nareshDhamu@gmail.com",
                password: "naresh123",
            };
            // Act

            const response = await request(app)
                .post("/auth/register")
                .send(userData);
            // Assert
            expect(response.statusCode).toBe(201);
        });

        it("should return valid json response", async () => {
            // AAA
            // Arrange
            const userData = {
                firstName: "Naresh",
                lastName: "Dhamu",
                email: "nareshDhamu@gmail.com",
                password: "naresh123",
            };
            // Act

            const response = await request(app)
                .post("/auth/register")
                .send(userData);
            // Assert
            expect(
                (response.headers as Record<string, string>)["content-type"],
            ).toEqual(expect.stringContaining("json"));
        });

        it("should persist the user in the database", async () => {
            // AAA
            // Arrange
            const userData = {
                firstName: "Naresh",
                lastName: "Dhamu",
                email: "nareshDhamu@gmail.com",
                password: "naresh123",
            };
            // Act
            await request(app).post("/auth/register").send(userData);
            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(1);
            expect(users[0].firstName).toBe(userData.firstName);
            expect(users[0].lastName).toBe(userData.lastName);
            expect(users[0].email).toBe(userData.email);
        });

        it("should return an id of the created user", async () => {
            const userData = {
                firstName: "Naresh",
                lastName: "Dhamu",
                email: "nareshDhamu@gmail.com",
                password: "naresh123",
            };
            const response = await request(app)
                .post("/auth/register")
                .send(userData);
            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty("id");
            expect(typeof response.body.id).toBe("string");
        });

        it("should return a customer role", async () => {
            const userData = {
                firstName: "Naresh",
                lastName: "Dhamu",
                email: "nareshDhamu@gmail.com",
                password: "naresh123",
            };
            // Act
            await request(app).post("/auth/register").send(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0]).toHaveProperty("role");
            expect(users[0].role).toBe(Roles.CUSTOMER);
        });
    });
    describe("Fields are missing", () => {});
});
