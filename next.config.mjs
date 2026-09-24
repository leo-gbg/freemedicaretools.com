/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    const www = { type: "host", value: "www.freemedicaretools.com" };
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
