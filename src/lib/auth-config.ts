import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/mongodb";
import { Customer } from "@/lib/models/Customer";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const nextAuthSecret = process.env.NEXTAUTH_SECRET;

if (!googleClientId || !googleClientSecret || !nextAuthSecret) {
  // We don't throw here to avoid crashing the build if env vars are missing during CI, 
  // but we should log it.
  console.warn("Missing required auth env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET");
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: googleClientId || "",
      clientSecret: googleClientSecret || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      console.log("[AUTH_DEBUG] signIn callback triggered");
      if (account?.provider === "google") {
        try {
          await connectDB();
          const email = user.email?.toLowerCase().trim();
          if (!email) return false;

          let existingUser = await Customer.findOne({ email });
          if (!existingUser) {
            console.log("[AUTH_DEBUG] Creating new customer from Google account");
            await Customer.create({
              email,
              name: user.name || email.split("@")[0],
              password: `google_${Math.random().toString(36).slice(-10)}`,

              address: "Pending details",
            });
          }
          return true;
        } catch (error) {
          console.error("[AUTH_DEBUG] Google signIn error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session }) {
      if (session.user && session.user.email) {
        try {
          await connectDB();
          const dbUser = await Customer.findOne({ email: session.user.email.toLowerCase().trim() });
          if (dbUser) {
            (session.user as any).id = dbUser._id.toString();

            (session.user as any).address = dbUser.address || "Pending details";
          }
        } catch (error) {
          console.error("[AUTH_DEBUG] Session callback sync error:", error);
        }
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/",
  },
  secret: nextAuthSecret,
};
