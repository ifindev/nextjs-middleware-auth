import httpClient from '@/clients/http/base-http.client';
import { LoginRequest, LoginResponse } from '../models/login.model';
import { LoginResponse as RefreshTokenResponse } from '../models/login.model';
import { User } from '../models/user.model';
import AuthRepository from './auth.repository.interface';
import { IHttpClient } from '@/clients/http/http.client.interface';

export function authRepositoryImpl(http: IHttpClient): AuthRepository {
    const login = async (req: LoginRequest): Promise<LoginResponse> => {
        const response = await http.post<LoginResponse>('auth/login', req);

        return response;
    };

    const logout = async (): Promise<void> => {
        await http.post<void>('auth/logout');
    };

    const refreshToken = async (): Promise<RefreshTokenResponse> => {
        const response = await http.post<RefreshTokenResponse>('auth/refresh-token');

        return response;
    };

    const getUser = async (): Promise<User> => {
        const response = await http.get<User>('users/profile');

        return response;
    };

    return {
        login,
        logout,
        refreshToken,
        getUser,
    };
}

const authRepository = authRepositoryImpl(httpClient);
export default authRepository;
