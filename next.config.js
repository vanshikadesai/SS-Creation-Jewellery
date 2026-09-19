/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Add any external image hosts you use for real product photography here, e.g.:
      // { protocol: "https", hostname: "images.sscreation.com" },
    ],
  },
};

module.exports = nextConfig;
