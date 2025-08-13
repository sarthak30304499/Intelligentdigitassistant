/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/Intelligentdigitassistant',
  experimental: {
    esmExternals: 'loose'
  },
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: "canvas" }];
    return config;
  },
};

module.exports = nextConfig;