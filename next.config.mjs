/** @type {import('next').NextConfig} */
const nextConfig = {
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
