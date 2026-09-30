/**
 * NextAuth signs the session JWT with this secret, and in production it refuses
 * to start without one — which surfaces as a 500 from its middleware on every
 * protected route rather than as a helpful message.
 *
 * It is resolved in one module because two independent NextAuth instances read
 * it: the route handler (`src/app/api/auth/[...nextauth]`) and the middleware
 * (`src/middleware.ts`, whose default export builds its own instance from the
 * environment and therefore ignores `authOptions`). A fixed development
 * fallback keeps `yarn dev` and a local `next build` working out of the box; a
 * loud warning makes sure nobody ships it.
 *
 * Set `NEXTAUTH_SECRET` in `.env.local` for anything real — see `.env.example`.
 */
const DEV_SECRET = "mosaic-dashboard-insecure-development-secret";

export const authSecret = process.env.NEXTAUTH_SECRET ?? DEV_SECRET;

if (process.env.NODE_ENV === "production" && !process.env.NEXTAUTH_SECRET) {
  console.warn(
    "\n[dashboard] NEXTAUTH_SECRET is not set — falling back to a well-known " +
      "development secret. Set it in .env.local before deploying.\n",
  );
}
