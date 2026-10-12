import { NextResponse, type NextRequest } from "next/server";

/**
 * Guarantees every visitor has a stable guest workspace id, so QR codes created
 * before signing up can be claimed into an account later.
 */
export function middleware(request: NextRequest) {
  const existing = request.cookies.get("altech_ws")?.value;
  if (existing && existing.length >= 8) return NextResponse.next();

  const response = NextResponse.next();
  const fresh = `ws_${crypto.randomUUID().replace(/-/g, "")}`;
  response.cookies.set("altech_ws", fresh, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)"],
};
