import mongoose, { Document, Schema, Types } from "mongoose";

export interface IUser extends Document {
    _id: Types.ObjectId; // Use ObjectId for MongoDB
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    tenants?: {
        tenantId: string;
    }; // Optional reference to Tenant
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, required: true },
        tenantId: { type: String, ref: "Tenant" }, // Define tenant field as reference to Tenant
    },
    {
        timestamps: true,
    },
);

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
