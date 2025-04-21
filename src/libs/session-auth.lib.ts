import { JWTPayload, SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const key = new TextEncoder().encode(process.env.SECRET_KEY);

export async function encrypt(payload: JWTPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(key);
}

export async function decrypt(input: string) {
    const { payload } = await jwtVerify(input, key, {
        algorithms: ['HS256'],
    });
    return payload;
}

export async function login(formData: FormData) {
    // get email and password from form data
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // TODO: implement get user by email
    const user = {
        id: '1',
        email,
        name: 'Test User',
    };

    // creates the session expires in 1 hour
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    const session = await encrypt({
        user,
        expires,
    });

    // sets the session cookie
    (await cookies()).set('session', session, {
        expires,
        httpOnly: true,
    });
}

export async function logout() {
    // destroys the session cookie
    (await cookies()).delete('session');
}

export async function getSession() {
    const session = (await cookies()).get('session')?.value;
    if (!session) return null;

    return await decrypt(session);
}

export async function updateSession(request: NextRequest) {
    const session = request.cookies.get('session')?.value;
    if (!session) return null;

    // Refresh the session if it's about to expire
    const parsed = await decrypt(session);
    parsed.expires = new Date(Date.now() + 60 * 60 * 1000);
    const res = NextResponse.next();
    res.cookies.set({
        name: 'session',
        value: await encrypt(parsed),
        expires: parsed.expires as Date,
        httpOnly: true,
    });

    return res;
}
