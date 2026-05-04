import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CUSTOMER_TOKEN_COOKIE } from "@/lib/customer-constants";
import { getJwtSecret } from "@/lib/jwt-secret";

export async function jsonWithCustomerSession(
  customerId: string,
  phone: string
): Promise<NextResponse> {
  const token = await new SignJWT({
    sub: customerId,
    p: phone,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(getJwtSecret());

  const res = NextResponse.json({ ok: true, customerId, phone });
  res.cookies.set(CUSTOMER_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

export async function getCustomerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_TOKEN_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return {
      customerId: payload.sub as string,
      phone: payload.p as string,
    };
  } catch {
    return null;
  }
}

export async function isCustomerSession() {
  const session = await getCustomerSession();
  return !!session;
}
