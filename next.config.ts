import type { NextConfig } from 'next';
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // Turbopack disabled due to clientReferenceManifest issues
  // turbopack: {
  //   root: __dirname,
  // },

  // Performance optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Enable experimental features for better performance
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['@monaco-editor/react', 'monaco-editor'],
  },

  // Production bundle optimization
  productionBrowserSourceMaps: false, // Disable source maps in production for smaller bundles

  // Webpack configuration for bundle optimization
  webpack: (config, { isServer }) => {
    // Monaco Editor optimization
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            // Separate Monaco Editor into its own chunk
            monaco: {
              test: /[\\/]node_modules[\\/](monaco-editor|@monaco-editor)[\\/]/,
              name: 'monaco-editor',
              chunks: 'async',
              priority: 30,
            },
            // Separate XTerm.js (terminal) into its own chunk
            xterm: {
              test: /[\\/]node_modules[\\/](xterm|@xterm)[\\/]/,
              name: 'xterm',
              chunks: 'async',
              priority: 25,
            },
            // Separate React/Next.js core
            reactVendor: {
              test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
              name: 'react-vendor',
              chunks: 'all',
              priority: 40,
            },
          },
        },
      };
    }

    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
