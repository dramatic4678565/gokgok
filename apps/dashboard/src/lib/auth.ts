import CredentialsProvider from "next-auth/providers/credentials";

import { authSecret } from "@/lib/auth-secret";

import type { NextAuthOptions } from "next-auth";

/**
 * Mosaic ships without an identity provider, so the dashboard authenticates
 * against a credentials provider that accepts any well-formed email. It exists
 * so `useSession()` is real — the session gates the dashboard routes and backs
 * the UserMenu — not to model a real sign-up flow.
 *
 * Swapping in a real provider means replacing the single entry in `providers`
 * and leaving every consumer of `useSession()` untouched.
 */
export const authOptions: NextAuthOptions = {
  secret: authSecret,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Mosaic",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@company.com" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        if (!email || !email.includes("@")) {
          return null;
        }

        const localPart = email.split("@")[0] ?? "member";

        return {
          id: "demo-user",
          name: localPart
            .split(/[._-]+/)
            .filter(Boolean)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" "),
          email,
          image: null,
        };
      },
    }),
  ],
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};
