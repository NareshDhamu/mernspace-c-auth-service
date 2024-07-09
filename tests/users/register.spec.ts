import request from "supertest";
import app from "../../src/app";

describe("POST /auth/register", () => {
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
    });
    describe("Fields are missing", () => {});
});
