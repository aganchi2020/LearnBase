/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/120485603/105258503',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
