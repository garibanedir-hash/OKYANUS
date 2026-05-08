export type MockPortalUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  accountType: "Bağışçı" | "Gönüllü" | "Bağışçı + Gönüllü";
  profileCompletion: number;
};

export type MockUserDonation = {
  id: string;
  date: string;
  amount: number;
  donationType: string;
  projectTitle: string;
  paymentStatus: string;
  receiptStatus: string;
};

export type MockSponsoredOrphan = {
  id: string;
  sponsorshipCode: string;
  maskedName: string;
  ageRange: string;
  region: string;
  educationStatus: string;
  startDate: string;
  supportStatus: string;
  lastUpdate: string;
  developmentNote: string;
  educationNote: string;
  wellbeingNote: string;
  supportSummaries: string[];
};

export type MockVolunteerEvent = {
  id: string;
  title: string;
  date: string;
  location: string;
  capacity: string;
  coordinator: string;
  participationStatus: string;
  category: string;
};

export type MockPortalNotification = {
  id: string;
  type: string;
  title: string;
  summary: string;
  date: string;
  read: boolean;
};

export type MockSupportedProject = {
  slug: string;
  title: string;
  status: string;
  progress: number;
  relation: "Bağışçı" | "Gönüllü" | "Önerilen";
};

export const mockPortalUser: MockPortalUser = {
  id: "user-demo-1",
  fullName: "Demo Destekçi",
  email: "destekci@example.com",
  phone: "+90 555 000 10 20",
  city: "İstanbul",
  accountType: "Bağışçı + Gönüllü",
  profileCompletion: 82
};

export const mockDonorProfile = {
  totalDonationCount: 8,
  totalDonationAmount: 7350,
  supportedProjectCount: 4,
  activeSponsorshipCount: 1,
  preferredDonationTypes: ["Gıda Desteği", "Eğitim Desteği", "Yetim ve Aile Destekleri"]
};

export const mockVolunteerProfile = {
  status: "Aktif gönüllü adayı",
  applicationStatus: "Ön değerlendirme tamamlandı",
  joinedActivities: 3,
  assignedTasks: 2,
  interestAreas: ["Saha Faaliyetleri", "Eğitim Desteği", "Lojistik Destek"]
};

export const mockUserDonations: MockUserDonation[] = [
  { id: "ud-1", date: "6 Mayıs 2026", amount: 500, donationType: "Gıda Desteği", projectTitle: "Bir Koli Bir Umut", paymentStatus: "Demo", receiptStatus: "Hazırlanıyor" },
  { id: "ud-2", date: "18 Nisan 2026", amount: 1000, donationType: "Eğitim Desteği", projectTitle: "Yetim Çocuklara Eğitim Desteği", paymentStatus: "Ödendi", receiptStatus: "Hazır" },
  { id: "ud-3", date: "2 Mart 2026", amount: 250, donationType: "Genel Bağış", projectTitle: "Genel Fon", paymentStatus: "Ödendi", receiptStatus: "Gerekli değil" }
];

export const mockSponsoredOrphans: MockSponsoredOrphan[] = [
  {
    id: "sp-1",
    sponsorshipCode: "OKY-SP-2026-014",
    maskedName: "A*** N***",
    ageRange: "9-11 yaş",
    region: "Türkiye / Marmara Bölgesi",
    educationStatus: "İlköğretim düzeyi",
    startDate: "Ocak 2026",
    supportStatus: "Aktif destek",
    lastUpdate: "Nisan 2026",
    developmentNote: "Düzenli eğitim takibi ve temel ihtiyaç desteği sürüyor.",
    educationNote: "Kırtasiye ve okul destekleri dönemsel olarak ulaştırıldı.",
    wellbeingNote: "Temel ihtiyaç desteği koordinatör takibiyle sürdürülüyor.",
    supportSummaries: ["Ocak: eğitim destek paketi", "Mart: temel ihtiyaç desteği", "Nisan: koordinatör bilgilendirmesi"]
  }
];

export const mockVolunteerEvents: MockVolunteerEvent[] = [
  { id: "ev-1", title: "Gıda kolisi hazırlık faaliyeti", date: "12 Mayıs 2026", location: "İstanbul depo", capacity: "18 / 25", coordinator: "Mehmet Kaya", participationStatus: "Katılabilir", category: "Saha" },
  { id: "ev-2", title: "Gönüllü oryantasyon buluşması", date: "18 Mayıs 2026", location: "Online", capacity: "42 / 60", coordinator: "Zeynep Arslan", participationStatus: "Başvuru açık", category: "Eğitim" },
  { id: "ev-3", title: "Kış yardımı rapor fotoğraf düzenleme", date: "24 Mayıs 2026", location: "Uzaktan", capacity: "4 / 8", coordinator: "Elif Şahin", participationStatus: "Uygun", category: "İçerik" }
];

export const mockPortalNotifications: MockPortalNotification[] = [
  { id: "nt-1", type: "Makbuz", title: "Bağış makbuzunuz hazırlandı", summary: "18 Nisan tarihli eğitim desteği bağışınız için demo makbuz durumu hazır görünüyor.", date: "Bugün", read: false },
  { id: "nt-2", type: "Proje", title: "Desteklediğiniz projede güncelleme var", summary: "Bir Koli Bir Umut projesinde yeni dağıtım özeti yayınlandı.", date: "Dün", read: false },
  { id: "nt-3", type: "Sponsorluk", title: "Sponsorluk bilgilendirmesi yayınlandı", summary: "Çocuk mahremiyeti korunarak aylık genel bilgilendirme notu eklendi.", date: "2 gün önce", read: true },
  { id: "nt-4", type: "Gönüllülük", title: "Yeni gönüllü etkinliği", summary: "Gıda kolisi hazırlık faaliyeti için katılım başvuruları açıldı.", date: "4 gün önce", read: true }
];

export const mockUserSupportedProjects: MockSupportedProject[] = [
  { slug: "bir-koli-bir-umut", title: "Bir Koli Bir Umut", status: "Devam Ediyor", progress: 68, relation: "Bağışçı" },
  { slug: "yetim-cocuklara-egitim-destegi", title: "Yetim Çocuklara Eğitim Desteği", status: "Devam Ediyor", progress: 54, relation: "Bağışçı" },
  { slug: "kis-gelmeden", title: "Kış Gelmeden", status: "Planlanıyor", progress: 32, relation: "Gönüllü" },
  { slug: "temiz-suya-ulasim", title: "Temiz Suya Ulaşım", status: "Önerilen", progress: 41, relation: "Önerilen" }
];
