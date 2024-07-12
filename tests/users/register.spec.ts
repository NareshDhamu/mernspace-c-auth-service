import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";
import { isJwt } from "../utils";
import { RefreshToken } from "../../src/entity/RefreshToken";

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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
        it("should store the hashed password in the database", async () => {
            const userData = {
                firstName: "Naresh",
                lastName: "Dhamu",
                email: "nareshDhamu@gmail.com",
                password: "naresh123",
            };
            await request(app).post("/auth/register").send(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0].password).not.toBe(userData.password);
            expect(users[0].password).toHaveLength(60);
            expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
        });
        it("should return 400 status if email already exists", async () => {
            const userData = {
                firstName: "Naresh",
                lastName: "Dhamu",
                email: "nareshDhamu@gmail.com",
                password: "naresh123",
            };
            const userRepository = connection.getRepository(User);
            await userRepository.save({ ...userData, role: Roles.CUSTOMER });
            const response = await request(app)
                .post("/auth/register")
                .send(userData);
            const users = await userRepository.find();
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(1);
        });
        it("should return the access token ann refresh token inside a cookie", async () => {
            const userData = {
                firstName: "Naresh",
                lastName: "Dhamu",
                email: "nareshDhamu@gmail.com",
                password: "naresh123",
            };
            const response = await request(app)
                .post("/auth/register")
                .send(userData);
            interface Headers {
                ["set-cookie"]?: string[];
            }
            let accessToken: string | null = null;
            let refreshToken: string | null = null;
            const cookies = (response.headers as Headers)["set-cookie"] || [];

            cookies.forEach((cookie) => {
                if (cookie.startsWith("accessToken=")) {
                    accessToken = cookie.split(";")[0].split("=")[1];
                }
                if (cookie.startsWith("refreshToken=")) {
                    refreshToken = cookie.split(";")[0].split("=")[1];
                }
            });

            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();

            expect(isJwt(accessToken)).toBeTruthy();
            // expect(isJwt(refreshToken)).toBeTruthy();
        });
        it("should store the refresh token in the database", async () => {
            const userData = {
                firstName: "Naresh",
                lastName: "Dhamu",
                email: "nareshDhamu@gmail.com",
                password: "naresh123",
            };
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            const refreshTokenRepository =
                connection.getRepository(RefreshToken);
            // const refreshTokens = await refreshTokenRepository.find();
            // expect(refreshTokens).toHaveLength(1);
            const tokens = await refreshTokenRepository
                .createQueryBuilder("refreshToken")
                .where("refreshToken.userId =:userId", {
                    userId: (response.body as Record<string, string>).id,
                })
                .getMany();

            expect(tokens).toHaveLength(1);
        });
    });
    describe("Fields are missing", () => {
        it("should return 400 status if email field  is missing", async () => {
            const userData = {
                firstName: "Naresh",
                lastName: "Dhamu",
                email: "",
                password: "naresh123",
            };
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            expect(response.statusCode).toBe(400);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
        it("should return 400 status if password field is missing", async () => {
            const userData = {
                firstName: "Naresh",
                lastName: "Dhamu",
                email: "nareshDhamu@gmail.com",
                password: "",
            };
            const response = await request(app)
                .post("/auth/register")
                .send(userData);
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
        it("should return 400 status if firstName field is missing", async () => {
            const userData = {
                firstName: "",
                lastName: "Dhamu",
                email: "nareshDhamu@gmail.com",
                password: "naresh123",
            };
            const response = await request(app)
                .post("/auth/register")
                .send(userData);
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
        it("should return 400 status if lastName field is missing", async () => {
            const userData = {
                firstName: "Naresh",
                lastName: "",
                email: "nareshDhamu@gmail.com",
                password: "naresh123",
            };
            const response = await request(app)
                .post("/auth/register")
                .send(userData);
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
    });

    describe("Fields are not in proper format", () => {
        it("should trim the email field", async () => {
            const userData = {
                firstName: "Naresh",
                lastName: "Dhamu",
                email: "  nareshDhamu@gmail.com  ",
                password: "naresh123",
            };
            await request(app).post("/auth/register").send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            const user = [users[0]];
            expect(user[0].email).toBe("nareshDhamu@gmail.com");
        });
        it("should return 400 status if email is not a valid email", async () => {
            const userData = {
                firstName: "Naresh",
                lastName: "Dhamu",
                email: "nareshDhamu",
                password: "naresh123",
            };
            const response = await request(app)
                .post("/auth/register")
                .send(userData);
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
        it("should return 400 status code if password length is less than 8 chars", async () => {
            const userData = {
                firstName: "Naresh",
                lastName: "Dhamu",
                email: "nareshDhamu@gmail.com",
                password: "naresh",
            };
            const response = await request(app)
                .post("/auth/register")
                .send(userData);
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
        it("shoud return an array of error message if email is missing", async () => {
            const userData = {
                firstName: "Naresh",
                lastName: "Dhamu",
                password: "naresh123",
            };
            const response = await request(app)
                .post("/auth/register")
                .send(userData);
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
    });
});
