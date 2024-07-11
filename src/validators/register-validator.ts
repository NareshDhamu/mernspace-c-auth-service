import { checkSchema } from "express-validator";

export default checkSchema({
    email: {
        errorMessage: "Email is required",
        notEmpty: true,
        trim: true,
        isEmail: {
            errorMessage: "Invalid email format",
        },
    },
    password: {
        errorMessage: "Password is required",
        notEmpty: true,
        isLength: {
            options: { min: 8 },
            errorMessage: "Password must be at least 8 characters long",
        },
    },
    firstName: {
        errorMessage: "First Name is required",
        notEmpty: true,
    },
    lastName: {
        errorMessage: "Last Name is required",
        notEmpty: true,
    },
});

// export default [
//     body("email").notEmpty().withMessage("Email is required"),
//     body("password").notEmpty(),
//     body("firstName").notEmpty(),
//     body("lastName").notEmpty(),
// ];
