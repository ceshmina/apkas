import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: process.env.NODE_ENV === 'development' ? undefined : 'export',
  distDir: 'out',
}

export default nextConfig
