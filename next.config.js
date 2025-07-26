/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    unoptimized: true,
  },
  // For deployment on platforms like Vercel, Netlify, etc.
  output: 'standalone',
}

module.exports = nextConfig
