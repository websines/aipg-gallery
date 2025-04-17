/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // match your API routes (or “/(.*)” for everything)
        source: "/api/",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
  images: {
    domains: ["ik.imagekit.io"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
