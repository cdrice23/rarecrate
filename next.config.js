/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/login',
        destination: '/api/auth/login',
      },
      {
        source: '/logout',
        destination: '/api/auth/logout',
      },
    ];
  },
};

module.exports = nextConfig;
