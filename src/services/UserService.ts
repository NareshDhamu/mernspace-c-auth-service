import User, { IUser } from "../models/User";
import { LimitedUserData, UserData, UserQueryParams } from "../types";
import createHttpError from "http-errors";
import bcrypt from "bcryptjs";

export class UserService {
    constructor() {}

    async create({
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId,
    }: UserData) {
        const user = await User.findOne({ email });
        if (user) {
            throw createHttpError(400, "User Email already exists!");
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        try {
            const newUser = new User({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role,
                tenant: tenantId ? tenantId : undefined, // Assuming tenantId is a string
            });
            const response = await newUser.save();
            return response;
        } catch (err) {
            throw createHttpError(
                500,
                "Failed to store the user in the database",
            );
        }
    }

    async findByEmailWithPassword(email: string) {
        return await User.findOne({ email }).select(
            "id firstName lastName email role password",
        );
    }

    async findById(_id: string): Promise<IUser | null> {
        return await User.findById(_id).populate("tenantId");
    }

    async update(
        userId: string, // User ID to update
        { firstName, lastName, role, tenantId }: LimitedUserData,
    ) {
        try {
            return await User.findByIdAndUpdate(
                userId,
                {
                    firstName,
                    lastName,
                    role,
                    ...(tenantId && { tenantId }), // Assuming this is for tenant ID
                },
                { new: true },
            );
        } catch (err) {
            throw createHttpError(
                500,
                "Failed to update the user in the database",
            );
        }
    }

    async updateTenantId(userId: string, tenantId: string) {
        try {
            return await User.findByIdAndUpdate(
                userId,
                { tenantId },
                { new: true },
            );
        } catch (err) {
            throw createHttpError(
                500,
                "Failed to update the user's tenant ID in the database",
            );
        }
    }
    async getAll(validationQuery: UserQueryParams) {
        const totalCount = await User.countDocuments();

        const data = await User.find()
            .skip((validationQuery.page - 1) * validationQuery.limit)
            .limit(validationQuery.limit);

        return {
            totalCount,
            data,
        };
    }

    async deleteById(userId: string) {
        // Changed parameter type to string
        return await User.findByIdAndDelete(userId);
    }
}
