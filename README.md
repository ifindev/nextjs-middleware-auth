# 🔐 Next.js Authentication with JWT and External Backend

This project demonstrates how to implement secure authentication in Next.js using the App Router with an external JWT authentication service. This implementation follows security best practices and provides protection for routes in a Next.js application.

## Table of Contents

- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Authentication Implementation](#authentication-implementation)
    - [How It Works](#how-it-works)
    - [Architecture](#architecture)
    - [Sequence Diagram](#sequence-diagram)
    - [Implementation Details](#implementation-details)
- [Usage](#usage)
- [Security Best Practices](#security-best-practices)
- [Contributing](#contributing)

## Introduction

This project showcases how to implement secure authentication in a Next.js application using JSON Web Tokens (JWT) managed by an external authentication service. This approach provides a clean separation of concerns, where:

- The authentication logic and user management is handled by a dedicated backend service
- The Next.js application acts as a client to this service
- Authentication state is maintained using HTTP-only cookies containing JWT tokens

This architecture is particularly well-suited for microservice-based applications or when you need to share authentication across multiple frontend applications.

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Access to an authentication backend service.

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/next-auth-example.git
cd next-auth-example
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:
   Create a `.env` file with the following content:

```
# Backend API URL for authentication service
BACKEND_API_URL=http://your-auth-service.com/api
```

4. Run the development server:

```bash
pnpm run dev
```

### Setting up the Backend Service

If you don't have any backend service available, you can use backend app I have built in my [Secure Auth](https://github.com/ifindev/secure-authentication/tree/feat/return-refresh-token) project. Here's how you can set it up:

1. Clone the repository:

```bash
git clone https://github.com/ifindev/secure-authentication
```

2. Checkout to the `feat/return-refresh-token` branch:

```bash
git pull

git checkout feat/return-refresh-token
```

On this branch, I have disabled setting up `refreshToken` in `HttpOnly` cookie. This simulate authentication systems that returns both `accessToken` and `refreshToken` as plain object. The Next.js app will handle setting up both JWT Tokens to `HttpOnly` cookie.

3. Checkout to `/server` directory, install all dependencies

```bash
cd server/

npm install
```

Then follow intructions on setting up the `.env` variables on that repository.

4. Start the development server by running:

```bash
npm run dev
```

## Authentication Implementation

The implementation uses an external authentication backend service for JWT token management. The Next.js application uses a repository pattern to communicate with this backend service, which handles token generation, validation, and refreshing.

### How It Works

1. User logs in with credentials through a Next.js server action
2. The server action sends the credentials to the external authentication API
3. Upon successful authentication, the API returns access and refresh tokens
4. Tokens are stored in HTTP-only cookies by the Next.js server action
5. The Middleware checks if the access token is valid (not expired) on each request
6. If the access token is expired, the middleware attempts to refresh it using the refresh token
7. When refreshing, the middleware calls the external backend's refresh endpoint
8. When the user logs out, both tokens are invalidated via the external backend and removed from `HttpOnly` cookie by Next.js server action

### Architecture

```
┌─────────────┐     ┌────────────┐      ┌─────────────────┐
│ Next.js App │     │ Next.js    │      │ Authentication  │
│ (Client)    │────>│ Middleware │─────>│ Backend Service │
└─────────────┘     └────────────┘      └─────────────────┘
      │                   ↑                      ↑
      │                   │                      │
      │           checks token validity   provides tokens
      │                   │                      │
      │              ┌────────────┐              │
      └──────────────┤ Server     │──────────────┘
                     │ Actions    │
                     └────────────┘
```

### Sequence Diagram

```
┌──────┐              ┌──────────┐         ┌────────────┐        ┌──────────────┐
│Client│              │Middleware│         │Next.js API │        │Auth Backend  │
└──┬───┘              └────┬─────┘         └─────┬──────┘        └──────┬───────┘
   │                       │                     │                      │
   │ 1. Request Protected  │                     │                      │
   │    Page               │                     │                      │
   │──────────────────────>|                     │                      │
   │                       │                     │                      │
   │                       │ 2. Check Token Age  │                      │
   │                       │───────────────────────────────────────────>│
   │                       │                     │                      │
   │                       │ 3. If Expired,      │                      │
   │                       │    Refresh Token    │                      │
   │                       │───────────────────────────────────────────>│
   │                       │                     │                      │
   │                       │ 4. New Tokens       │                      │
   │                       │<───────────────────────────────────────────│
   │                       │                     │                      │
   │ 5. Redirect or Allow  │                     │                      │
   │<──────────────────────|                     │                      │
   │                       │                     │                      │
   │ 6. Login Request      │                     │                      │
   │─────────────────────────────────────────────>                      │
   │                       │                     │                      │
   │                       │                     │ 7. Auth Request      │
   │                       │                     │─────────────────────>│
   │                       │                     │                      │
   │                       │                     │ 8. Return Tokens     │
   │                       │                     │<─────────────────────│
   │                       │                     │                      │
   │ 9. Set Cookies &      |                     |                      |
   |    Redirect           │                     │                      |
   │<─────────────────────────────────────────────                      │
   │                       │                     │                      │
```

### Implementation Details

The JWT authentication with external backend implementation consists of the following components:

#### 1. Authentication Repository

An abstraction layer that communicates with the backend service:

```typescript
// src/libs/auth/repository/auth.repository.impl.ts
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
```

#### 2. HTTP Client

Handles API requests with automatic token inclusion and refresh:

```typescript
// src/clients/http/base-http.client.ts (simplified)
export class BaseHttpClient implements IHttpClient {
    baseUrl: string;
    headers?: Record<string, string>;

    constructor(config: BaseHttpClientConfig) {
        this.baseUrl = config.baseUrl ?? '';
        this.headers = config.headers ?? {};
    }

    async getBearerToken(): Promise<string> {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get(COOKIE_NAME.ACCESS_TOKEN)?.value ?? '';
        return `Bearer ${accessToken}`;
    }

    private async buildHeaders(
        headers: Record<string, string> = {},
    ): Promise<Record<string, string>> {
        const cookieStore = await cookies();
        const bearerToken = await this.getBearerToken();
        return {
            ...this.getDefaultHeaders(),
            ...this.headers,
            ...headers,
            Cookie: cookieStore.toString(),
            Authorization: bearerToken,
        };
    }

    async makeRequest<T>(url: string, config: RequestInit): Promise<T> {
        const headers = await this.buildHeaders(config.headers as Record<string, string>);
        // Full request implementation...
    }

    // HTTP method implementations (get, post, etc.)
}

const httpClient = new BaseHttpClient({
    baseUrl: process.env.BACKEND_API_URL ?? '',
});
```

#### 3. Token Expiration Checking

Uses JWT decoding to check expiration without verification:

```typescript
// src/utils/jwt.util.ts
import { jwtDecode } from 'jwt-decode';
import { SECOND } from '@/constants/time.constant';

export function getTokenExpiryTime(token: string): number {
    const decoded = jwtDecode<{ exp: number }>(token);
    return decoded.exp;
}

export function isTokenExpired(token: string): boolean {
    const exp = getTokenExpiryTime(token);
    const now = new Date().getTime() / SECOND;
    return exp < now;
}
```

#### 4. Auth Status Middleware

Verifies token validity and handles refreshing:

```typescript
// src/middlewares/auth-status.middleware.ts
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import {
    COOKIE_NAME,
    accessTokenCookieOptions,
    refreshTokenCookieOptions,
} from '@/constants/cookie.constant';
import { isTokenExpired } from '@/utils/jwt.util';
import authRepository from '@/libs/auth/repository/auth.repository.impl';

type AuthStatus = { status: 'authenticated' } | { status: 'unauthenticated' };

export default async function getAuthStatus(request: NextRequest): Promise<AuthStatus> {
    const accessToken = request.cookies.get(COOKIE_NAME.ACCESS_TOKEN)?.value;
    const refreshToken = request.cookies.get(COOKIE_NAME.REFRESH_TOKEN)?.value;

    // Check if access token exists and not expired
    if (accessToken && !isTokenExpired(accessToken)) {
        return { status: 'authenticated' };
    }

    // If no refresh token or it's expired, user is unauthenticated
    if (!refreshToken || isTokenExpired(refreshToken)) {
        return { status: 'unauthenticated' };
    }

    // Try to refresh the token
    try {
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            await authRepository.refreshToken();

        const cookieStore = await cookies();

        // Set new cookies
        cookieStore.set(COOKIE_NAME.ACCESS_TOKEN, newAccessToken, accessTokenCookieOptions);
        cookieStore.set(COOKIE_NAME.REFRESH_TOKEN, newRefreshToken, refreshTokenCookieOptions);

        return { status: 'authenticated' };
    } catch (error) {
        console.error('Token refresh failed:', error);
        return { status: 'unauthenticated' };
    }
}
```

#### 5. Auth Middleware

Protects routes using the auth status:

```typescript
// src/middlewares/auth.middleware.ts
import { NextRequest, NextResponse } from 'next/server';

import checkRoute from '@/middlewares/check-route.middleware';
import getAuthStatus from '@/middlewares/auth-status.middleware';

export default async function authMiddleware(request: NextRequest) {
    const { isPublicRoute } = checkRoute(request);

    const authStatus = await getAuthStatus(request);

    // Handle public routes - redirect authenticated users to home
    if (isPublicRoute && authStatus.status === 'authenticated') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Handle protected routes - redirect unauthenticated users to login
    if (!isPublicRoute && authStatus.status === 'unauthenticated') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Allow the request to proceed
    return NextResponse.next();
}
```

#### 6. Server Actions

Handle login/logout with the external backend:

```typescript
// src/actions/auth.action.ts
'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

import authRepository from '@/libs/auth/repository/auth.repository.impl';
import {
    accessTokenCookieOptions,
    COOKIE_NAME,
    refreshTokenCookieOptions,
} from '@/constants/cookie.constant';

export async function loginAction(_prevState: unknown, formData: FormData) {
    try {
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;

        if (!username || !password) {
            throw new Error('Username and password are required');
        }

        // Call authentication API through repository
        const { accessToken, refreshToken } = await authRepository.login({
            username,
            password,
        });

        // Set cookies
        const cookieStore = await cookies();
        cookieStore.set(COOKIE_NAME.ACCESS_TOKEN, accessToken, accessTokenCookieOptions);
        cookieStore.set(COOKIE_NAME.REFRESH_TOKEN, refreshToken, refreshTokenCookieOptions);
    } catch (error) {
        console.error('Login Action Error:', error);
        return {
            message: `Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            status: 'error',
        };
    }

    redirect('/');
}

export async function logoutAction() {
    try {
        // Clear cookies
        const cookieStore = await cookies();
        cookieStore.delete(COOKIE_NAME.ACCESS_TOKEN);
        cookieStore.delete(COOKIE_NAME.REFRESH_TOKEN);

        // Notify backend of logout
        await authRepository.logout();

        redirect('/login');
    } catch (error) {
        console.error('Logout Action Error:', error);
        redirect('/');
    }
}
```

#### 7. Constants and Cookie Configuration

Cookie settings for tokens:

```typescript
// src/constants/cookie.constant.ts
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

export const COOKIE_NAME = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
};

export const accessTokenCookieOptions: Partial<ResponseCookie> = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 15 * 60, // 15 minutes in seconds
};

export const refreshTokenCookieOptions: Partial<ResponseCookie> = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
};
```

## Usage

### Login

```typescript
// In a form component
'use client';
import { loginAction } from '@/actions/auth.action';
import { useFormState } from 'react-dom';

export default function LoginForm() {
  const [state, formAction] = useFormState(loginAction, {});

  return (
    <form action={formAction}>
      <div>
        <label htmlFor="username">Username</label>
        <input id="username" name="username" type="text" required />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required />
      </div>
      {state.status === 'error' && <p className="error">{state.message}</p>}
      <button type="submit">Login</button>
    </form>
  );
}
```

### Logout

```typescript
// In a component
'use client';
import { logoutAction } from '@/actions/auth.action';

export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button type="submit">Logout</button>
    </form>
  );
}
```

### Get User Information

```typescript
// In a server component
import authRepository from '@/libs/auth/repository/auth.repository.impl';

export default async function UserProfile() {
  const user = await authRepository.getUser();

  return (
    <div>
      <h1>User Profile</h1>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      {/* Other user information */}
    </div>
  );
}
```

### Protected Route

```typescript
// In middleware.ts
import { NextRequest } from 'next/server';
import authMiddleware from './middlewares/auth.middleware';

export async function middleware(request: NextRequest) {
    return authMiddleware(request);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
```

## Security Best Practices

This project implements several security best practices:

1. **HTTP-Only Cookies**: Prevents JavaScript access to sensitive cookies, protecting against XSS attacks
2. **Secure Flag**: Ensures cookies are only sent over HTTPS in production environments
3. **SameSite Policy**: Set to 'strict' to protect against CSRF attacks
4. **Short-lived Access Tokens**: Access tokens have a short lifetime (e.g., 15 minutes) to minimize the impact of token theft
5. **Token Refresh Mechanism**: Uses refresh tokens to obtain new access tokens without requiring re-authentication
6. **Error Handling**: Uses non-revealing error messages to prevent information leakage
7. **Repository Pattern**: Abstracts authentication logic for better maintainability and security
8. **Token Validation by Expiration**: Checks token expiration time to avoid unnecessary network calls
9. **Authorization Headers**: Includes bearer tokens for backend API communication

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under MIT license.

Copyright (c) 2025 - Muhammad Arifin
