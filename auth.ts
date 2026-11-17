import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { read } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const getAdminEmails = (): string[] => {
  const envEmails = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL;
  return envEmails
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  providers: [
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
      ? [
        GitHub({
          clientId: process.env.GITHUB_ID,
          clientSecret: process.env.GITHUB_SECRET,
        }),
      ]
      : []),
    Credentials({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);

        const foundUsers = await read((db) =>
          db.select().from(users).where(eq(users.email, email)).limit(1)
        );

        if (foundUsers.length === 0) {
          const envAdminEmail = (process.env.ADMIN_EMAIL).toLowerCase().trim();
          const envAdminPass = process.env.ADMIN_PASSWORD;

          if (email === envAdminEmail && password === envAdminPass) {
            return {
              id: "env-admin",
              email: envAdminEmail,
              name: "Admin",
              role: "admin",
            };
          }
          return null;
        }

        const user = foundUsers[0];
        if (!user.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name || "Admin",
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }) {
      if (!user?.email) return false;
      const allowed = getAdminEmails();
      // Whitelist authorization check: only specified emails can log in to admin
      const isAllowed = allowed.includes(user.email.toLowerCase().trim());
      return isAllowed;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || "admin";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
});
