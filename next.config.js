/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // This line was removed to allow middleware to run
  experimental: {
    esmExternals: 'loose'
  },
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: "canvas" }];
    return config;
  },
};

module.exports = nextConfig;