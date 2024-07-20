import { expressjwt } from "express-jwt";
import { Config } from "../config";
import { Request } from "express";
import { AuthCookie, IRefreshTokenPayload } from "../types";
import RefreshToken from "../models/RefreshToken";
import logger from "../config/logger";

export default expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET!,
    algorithms: ["HS256"],

    getToken(req: Request) {
        const { refreshToken } = req.cookies as AuthCookie;
        if (typeof refreshToken === "string") {
            return refreshToken;
        }
        logger.warn("Refresh token not found or is not a string in cookies");
        return undefined;
    },

    async isRevoked(request: Request, token) {
        let payload: IRefreshTokenPayload | undefined;

        try {
            payload = token?.payload as IRefreshTokenPayload;

            if (!payload || !payload._id || !payload.refreshTokenId) {
                logger.warn("Invalid token payload", { payload });
                return true; // Token is revoked if payload is invalid
            }
            const refreshToken = await RefreshToken.findOne({
                _id: payload.refreshTokenId,
                user: payload._id,
            }).exec();

            logger.debug("Refresh token found", { refreshToken });
            return !refreshToken;
        } catch (err) {
            const error = err as Error;
            logger.error("Error while checking the refresh token", {
                id: payload?.refreshTokenId,
                error: error.message,
            });
            return true; // Revoke the token on error
        }
    },
});
