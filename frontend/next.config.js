/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          source: '/api/anomalies/:path*',
          destination: 'http://localhost:8000/anomalies/:path*',
        },
        {
          source: '/api/anomaly/:path*',
          destination: 'http://localhost:8000/anomaly/:path*',
        },
        {
          source: '/api/transfers/:wallet*',
          destination: 'http://localhost:8000/transfers/:wallet*',
        },
      ]
    },
  }
  
  module.exports = nextConfig

  