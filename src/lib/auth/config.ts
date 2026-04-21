import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export const authConfig: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true, // Required for NextAuth v5
  // Adapter is optional with JWT sessions, but we use it for user management
  // Remove adapter if you continue to have issues - credentials provider works without it
  adapter: DrizzleAdapter(db, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    usersTable: schema.users as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    accountsTable: schema.accounts as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sessionsTable: schema.sessions as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    verificationTokensTable: schema.verificationTokens as any,
  }),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const user = await db.query.users.findFirst({
            where: eq(schema.users.email, credentials.email as string),
          });

          if (!user || !user.password) {
            return null;
          }

          // Check if user is deactivated - prevent login
          if (user.deactivated) {
            // Throw a specific error that we can catch in the login page
            throw new Error("ACCOUNT_DEACTIVATED");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name || undefined,
            role: user.role || "user",
          };
        } catch (error) {
          if (error instanceof Error && error.message === "ACCOUNT_DEACTIVATED") {
            throw error;
          }
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.role = (user as any).role || "user";
      }
      
      // Check if user is still active (on every request, not just updates)
      if (token.id) {
        try {
          const userId = parseInt(token.id as string);
          const currentUser = await db.query.users.findFirst({
            where: eq(schema.users.id, userId),
            columns: {
              deactivated: true,
            },
          });
          
          // If user is deactivated, invalidate the token
          if (currentUser?.deactivated) {
            return null; // This will effectively log out the user
          }
        } catch (error) {
          console.error("Error checking user status:", error);
          // On error, allow the token to continue (fail open for availability)
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      // If token is null (user was deactivated), invalidate session
      // The user will be redirected to login, and we can check for deactivation there
      if (!token) {
        return null as unknown as typeof session;
      }
      
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = (token.role as string) || "user";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
