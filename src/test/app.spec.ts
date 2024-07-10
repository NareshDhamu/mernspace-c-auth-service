import request from "supertest";
import app from "../app";
import { calculateDiscount } from "../utils";

// Ensure the app import is typed correctly
import { Application } from "express";

const server: Application = app;

describe("App", () => {
    it("should calculate discount", () => {
        const result: number = calculateDiscount(100, 10);
        expect(result).toBe(10);
    });

    it("should return 200 status", async () => {
        const response = await request(server).get("/");
        expect(response.status).toBe(200);
    });
});
