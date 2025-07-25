/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*", // intercept /api/* calls
        destination: "http://localhost:8080/api/:path*", // proxy to Ktor backend
      },
    ];
  },
};

module.exports = nextConfig;
