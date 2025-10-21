import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  reactCompiler: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,
    routerBFCache: true,
    cssChunking: true,
    cacheComponents: true,
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
}

export default nextConfig
