import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_AUTH_ROUTES = new Set(["/login", "/signup"]);

function isProtectedRoute(pathname: string) {
  return pathname === "/create-book" || /^\/books\/[^/]+\/edit$/.test(pathname);
}

export function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { pathname } = url;
  const token = req.cookies.get("jwt")?.value;

  if (isProtectedRoute(pathname) && !token) {
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (PUBLIC_AUTH_ROUTES.has(pathname) && token) {
    url.pathname = "/books";
    url.searchParams.delete("next");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
