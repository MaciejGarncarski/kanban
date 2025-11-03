import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  cacheComponents: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
}

export default nextConfig
