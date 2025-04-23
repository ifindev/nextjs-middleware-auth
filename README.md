# Next.js Authentication Example

This project demonstrates two authentication approaches in Next.js using the App Router: **Session-based Authentication** and **JWT Authentication**. Both implementations follow security best practices and provide protection for routes in a Next.js application.

On this application, authentication is handled with Next.js server actions. No external backend service, since this is the simplest showcase of how you can implement a basic secure authentication in Next.js without additional authentication libraries.

For detailed real-production ready implementation that connects with Backend service, you can checkout to the `feat/jwt-auth-external-api` branch. It has a major refactored authentication implementations with:

- external backend service
- layered architecture following clean architecture approach
- jwt-based authentication focus

You can also check that branch by going to this URL https://github.com/ifindev/nextjs-middleware-auth/tree/feat/jwt-auth-external-api. If you want to check the code on web, just open the web editor via this URL https://github.dev/ifindev/nextjs-middleware-auth/tree/feat/jwt-auth-external-api.

Have fun!

## Table of Contents

- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Authentication Implementations](#authentication-implementations)
    - [Session-based Authentication](#session-based-authentication)
    - [JWT Authentication](#jwt-authentication)
- [Usage](#usage)
- [Security Best Practices](#security-best-practices)
- [Contributing](#contributing)

## Introduction

This project showcases how to implement secure authentication in a Next.js application using two popular approaches:

1. **Session-based Authentication**: Uses server-side sessions stored in HTTP-Only cookie
2. **JWT-based Authentication**: Uses JSON Web Tokens with access and refresh token mechanisms both stored in HTTP-Only cookies

You can easily switch between these two authentication methods based on your project's requirements.

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

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
SECRET_KEY=your_secret_key_for_session
JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
```

4. Run the development server:

```bash
pnpm run dev
```

## Authentication Implementations

### Session-based Authentication

Session-based authentication uses server-side sessions managed through cookies. When a user logs in, the server creates a session and sends a cookie with a session identifier to the client.

#### How It Works

1. User logs in with credentials
2. Server verifies credentials and creates a session
3. Session ID is stored in an HTTP-only cookie
4. On subsequent requests, the server validates the session ID
5. When the user logs out, the server invalidates the session

#### Sequence Diagram

```
┌──────┐                  ┌──────────┐               ┌──────────┐
│Client│                  │Middleware│               │Server    │
└──┬───┘                  └────┬─────┘               └────┬─────┘
   │                           │                          │
   │ 1. Request Protected Page │                          │
   │─────────────────────────->│                          │
   │                           │                          │
   │                           │ 2. Check Session Cookie  │
   │                           │─────────────────────────>│
   │                           │                          │
   │                           │ 3. Session Valid/Invalid │
   │                           │<─────────────────────────│
   │                           │                          │
   │ 4. Redirect or Allow      │                          │
   │<─────────────────────────-│                          │
   │                           │                          │
   │ 5. Login Request          │                          │
   │─────────────────────────────────────────────────────>│
   │                           │                          │
   │                           │                          │ 6. Verify Credentials
   │                           │                          │──────────────────┐
   │                           │                          │<─────────────────┘
   │                           │                          │
   │ 7. Set Session Cookie     │                          │
   │<─────────────────────────────────────────────────────│
   │                           │                          │
   │ 8. Request Logout         │                          │
   │─────────────────────────────────────────────────────>│
   │                           │                          │
   │ 9. Clear Session Cookie   │                          │
   │<─────────────────────────────────────────────────────│
   │                           │                          │
```

#### Implementation Details

The session authentication implementation consists of:

1. **Session Creation**: Using the `login` function in `session-auth.ts` that sets an encrypted session cookie
2. **Session Validation**: Using the `updateSession` function to check and refresh the session
3. **Middleware Protection**: Using `sessionAuthMiddleware` to protect routes

```typescript
// Session middleware
export async function sessionAuthMiddleware(request: NextRequest) {
    const { isPublicRoute, isProtectedRoute } = checkRoute(request);
    const session = await updateSession(request);

    if (isPublicRoute && session) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}
```

#### Pros and Cons

**Pros:**

- Simple implementation
- Server has full control over sessions
- Can invalidate sessions immediately

**Cons:**

- Requires session storage (can be a database, Redis, etc.)
- Not ideal for distributed systems without shared session storage
- Slightly more server overhead

### JWT Authentication

JWT (JSON Web Token) authentication uses signed tokens to verify a user's identity. It employs both access tokens (short-lived) and refresh tokens (longer-lived) to maintain security.

#### How It Works

1. User logs in with credentials
2. Server generates access token and refresh token
3. Tokens are stored in HTTP-only cookies
4. Access token is used for authentication until it expires
5. When the access token expires, the refresh token is used to get a new access token
6. When the user logs out, both tokens are invalidated

#### Sequence Diagram

```
┌──────┐                  ┌──────────┐               ┌──────────┐
│Client│                  │Middleware│               │Server    │
└──┬───┘                  └────┬─────┘               └────┬─────┘
   │                           │                          │
   │ 1. Request Protected Page │                          │
   │─────────────────────────->│                          │
   │                           │                          │
   │                           │ 2. Verify Access Token   │
   │                           │─────────────────────────>│
   │                           │                          │
   │                           │ 3. Token Valid/Invalid   │
   │                           │<─────────────────────────│
   │                           │                          │
   │                           │ 4. If Invalid, Try Refresh Token
   │                           │─────────────────────────>│
   │                           │                          │
   │                           │ 5. New Tokens or Fail    │
   │                           │<─────────────────────────│
   │                           │                          │
   │ 6. Redirect or Allow      │                          │
   │<─────────────────────────-│                          │
   │                           │                          │
   │ 7. Login Request          │                          │
   │─────────────────────────────────────────────────────>│
   │                           │                          │
   │                           │                          │ 8. Verify Credentials
   │                           │                          │──────────────────┐
   │                           │                          │<─────────────────┘
   │                           │                          │
   │ 9. Set Token Cookies      │                          │
   │<─────────────────────────────────────────────────────│
   │                           │                          │
   │ 10. Request Logout        │                          │
   │─────────────────────────────────────────────────────>│
   │                           │                          │
   │ 11. Clear Token Cookies   │                          │
   │<─────────────────────────────────────────────────────│
   │                           │                          │
```

#### Implementation Details

The JWT authentication implementation consists of:

1. **Token Generation**: Using `generateTokens` function to create access and refresh tokens
2. **Token Validation**: Using `verifyAccessToken` and `verifyRefreshToken` functions
3. **Token Refresh**: Using `refreshTokens` to handle token refreshing
4. **Middleware Protection**: Using `jwtAuthMiddleware` to protect routes

```typescript
// JWT middleware (simplified)
export async function jwtAuthMiddleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const isPublicRoute = publicRoutes.includes(path);

    // Get authentication status
    const authStatus = await getAuthStatus(request);

    // Handle public routes - redirect authenticated users to home
    if (isPublicRoute && authStatus.status !== 'unauthenticated') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Handle protected routes - redirect unauthenticated users to login
    if (!isPublicRoute && authStatus.status === 'unauthenticated') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}
```

#### Pros and Cons

**Pros:**

- Stateless authentication
- Good for distributed systems and microservices
- Can include additional user data in the token payload

**Cons:**

- Cannot invalidate tokens before they expire (without additional infrastructure)
- Slightly more complex implementation with refresh tokens
- Token size can increase payload size

## Usage

### Switching Authentication Methods

To switch between authentication methods, modify the `middleware.ts` file:

```typescript
import { NextRequest } from 'next/server';
import { jwtAuthMiddleware } from './middlewares/jwt-auth';
import { sessionAuthMiddleware } from './middlewares/session-auth';

export async function middleware(request: NextRequest) {
    // Use JWT authentication
    return jwtAuthMiddleware(request);

    // Or use Session authentication
    // return sessionAuthMiddleware(request);
}
```

### Protected Routes

All routes except for the ones specified in `publicRoutes` array are protected:

```typescript
const publicRoutes = ['/login', '/register'];
```

To access protected routes, users must be authenticated. Unauthenticated users will be redirected to the login page.

### API Examples

#### Login

```typescript
// Using Session Auth
await sessionLogin(formData);

// Using JWT Auth
await jwtLogin(formData);
```

#### Logout

```typescript
// Using Session Auth
await sessionLogout();

// Using JWT Auth
await jwtLogout();
```

#### Get User Information

```typescript
// Using Session Auth
const session = await getSession();

// Using JWT Auth
const user = await getUserFromCookies();
```

## Security Best Practices

This project implements several security best practices:

1. **HTTP-Only Cookies**: Prevents JavaScript access to sensitive cookies
2. **Secure Flag**: Ensures cookies are only sent over HTTPS in production
3. **SameSite Policy**: Protects against CSRF attacks
4. **Token Expiration**: Short-lived access tokens with refresh mechanisms
5. **CSRF Protection**: Using SameSite cookies
6. **Proper Error Handling**: Non-revealing error messages

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
