import mongoose, { Document, Schema, Types } from "mongoose";

export interface IRefreshTokenPayload {
    userId: string;
    refreshTokenId: string;
}

export interface IRefreshToken extends Document {
    user: Types.ObjectId;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const RefreshTokenSchema: Schema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        expiresAt: { type: Date, required: true },
    },
    {
        timestamps: true,
    },
);

const RefreshToken = mongoose.model<IRefreshToken>(
    "RefreshToken",
    RefreshTokenSchema,
);
export default RefreshToken;
