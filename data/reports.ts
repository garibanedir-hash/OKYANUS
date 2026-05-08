export type Report = {
  id: string;
  slug: string;
  title: string;
  period: string;
  category: string;
  summary: string;
  statusLabel: "Demo rapor" | "PDF yakında";
  pdfUrl?: string;
  metrics: Array<{ label: string; value: string }>;
  tags: string[];
};

export const reports: Report[] = [
  {
    id: "report-2026-h1",
    slug: "2026-ilk-donem-faaliyet-ozeti",
    title: "2026 İlk Dönem Faaliyet Özeti",
    period: "Ocak - Haziran 2026",
    category: "Genel Faaliyet",
    summary:
      "Gıda, eğitim ve gönüllülük çalışmalarının ilk dönem özetini görünür kılan demo rapor yapısı.",
    statusLabel: "Demo rapor",
    metrics: [
      { label: "Faaliyet", value: "18" },
      { label: "Gönüllü", value: "210" },
      { label: "Ulaşılan kişi", value: "4.800+" }
    ],
    tags: ["genel", "şeffaflık", "2026"]
  },
  {
    id: "report-2025-annual",
    slug: "2025-yillik-faaliyet-raporu",
    title: "2025 Yıllık Faaliyet Raporu",
    period: "2025",
    category: "Yıllık Rapor",
    summary:
      "Yıl boyunca yürütülen destek, gönüllülük ve saha koordinasyonu çalışmalarının rapor taslağı.",
    statusLabel: "PDF yakında",
    metrics: [
      { label: "Şehir", value: "18" },
      { label: "Organizasyon", value: "35+" },
      { label: "Destekçi", value: "500+" }
    ],
    tags: ["yıllık", "faaliyet", "2025"]
  },
  {
    id: "report-2025-winter",
    slug: "2025-kis-yardimlari-raporu",
    title: "2025 Kış Yardımları Raporu",
    period: "Kasım 2025 - Mart 2026",
    category: "Kış Yardımı",
    summary:
      "Kış destekleri kapsamında planlanan ve tamamlanan çalışmaların özet rapor modeli.",
    statusLabel: "Demo rapor",
    metrics: [
      { label: "Battaniye", value: "1.200" },
      { label: "Aile", value: "520" },
      { label: "İl", value: "8" }
    ],
    tags: ["kış", "aile desteği", "rapor"]
  },
  {
    id: "report-2025-education",
    slug: "2025-egitim-destekleri-ozeti",
    title: "2025 Eğitim Destekleri Özeti",
    period: "2025 Eğitim Dönemi",
    category: "Eğitim",
    summary:
      "Kırtasiye, eğitim materyali ve öğrenci desteklerinin takip edilebileceği rapor taslağı.",
    statusLabel: "PDF yakında",
    metrics: [
      { label: "Öğrenci", value: "750" },
      { label: "Set", value: "640" },
      { label: "Gönüllü", value: "86" }
    ],
    tags: ["eğitim", "çocuklar", "2025"]
  }
];
