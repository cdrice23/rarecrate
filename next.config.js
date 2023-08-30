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
  images: {
    domains: ['i.discogs.com', 'st.discogs.com'],
  },
};

module.exports = nextConfig;
