import {
  BarChart3,
  FileText,
  HeartHandshake,
  Newspaper,
  Settings,
  UsersRound
} from "lucide-react";
import { isAdminDemoMode } from "@/config/admin";

const demoOnly = <T>(items: T[]) => (isAdminDemoMode ? items : []);

export type DailyDonationPoint = {
  label: string;
  amount: number;
  count: number;
};

export type TopCampaign = {
  name: string;
  amount: number;
  supporters: number;
  category: string;
};

export type DashboardStat = {
  title: string;
  value: string;
  description: string;
  trend: string;
  trendDirection: "up" | "down" | "flat";
  iconName: "donation" | "volunteer" | "campaign" | "supporter" | "project" | "report";
};

export type RecentActivity = {
  id: string;
  type: string;
  description: string;
  time: string;
  status: string;
};

export type QuickAction = {
  label: string;
  href: string;
  description: string;
  iconName: "project" | "news" | "report" | "donation" | "volunteer" | "settings";
};

export type SystemStatusItem = {
  label: string;
  value: string;
  status: "Hazır" | "Demo" | "Planlandı" | "Pasif" | "Taslak";
};

export const dailyDonations: DailyDonationPoint[] = demoOnly([
  { label: "1 May", amount: 12400, count: 18 },
  { label: "2 May", amount: 18350, count: 24 },
  { label: "3 May", amount: 9800, count: 12 },
  { label: "4 May", amount: 22100, count: 31 },
  { label: "5 May", amount: 28600, count: 37 },
  { label: "6 May", amount: 34250, count: 44 },
  { label: "7 May", amount: 30100, count: 39 }
]);

export const monthlyDonations: DailyDonationPoint[] = demoOnly([
  { label: "Ocak", amount: 210000, count: 330 },
  { label: "Şubat", amount: 238000, count: 362 },
  { label: "Mart", amount: 382000, count: 540 },
  { label: "Nisan", amount: 326000, count: 488 },
  { label: "Mayıs", amount: 181000, count: 242 }
]);

export const topCampaigns: TopCampaign[] = demoOnly([
  { name: "Kış Gelmeden", amount: 291000, supporters: 418, category: "Acil Yardım" },
  { name: "Bir Koli Bir Umut", amount: 318000, supporters: 386, category: "Gıda" },
  { name: "Eğitim Desteği", amount: 372000, supporters: 274, category: "Yetim" },
  { name: "Temiz Suya Ulaşım", amount: 405000, supporters: 196, category: "Sağlık" }
]);

export const donationSummary = isAdminDemoMode
  ? {
      todayAmount: 30100,
      todayCount: 39,
      monthAmount: 181000,
      successfulPayments: 1248,
      pendingPayments: 17,
      failedPayments: 6,
      averageDonation: 742,
      topCategory: "Kış Yardımları",
      thirtyDayTrend: "+18%"
    }
  : {
      todayAmount: 0,
      todayCount: 0,
      monthAmount: 0,
      successfulPayments: 0,
      pendingPayments: 0,
      failedPayments: 0,
      averageDonation: 0,
      topCategory: "Kayıt yok",
      thirtyDayTrend: "0%"
    };

export const dashboardStats: DashboardStat[] = demoOnly([
  {
    title: "Bugünkü Bağış Tutarı",
    value: "30.100 TL",
    description: "Son 24 saatte demo kayıt",
    trend: "+12%",
    trendDirection: "up",
    iconName: "donation"
  },
  {
    title: "Bugünkü Bağış İşlemi",
    value: "39",
    description: "Tamamlanan ve bekleyen kayıt",
    trend: "+7 işlem",
    trendDirection: "up",
    iconName: "donation"
  },
  {
    title: "Aktif Kampanya",
    value: "4",
    description: "Proje ve kampanya takibi",
    trend: "stabil",
    trendDirection: "flat",
    iconName: "campaign"
  },
  {
    title: "Yeni Gönüllü Başvurusu",
    value: "11",
    description: "Bu hafta gelen başvurular",
    trend: "+3",
    trendDirection: "up",
    iconName: "volunteer"
  },
  {
    title: "Toplam Destekçi",
    value: "1.846",
    description: "Bağışçı ve gönüllü demo toplamı",
    trend: "+9%",
    trendDirection: "up",
    iconName: "supporter"
  },
  {
    title: "Tamamlanan Proje",
    value: "8",
    description: "Arşivlenmiş demo proje",
    trend: "+1",
    trendDirection: "up",
    iconName: "project"
  }
]);

export const recentActivities: RecentActivity[] = demoOnly([
  { id: "act-1", type: "Bağış", description: "Bir Koli Bir Umut için yeni demo bağış kaydı oluşturuldu.", time: "10 dk önce", status: "Demo kayıt" },
  { id: "act-2", type: "Gönüllü", description: "İstanbul’dan saha faaliyetleri için gönüllü başvurusu alındı.", time: "32 dk önce", status: "Yeni" },
  { id: "act-3", type: "Rapor", description: "2026 İlk Dönem Faaliyet Özeti taslak olarak eklendi.", time: "1 saat önce", status: "Taslak" },
  { id: "act-4", type: "Haber", description: "Kış Yardımı Kampanyası Başladı haberi yayına alındı.", time: "3 saat önce", status: "Yayında" },
  { id: "act-5", type: "Proje", description: "Temiz Suya Ulaşım proje metrikleri güncellendi.", time: "Dün", status: "Güncellendi" }
]);

export const quickActions: QuickAction[] = demoOnly([
  { label: "Yeni Proje Ekle", href: "/admin/projeler", description: "Kampanya/proje taslağı hazırla", iconName: "project" },
  { label: "Yeni Haber Ekle", href: "/admin/haberler", description: "Duyuru veya faaliyet notu gir", iconName: "news" },
  { label: "Yeni Rapor Oluştur", href: "/admin/faaliyet-raporlari", description: "Şeffaflık raporu taslağı", iconName: "report" },
  { label: "Bağışları Gör", href: "/admin/bagislar", description: "Demo bağış kayıtlarını incele", iconName: "donation" },
  { label: "Gönüllü Başvuruları", href: "/admin/gonullu-basvurular", description: "Başvuru havuzunu kontrol et", iconName: "volunteer" },
  { label: "Site Ayarları", href: "/admin/ayarlar", description: "Kurumsal alanları düzenle", iconName: "settings" }
]);

export const systemStatus: SystemStatusItem[] = demoOnly([
  { label: "Demo mod", value: "Aktif", status: "Demo" },
  { label: "Auth entegrasyonu", value: "Hazır mimari", status: "Planlandı" },
  { label: "RLS politikaları", value: "Dokümante", status: "Planlandı" },
  { label: "Ödeme entegrasyonu", value: "Aktif değil", status: "Pasif" },
  { label: "Son veri güncellemesi", value: "Demo", status: "Demo" },
  { label: "Hukuki metinler", value: "Taslak", status: "Taslak" }
]);

export const supporterGrowth = demoOnly([
  { label: "Ocak", supporters: 980 },
  { label: "Şubat", supporters: 1120 },
  { label: "Mart", supporters: 1390 },
  { label: "Nisan", supporters: 1625 },
  { label: "Mayıs", supporters: 1846 }
]);

export const volunteerTrends = demoOnly([
  { label: "İstanbul", count: 42 },
  { label: "Ankara", count: 18 },
  { label: "Bursa", count: 14 },
  { label: "Konya", count: 9 },
  { label: "İzmir", count: 11 }
]);

export const adminIconMap = {
  donation: HeartHandshake,
  volunteer: UsersRound,
  campaign: BarChart3,
  supporter: UsersRound,
  project: BarChart3,
  report: FileText,
  news: Newspaper,
  settings: Settings
};
