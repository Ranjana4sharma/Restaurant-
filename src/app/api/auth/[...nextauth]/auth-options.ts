import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/mongodb";
import { Customer } from "@/lib/models/Customer";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const nextAuthSecret = process.env.NEXTAUTH_SECRET;

if (!googleClientId || !googleClientSecret || !nextAuthSecret) {
  throw new Error(
    "Missing required auth env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET"
  );
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("[AUTH_DEBUG] signIn callback triggered");
      console.log("[AUTH_DEBUG] Account provider:", account?.provider);
      console.log("[AUTH_DEBUG] User from provider:", user.email, user.name);

      if (account?.provider === "google") {
        try {
          await connectDB();
          const email = user.email?.toLowerCase().trim();
          if (!email) {
            console.error("[AUTH_DEBUG] No email found in Google profile");
            return false;
          }

          let existingUser = await Customer.findOne({ email });
          console.log("[AUTH_DEBUG] Existing user check:", !!existingUser);
          
          if (!existingUser) {
            console.log("[AUTH_DEBUG] Creating new customer from Google account");
            existingUser = await Customer.create({
              email,
              name: user.name || email.split("@")[0],
              password: `google_${Math.random().toString(36).slice(-10)}`, // Secure placeholder
              phone: "", 
              address: "Pending details",
            });
            console.log("[AUTH_DEBUG] Customer created successfully:", existingUser._id);
          } else {
            console.log("[AUTH_DEBUG] Customer found in DB:", existingUser._id);
          }
          return true;
        } catch (error) {
          console.error("[AUTH_DEBUG] Google signIn error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("[AUTH_DEBUG] session callback triggered for:", session.user?.email);
      if (session.user && session.user.email) {
        try {
          await connectDB();
          const dbUser = await Customer.findOne({ email: session.user.email.toLowerCase().trim() });
          if (dbUser) {
            console.log("[AUTH_DEBUG] Syncing session with DB user:", dbUser._id);
            (session.user as any).id = dbUser._id.toString();
            (session.user as any).phone = dbUser.phone || "";
            (session.user as any).address = dbUser.address || "Pending details";
          } else {
            console.warn("[AUTH_DEBUG] session user not found in DB:", session.user.email);
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/",
  },
  secret: nextAuthSecret,
};
