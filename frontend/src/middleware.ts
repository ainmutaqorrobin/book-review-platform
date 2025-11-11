import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_PROTECTED = ["/create-book", "/dashboard", "/books"];

const ADMIN_PROTECTED = ["/admin"];

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { pathname } = url;
  const token = req.cookies.get("jwt");

  // Require login
  if (AUTH_PROTECTED.some((route) => pathname.startsWith(route))) {
    if (!token) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // Require admin (optional)
  if (ADMIN_PROTECTED.some((route) => pathname.startsWith(route))) {
    // redirect if no token
    if (!token) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/create-book/:path*", "/dashboard/:path*", "/admin/:path*"],
};
