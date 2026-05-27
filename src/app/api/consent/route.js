import { NextResponse } from "next/server";
import { CONSENT_ACCEPTED_VALUE, CONSENT_COOKIE } from "@/lib/consent";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const accepted = Boolean(body?.accepted);

  if (!accepted) {
    return NextResponse.json(
      { error: "Consent not accepted" },
      { status: 400 },
    );
  }

  const response = NextResponse.json({ accepted: true });
  response.cookies.set(CONSENT_COOKIE, CONSENT_ACCEPTED_VALUE, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
