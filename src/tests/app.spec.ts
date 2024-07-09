import request from "supertest";
import { calculateDiscount } from "../utils";
import app from "../app";

describe("App", () => {
    it("should calculate discount", () => {
        const result = calculateDiscount(100, 10);

        expect(result).toBe(10);
    });
    it("should return 200 status", async () => {
        const response = await request(app).get("/");
        expect(response.statusCode).toBe(200);
    });
});
