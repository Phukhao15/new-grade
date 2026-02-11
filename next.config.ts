/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/model-glb',
        destination: 'https://shost.rmutp.ac.th/2568/cpecar/Model-1.glb',
      },
      {
        source: '/api/model-usdz',
        destination: 'https://shost.rmutp.ac.th/2568/cpecar/Model-1.usdz',
      },
    ];
  },
};

export default nextConfig;