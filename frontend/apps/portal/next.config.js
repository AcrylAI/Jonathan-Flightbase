/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  concurrentFeatures: true,
  async redirects() {
    return [
      {
        source: '/member/terms',
        destination: '/',
        permanent: true,
        locale: false,
      },
      {
        source: '/member/register',
        destination: '/',
        permanent: true,
        locale: false,
      },
    ];
  },
};

module.exports = nextConfig;
