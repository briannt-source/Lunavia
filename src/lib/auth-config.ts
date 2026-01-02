import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

