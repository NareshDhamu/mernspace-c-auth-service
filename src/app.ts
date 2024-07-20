import "reflect-metadata";
import express, { NextFunction, Request, Response } from "express";
import logger from "./config/logger";
import authRouter from "./routes/auth";
import tenantRouter from "./routes/tenant";
import { HttpError } from "http-errors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user";
import cors from "cors";
const app = express();
app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "http://192.168.1.195:5173",
            "http://172.29.192.1:5173",
        ],
        credentials: true,
    }),
);
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Wellcome to Auth service Naresh Dhamu dhaneriya");
});
app.use("/auth", authRouter);
app.use("/tenants", tenantRouter);
app.use("/users", userRouter);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                msg: err.message,
                path: "",
                location: "",
            },
        ],
    });
});
export default app;
