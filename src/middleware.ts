import { NextRequest, NextResponse } from "next/server";

function isAuthorized(header: string | null, username: string, password: string) {
  const expected = `Basic ${btoa(`${username}:${password}`)}`;
  if (!header?.startsWith("Basic ") || header.length !== expected.length) return false;
  let mismatch = 0;
  for (let index = 0; index < header.length; index += 1) mismatch |= header.charCodeAt(index) ^ expected.charCodeAt(index);
  return mismatch === 0;
}

export function middleware(request: NextRequest) {
  const username = process.env.DASHBOARD_AUTH_USERNAME;
  const password = process.env.DASHBOARD_AUTH_PASSWORD;

  // Fail closed in production until both server-side credentials are configured.
  if (!username || !password) return new NextResponse("Dashboard access is not configured.", { status: 503 });
  if (isAuthorized(request.headers.get("authorization"), username, password)) return NextResponse.next();

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="KOSIGN Ads Reporting", charset="UTF-8"' },
  });
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
