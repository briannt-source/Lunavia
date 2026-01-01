import withPWA from "next-pwa";

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'firebasestorage.googleapis.com'],
  },
  // Exclude stitch pages from build
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  // Exclude stitch folders from build
  webpack: (config, { isServer }) => {
    // Exclude stitch folders
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules/**', '**/src/app/(stitch)**', '**/src/app/(stitch).disabled/**'],
    };
    return config;
  },
};

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

export default pwaConfig(nextConfig);

