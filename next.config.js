/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/index.html',
      },
      {
        source: '/marathi-fonts',
        destination: '/marathi-fonts.html',
      }
    ];
  }
};

module.exports = nextConfig;
