import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth";

/**
 * NextAuth.js instance
 * Exported for use in server components and middleware
 */
export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);

/**
 * Type-safe session getter
 * Use in server components: const session = await getSession();
 */
export async function getSession() {
  return auth();
}
