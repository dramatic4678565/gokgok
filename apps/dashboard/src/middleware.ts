import { withAuth } from "next-auth/middleware";

import { authSecret } from "@/lib/auth-secret";

/**
 * Gates everything that is not a public asset, an API route or the sign-in
 * page.
 *
 * `withAuth` builds its own NextAuth instance from the environment, so the
 * secret has to be passed here explicitly — `authOptions` is not consulted, and
 * omitting it makes every matched route 500 in production.
 */
export default withAuth({
  secret: authSecret,
  callbacks: {
    /**
     * `withAuth` only redirects when this returns false. A valid session token
     * is the whole test — the matcher below decides which paths are public in
     * the first place. Returning a constant `true` here would silently turn
     * the gate off.
     */
    authorized: ({ token }) => Boolean(token),
  },
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|login|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
