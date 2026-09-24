import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    const www = { type: "host" as const, value: "www.freemedicaretools.com" };
    return [
      {
        source: "/",
        has: [www],
        destination: "https://freemedicaretools.com",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [www],
        destination: "https://freemedicaretools.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
