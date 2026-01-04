import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Runtime presence check (non-sensitive): log availability/length only
try {
  const hasSecret = !!process.env.NEXTAUTH_SECRET;
  const secretLen = process.env.NEXTAUTH_SECRET
    ? process.env.NEXTAUTH_SECRET.length
    : 0;
  const hasDb = !!process.env.DATABASE_URL;
  const dbLen = process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0;
  console.info("[runtime-debug] NEXTAUTH_SECRET present:", hasSecret, "len=", secretLen);
  console.info("[runtime-debug] DATABASE_URL present:", hasDb, "len=", dbLen);
} catch (e) {
  // ignore in environments that restrict console
}
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Try to find regular user first
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { profile: true, wallet: true },
          });

          if (user && user.password) {
            const isValid = await bcrypt.compare(credentials.password, user.password);

            if (isValid) {
              return {
                id: user.id,
                email: user.email,
                role: user.role,
                verifiedStatus: user.verifiedStatus,
              };
            }
          }

          // If not found, try admin user
          const adminUser = await prisma.adminUser.findUnique({
            where: { email: credentials.email },
          });

          if (adminUser && adminUser.password) {
            const isValid = await bcrypt.compare(credentials.password, adminUser.password);

            if (isValid) {
              return {
                id: adminUser.id,
                email: adminUser.email,
                role: `ADMIN_${adminUser.role}`, // Prefix with ADMIN_ to distinguish
                verifiedStatus: 'APPROVED', // Admin is always approved
              };
            }
          }

          return null;
        } catch (error) {
          console.error("Auth error:", error);
          // Return null on error to prevent exposing database errors
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (!existingUser) {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.verifiedStatus = user.verifiedStatus;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.verifiedStatus = token.verifiedStatus as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  // CRITICAL: NextAuth requires secret in production
  // This must be set in Vercel Environment Variables
  secret: (() => {
    const secret = process.env.NEXTAUTH_SECRET;
    
    // In production/Vercel, secret is REQUIRED
    if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
      if (!secret) {
        const errorMsg = "[AUTH-CONFIG] ❌ NEXTAUTH_SECRET is MISSING in production!";
        console.error(errorMsg);
        console.error("[AUTH-CONFIG] Please add NEXTAUTH_SECRET to Vercel Environment Variables");
        throw new Error("NEXTAUTH_SECRET is required in production");
      }
      if (secret.length < 32) {
        const errorMsg = `[AUTH-CONFIG] ❌ NEXTAUTH_SECRET is too short (${secret.length} chars, need 32+)`;
        console.error(errorMsg);
        throw new Error("NEXTAUTH_SECRET must be at least 32 characters");
      }
      console.info(`[AUTH-CONFIG] ✅ NEXTAUTH_SECRET found (${secret.length} chars)`);
    }
    
    return secret || "development-secret-min-32-chars-please-change-in-production";
  })(),
  debug: process.env.NODE_ENV === "development",
};
// force rebuild auth config

