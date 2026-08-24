import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@captureflow/admin";

// A POST route rather than a server action so the header's sign-out form works
// from any page without importing an action into the layout.
export async function POST(request: Request) {
  (await cookies()).delete(ADMIN_COOKIE);
  return NextResponse.redirect(new URL("/login", request.url), 303);
}
