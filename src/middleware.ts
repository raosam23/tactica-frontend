import { NextResponse, NextRequest } from "next/server";

const middleware = (request: NextRequest) => {
    const token = request.cookies.get("token")?.value;
    const pathName = request.nextUrl.pathname;

    const isProtectedRoute = pathName.startsWith("/chat");
    const isAuthRoute = pathName === "/login" || pathName === "/register";

    if (!token && isProtectedRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (token && isAuthRoute) {
        return NextResponse.redirect(new URL("/chat", request.url));
    }
    return NextResponse.next();
};

export const config = {
    matcher: ["/chat/:path*", "/login", "/register"],
};

export default middleware;
