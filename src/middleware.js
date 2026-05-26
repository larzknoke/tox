import { NextResponse } from "next/server";
import {
  AUTH_REQUIRED_PREFIXES,
  CONSENT_ACCEPTED_VALUE,
  CONSENT_COOKIE,
  CONSENT_REQUIRED_PREFIXES,
} from "@/lib/consent";

function matchesPrefix(pathname, prefixes) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function middleware(request) {
  const pathname = request.nextUrl.pathname;

  const consentAccepted =
    request.cookies.get(CONSENT_COOKIE)?.value === CONSENT_ACCEPTED_VALUE;

  if (matchesPrefix(pathname, CONSENT_REQUIRED_PREFIXES) && !consentAccepted) {
    const homeUrl = new URL("/", request.url);
    homeUrl.searchParams.set("consentRequired", "1");
    homeUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(homeUrl);
  }

  if (!matchesPrefix(pathname, AUTH_REQUIRED_PREFIXES)) {
    return NextResponse.next();
  }

  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  if (!sessionToken) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
