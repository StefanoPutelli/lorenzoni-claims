import { NextResponse, type NextRequest } from "next/server";
import {jwtVerify, type JWTPayload} from 'jose';


const SECRET_KEY = process.env.LOGIN_SECRET_KEY|| "secret";
export async function middleware(req: NextRequest) {
    const { pathname } = new URL(req.url);
    if (pathname.startsWith("/api")) {

        if (pathname === "/api/login") {
            return NextResponse.next();
        }

        const token = req.headers.get("authorization") || "";
        try {
            const { payload } = await jwtVerify(token, new TextEncoder().encode(SECRET_KEY));
            return NextResponse.next();
        } catch (error) {
            console.error(error);
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }
    }
    return NextResponse.next();
}