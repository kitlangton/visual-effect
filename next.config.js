/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  distDir: 'out',
  reactStrictMode: true,
  experimental: {
    esmExternals: true,
  },
  turbopack: {},
  webpack: (config, { isServer }) => {
    // Disable module concatenation to fix "Unexpected end of JSON input" errors
    config.optimization.concatenateModules = false;

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    return config;
  },
  transpilePackages: ['motion'],
};

export default nextConfig;
