/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb"
    }
  },
  async redirects() {
    return [
      {
        source: "/kvkk-aydinlatma-metni",
        destination: "/hukuki/kvkk-aydinlatma-metni",
        permanent: true
      },
      {
        source: "/gizlilik-politikasi",
        destination: "/hukuki/gizlilik-politikasi",
        permanent: true
      },
      {
        source: "/cerez-politikasi",
        destination: "/hukuki/cerez-politikasi",
        permanent: true
      },
      {
        source: "/bagis-sartlari",
        destination: "/hukuki/bagis-bilgilendirme-ve-sartlari",
        permanent: true
      }
    ];
  }
};

export default nextConfig;
