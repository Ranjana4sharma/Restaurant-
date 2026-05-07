import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CUSTOMER_TOKEN_COOKIE } from "@/lib/customer-constants";
import { getJwtSecret } from "@/lib/jwt-secret";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { connectDB } from "@/lib/mongodb";
import { Customer } from "@/lib/models/Customer";

export async function jsonWithCustomerSession(
  customerId: string,
  email: string
): Promise<NextResponse> {
  const token = await new SignJWT({
    sub: customerId,
    e: email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(getJwtSecret());

  const res = NextResponse.json({ ok: true, customerId, email });
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

  // 1. Check for custom JWT token first
  if (token) {
    try {
      const { payload } = await jwtVerify(token, getJwtSecret());
      return {
        customerId: payload.sub as string,
        email: (payload.e as string) || "",
      };
    } catch {
      // Token invalid, fall through to NextAuth check
    }
  }

  // 2. Check for NextAuth session
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      await connectDB();
      const customer = await Customer.findOne({ email: session.user.email.toLowerCase().trim() });
      if (customer) {
        return {
          customerId: customer._id.toString(),
          email: customer.email,
        };
      }
    }
  } catch (error) {
    console.error("[AUTH_DEBUG] Error checking NextAuth session in getCustomerSession:", error);
  }

  return null;
}

export async function isCustomerSession() {
  const session = await getCustomerSession();
  return !!session;
}
