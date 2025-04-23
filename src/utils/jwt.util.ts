import { SECOND } from '@/constants/time.constant';
import { jwtDecode } from 'jwt-decode';

export function getTokenExpiryTime(token: string): number {
    const decoded = jwtDecode<{ exp: number }>(token);
    return decoded.exp;
}

export function isTokenExpired(token: string): boolean {
    const exp = getTokenExpiryTime(token);
    const now = new Date().getTime() / SECOND;

    return exp < now;
}
