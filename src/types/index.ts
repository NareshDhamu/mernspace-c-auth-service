import { Request } from "express";

// User-related interfaces
export interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    tenantId?: number;
}

export interface LimitedUserData {
    firstName?: string;
    lastName?: string;
    role?: string;
    tenantId?: string;
}

export interface RegisterUserRequest extends Request {
    body: UserData;
}

export interface AuthRequest extends Request {
    auth: {
        _id: string;
        role: string;
        refreshTokenId: string;
    };
}
export interface AuthReq extends Request {
    auth?: {
        _id: string;
        role: string;
        refreshTokenId: string;
    };
    user?: {
        _id: string;
    };
}

export interface UpdateUserRequest extends Request {
    body: LimitedUserData;
}

// Token-related interfaces
export type AuthCookie = {
    accessToken: string;
    refreshToken: string;
};

export interface IRefreshTokenPayload {
    _id: string;
    userId: string; // Ensure this matches your actual payload
    refreshTokenId: string; // Ensure this matches your actual payload
}

// Tenant-related interfaces
export interface ITenant {
    name: string;
    address: string;
}

export interface CreateTenantRequest extends Request {
    body: ITenant;
}

export interface CreateUserRequest extends Request {
    body: UserData;
}

export interface IError {
    status: number;
    message: string;
}

// src/types/index.ts

export interface IRefreshTokenPayload {
    _id: string; // User ID or token ID
    refreshTokenId: string; // User identifier, can be user ID or any
}

export interface UserQueryParams {
    page: number;
    limit: number;
}
