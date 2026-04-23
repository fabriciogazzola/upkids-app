import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', 
  typescript: {
    ignoreBuildErrors: true, 
  },
  // Adicionando o redirecionamento da raiz (/) para o (/login)
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
