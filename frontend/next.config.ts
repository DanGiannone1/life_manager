import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: '/favicon.ico',
        destination: '/icons/favicon.ico',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
