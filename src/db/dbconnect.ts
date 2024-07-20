// dbconnect.ts
import mongoose, { ConnectOptions } from "mongoose";
import logger from "../config/logger";
import { Config } from "../config";

const connectDB = async () => {
    const dbUri = Config.MONGO_URI;

    if (!dbUri) {
        logger.error("MONGO_URI is not defined in configuration.");
        process.exit(1);
    }

    try {
        await mongoose.connect(dbUri, {} as ConnectOptions);
        logger.info("MongoDB connected successfully");
    } catch (err: unknown) {
        if (err instanceof Error) {
            logger.error(`Error connecting to MongoDB: ${err.message}`);

            setTimeout(() => {
                process.exit(1);
            }, 1000);
        }
    }
};

export default connectDB;
