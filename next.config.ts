import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
  reactStrictMode: true,
  
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    domains: ['localhost', 'propertyos.local'],
    minimumCacheTTL: 60,
  },

  // Performance optimizations
  experimental: {
    optimizeCss: true,
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  },

  // Development settings
  ...(process.env.NODE_ENV === 'development' && {
    typescript: {
      ignoreBuildErrors: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
    webpack: (config, { dev }) => {
      if (dev) {
        config.watchOptions = {
          ignored: ['**/*'],
        };
      }
      return config;
    },
  }),

  // Production settings
  ...(process.env.NODE_ENV === 'production' && {
    output: 'standalone',
    compress: true,
    poweredByHeader: false,
    generateEtags: false,
    
    // Build optimizations
    typescript: {
      ignoreBuildErrors: false,
    },
    eslint: {
      ignoreDuringBuilds: false,
    },
  }),
};

export default nextConfig;
