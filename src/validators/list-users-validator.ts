import { checkSchema } from "express-validator";

export default checkSchema(
    {
        page: {
            customSanitizer: {
                options: (value) => {
                    const parsedValue = Number(value);

                    return Number.isNaN(parsedValue) ? 1 : parsedValue;
                },
            },
        },
        limit: {
            customSanitizer: {
                options: (value) => {
                    const parsedValue = Number(value);

                    return Number.isNaN(parsedValue) ? 6 : parsedValue;
                },
            },
        },
    },
    ["query"],
);
