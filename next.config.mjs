const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on"
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff"
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin"
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN"
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()"
  }
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb"
    }
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders
      }
    ];
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
