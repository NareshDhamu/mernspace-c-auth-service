import { JwtPayload, sign } from "jsonwebtoken";
import createHttpError from "http-errors";
import { Config } from "../config";
import RefreshToken, { IRefreshTokenPayload } from "../models/RefreshToken";
import { IUser } from "../models/User";
import { Types } from "mongoose";

export class TokenService {
    constructor() {}

    generateAccessToken(payload: JwtPayload): string {
        const privateKey = Config.PRIVATE_KEY;

        if (!privateKey) {
            throw createHttpError(500, "PRIVATE_KEY is not set");
        }

        const accessToken = sign(payload, privateKey, {
            algorithm: "RS256",
            expiresIn: "1h",
            issuer: "auth-service",
        });

        return accessToken;
    }

    generateRefreshToken(payload: JwtPayload): string {
        const refreshTokenSecret = Config.REFRESH_TOKEN_SECRET;

        if (!refreshTokenSecret) {
            throw createHttpError(500, "REFRESH_TOKEN_SECRET is not set");
        }

        const refreshToken = sign(payload, refreshTokenSecret, {
            algorithm: "HS256",
            expiresIn: "1y",
            issuer: "auth-service",
            jwtid: payload.sub?.toString() || "",
        });

        return refreshToken;
    }

    async persistRefreshToken(user: IUser): Promise<IRefreshTokenPayload> {
        const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;

        const newRefreshToken = new RefreshToken({
            user: user._id,
            expiresAt: new Date(Date.now() + MS_IN_YEAR),
        });

        await newRefreshToken.save();

        const refreshTokenId = (
            newRefreshToken._id as Types.ObjectId
        ).toString();

        return {
            refreshTokenId,
            userId: user._id.toString(),
        };
    }

    async deleteRefreshToken(tokenId: string): Promise<void> {
        await RefreshToken.deleteOne({ _id: tokenId });
    }
}
