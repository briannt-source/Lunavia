import withPWA from "next-pwa";

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'firebasestorage.googleapis.com'],
  },
  // Exclude stitch pages from build
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
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

