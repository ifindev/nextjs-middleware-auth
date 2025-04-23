import { LoginRequest, LoginResponse } from '../models/login.model';
import { User } from '../models/user.model';
import { LoginResponse as RefreshTokenResponse } from '../models/login.model';

export default interface AuthRepository {
    login(req: LoginRequest): Promise<LoginResponse>;
    logout(): Promise<void>;
    refreshToken(): Promise<RefreshTokenResponse>;
    getUser(): Promise<User>;
}
