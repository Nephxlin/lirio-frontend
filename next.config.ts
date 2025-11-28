import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Otimização de imagens
  images: {
    unoptimized: true, // Desabilitar otimização para evitar problemas em produção
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**', // Aceitar qualquer domínio HTTP
      },
      {
        protocol: 'https',
        hostname: '**', // Aceitar qualquer domínio HTTPS
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  
  // Otimização de build e runtime
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Experimental features para melhor performance
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'react-hot-toast',
    ],
  },
};

export default nextConfig;
