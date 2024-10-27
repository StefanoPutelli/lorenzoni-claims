import {SignJWT, jwtVerify, type JWTPayload} from 'jose';
import { NextRequest, NextResponse } from 'next/server';

const SECRET_KEY = process.env.LOGIN_SECRET_KEY || 'secret';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const password = searchParams.get('password');
    if (username === process.env.LOGIN_USERNAME && password === process.env.LOGIN_PASSWORD) {
        const token = await new SignJWT({ username })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('1h')
            .sign(new TextEncoder().encode(SECRET_KEY));
        return NextResponse.json({ token }, { status: 200 });
    }

    return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
}

export async function POST(request: NextRequest) {
    const { token } = await request.json();
    try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(SECRET_KEY));
        return NextResponse.json({ username: payload.username }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
}