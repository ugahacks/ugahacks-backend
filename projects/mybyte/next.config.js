/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/detectivebyte.png",
        destination: "/Detectivebyte.png",
      },
    ];
  },
};

module.exports = nextConfig
