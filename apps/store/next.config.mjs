/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracing: false,
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001"
  }
};

export default nextConfig;
