import { NextResponse } from "next/server";

export function middleware(req: Request) {
  const hasJWT = req.headers.get("cookie")?.includes("jwt=");

  if (!hasJWT && req.url.includes("/create-book")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/create-book/:path*", "/admin/:path*", "/dashboard/:path*"],
};
