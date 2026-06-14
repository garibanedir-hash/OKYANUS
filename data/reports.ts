export type Report = {
  id: string;
  slug: string;
  title: string;
  period: string;
  category: string;
  summary: string;
  statusLabel: "Özet yayınlandı" | "PDF hazırlanıyor";
  pdfUrl?: string;
  metrics: Array<{ label: string; value: string }>;
  tags: string[];
};

export const reports: Report[] = [];
