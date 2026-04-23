Para incluir o redirecionamento no seu arquivo next.config.ts mantendo as configurações de standalone e o ignore de TypeScript, use este código:

TypeScript

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
O que esse ajuste faz:
Preserva o Standalone: Mantém a otimização para deploy (Docker, por exemplo).