import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export const middleware = async (request: NextRequest) => {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    const { pathname } = request.nextUrl;

    // Allow request if token exists
    // OR it is request for NextAuth session & provider
    // OR it is request to '_/next' (Next.js static files)

    if (
        token ||
        pathname.includes('/api/auth') ||
        pathname.includes('/_next')
    ) {
        if (pathname === '/login') {
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }

    if (!token && pathname !== '/login') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
};
