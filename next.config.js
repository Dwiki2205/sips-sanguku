/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pg', 'bcryptjs']
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/sips_sanguku',
    JWT_SECRET: process.env.JWT_SECRET || 'fallback-jwt-secret-key-for-development',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    BASE_URL: process.env.BASE_URL || 'http://localhost:3000'
  },
  // Enable static exports if needed
  output: 'standalone',
  // Optimize for production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ],
      },
    ]
  },
  // Tambahkan untuk menghindari edge runtime issues
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig