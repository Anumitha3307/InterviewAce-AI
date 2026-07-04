import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { z } from "zod";

import { db } from "@/lib/prisma";

/**
 * Credentials validation schema for email/password login
 */
const credentialsSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Main NextAuth configuration
 * Implements:
 * - Prisma adapter for database persistence
 * - Google OAuth provider
 * - Credentials provider for email/password login
 * - JWT session strategy
 * - User callbacks for profile setup
 */
export const authConfig = {
  adapter: PrismaAdapter(db),
  providers: [
    /**
     * Google OAuth Provider
     * Configured via environment variables:
     * - GOOGLE_CLIENT_ID
     * - GOOGLE_CLIENT_SECRET
     */
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      
    }),

    /**
     * Credentials Provider for email/password authentication
     * Uses bcryptjs for password hashing/verification
     */
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "user@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate input
        const parsedCredentials = credentialsSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;

        // Find user in database
        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          return null;
        }

        // Verify password using bcryptjs
        const isPasswordValid = await compare(password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        // Return user object for session
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],

  /**
   * JWT Session Strategy
   * Stores session data in JWT instead of database
   */
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update token daily
  },

  /**
   * JWT encryption configuration
   */
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  /**
   * Callbacks for session and JWT handling
   */
  callbacks: {
    /**
     * JWT callback - called when JWT is created/updated
     * Adds custom claims to token
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }

      // Handle OAuth account linking
     

      return token;
    },

    /**
     * Session callback - called when session is requested
     * Adds JWT claims to session object
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }

      return session;
    },

    /**
     * SignIn callback - called before user is signed in
     * Used for additional validation/logging
     */
    async signIn() {
      // Allow all sign-in attempts
      return true;
    },
  },

  /**
   * Event handlers for logging/monitoring
   */
  

  /**
   * Error handling pages
   */
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
} satisfies NextAuthConfig;
