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
  // Note: During build, env vars might not be available, so we use fallback
  // NextAuth will validate at runtime and throw NO_SECRET if missing in production
  secret: process.env.NEXTAUTH_SECRET || (() => {
    // During build time, env vars might not be injected yet
    // We return a fallback to allow build to complete
    // NextAuth will validate at runtime and throw NO_SECRET if secret is missing in production
    const isBuildTime = process.env.NEXT_PHASE === "phase-production-build";
    if (isBuildTime) {
      // During build, return fallback to allow build to complete
      return "build-time-fallback-secret-nextauth-will-validate-at-runtime";
    }
    // At runtime, if still no secret, NextAuth will handle the error
    return undefined;
  })(),
  debug: process.env.NODE_ENV === "development",
};
// force rebuild auth config

