/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed `output: "export"` — causes unstyled pages on Vercel.
  // If you need static export, run `next build` locally; Vercel should use default output.
  images: { unoptimized: true },
};

module.exports = nextConfig;
