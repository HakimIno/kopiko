import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.icons8.com', // ลบ double quote ออก
      },
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
      }
    ],
  },
};

export default nextConfig;