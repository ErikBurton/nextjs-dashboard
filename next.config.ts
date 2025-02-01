import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
//   experimental: {
//     ppr: 'incremental'
//   }
// };
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
