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
    domains: ['i.discogs.com', 'st.discogs.com', 'rarecrate.s3.us-east-2.amazonaws.com', 'rarecrate.s3.amazonaws.com'],
  },
};

module.exports = nextConfig;
