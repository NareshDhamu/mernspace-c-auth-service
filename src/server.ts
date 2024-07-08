import app from "./app";
import { Config } from "./config";
import logger from "./config/logger";

const startServer = () => {
    const PORT = Config.PORT;
    try {
        app.listen(PORT, () => {
            // eslint-disable-next-line no-console
            logger.info(`Server running on port ${PORT}`);
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            logger.error(err.message);
            process.exit(1);
        }
    }
};

startServer();
