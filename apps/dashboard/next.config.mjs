/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // `@mosaic/mosaic` ships a prebuilt `dist` (JS + .d.ts + CSS) that is already
  // present in the workspace, so it is consumed like any other dependency — no
  // `transpilePackages` and no build-order coupling. It is only pulled in by
  // the `/board/[id]` route, which is loaded client-side with `ssr: false`
  // because the editor touches `window` during module evaluation.
  eslint: {
    dirs: ["src"],
  },
  typescript: {
    // Type errors must fail `next build` — the dashboard is held to zero TS errors.
    ignoreBuildErrors: false,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
