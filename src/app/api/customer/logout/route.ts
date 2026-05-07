import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CUSTOMER_TOKEN_COOKIE } from "@/lib/customer-constants";

export async function POST() {
  console.log("Logout API route hit");
  const response = NextResponse.json({ ok: true });
  
  // Clear the cookie
  response.cookies.set(CUSTOMER_TOKEN_COOKIE, "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}
