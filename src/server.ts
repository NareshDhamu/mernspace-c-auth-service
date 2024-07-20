// main.ts or index.ts (your main application file)
import connectDB from "./db/dbconnect";
import app from "./app";
import logger from "./config/logger";
import { Config } from "./config";

const startServer = async () => {
    const PORT = Config.PORT;

    // Initialize the MongoDB connection
    await connectDB();

    // Start the server
    app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
    });
};

// Start the server
void startServer();
