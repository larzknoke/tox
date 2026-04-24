import { NextResponse } from "next/server";
import { SUPPORTED_LOCALES, LOCALE_COOKIE } from "@/lib/i18n";

export async function POST(request) {
  const { locale } = await request.json();

  if (!SUPPORTED_LOCALES.includes(locale)) {
    return NextResponse.json({ error: "Unsupported locale" }, { status: 400 });
  }

  const response = NextResponse.json({ locale });
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
    httpOnly: false, // must be readable client-side for optimistic UI
  });
  return response;
}
