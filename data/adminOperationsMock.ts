import { isAdminDemoMode } from "@/config/admin";

const demoOnly = <T>(items: T[]) => (isAdminDemoMode ? items : []);

export const mockReceipts = demoOnly([
  { receiptNo: "OKY-MKB-2026-001", donor: "Ayşe D.", amount: "500 TL", project: "Bir Koli Bir Umut", status: "Bekliyor", date: "2026-05-06" },
  { receiptNo: "OKY-MKB-2026-002", donor: "Mehmet K.", amount: "1.000 TL", project: "Eğitim Desteği", status: "Kesildi", date: "2026-05-05" },
  { receiptNo: "OKY-MKB-2026-003", donor: "Kurumsal Destekçi", amount: "2.500 TL", project: "Genel Fon", status: "Demo", date: "2026-05-03" }
]);

export const mockPaymentRecords = demoOnly([
  { id: "PAY-DEMO-1001", donor: "Ayşe D.", amount: "500 TL", method: "Sanal POS demo", status: "Başarılı", date: "2026-05-06", reference: "ref_demo_1001" },
  { id: "PAY-DEMO-1002", donor: "Mehmet K.", amount: "1.000 TL", method: "EFT/Havale demo", status: "Beklemede", date: "2026-05-05", reference: "ref_demo_1002" },
  { id: "PAY-DEMO-1003", donor: "Demo Destekçi", amount: "250 TL", method: "Kart demo", status: "Başarısız", date: "2026-05-04", reference: "ref_demo_1003" }
]);

export const mockDonorDirectory = demoOnly([
  { fullName: "Ayşe Demir", email: "a***@example.com", phone: "+90 *** *** ** 01", totalDonation: "4.250 TL", lastDonation: "2026-05-06", projectCount: 3, sponsorship: "Yok" },
  { fullName: "Mehmet Kaya", email: "m***@example.com", phone: "+90 *** *** ** 02", totalDonation: "8.750 TL", lastDonation: "2026-05-05", projectCount: 4, sponsorship: "Aktif" },
  { fullName: "Kurumsal Destekçi", email: "k***@example.com", phone: "+90 *** *** ** 03", totalDonation: "15.000 TL", lastDonation: "2026-05-03", projectCount: 2, sponsorship: "Yok" }
]);

export const mockVolunteerPool = demoOnly([
  { fullName: "Zeynep A.", city: "İstanbul", interestArea: "Saha Faaliyetleri", status: "Aktif", activityCount: 6, lastActivity: "2026-05-06", coordinator: "Mehmet Kaya" },
  { fullName: "Ali Y.", city: "Ankara", interestArea: "Lojistik Destek", status: "Eğitim Almış", activityCount: 3, lastActivity: "2026-04-28", coordinator: "Zeynep Arslan" },
  { fullName: "Elif Ş.", city: "Bursa", interestArea: "Sosyal Medya / Tasarım", status: "Uygun", activityCount: 4, lastActivity: "2026-05-01", coordinator: "Elif Şahin" }
]);

export const operationKpis = demoOnly([
  { label: "İşlem Bekleyenler", value: 18, helper: "6 kayıt bugün güncellendi" },
  { label: "Takibimdeki Görevler", value: 12, helper: "3 görev gecikme riski taşıyor" },
  { label: "Bugünkü Bağış Hareketi", value: "42.500 TL", helper: "27 demo işlem" },
  { label: "Bekleyen Başvuru", value: 9, helper: "Gönüllü koordinasyonu" },
  { label: "Onay Bekleyen Makbuz", value: 7, helper: "Muhasebe kontrolü" },
  { label: "Açık Mesaj / Talep", value: 14, helper: "5 yeni iletişim kaydı" }
]);

export const operationFlowItems = demoOnly([
  { id: "OKY-IS-1088", title: "Kış yardımı saha dağıtım planı", owner: "Saha Koordinasyonu", status: "Devam Ediyor", date: "2026-05-16 10:20", module: "Görev" },
  { id: "OKY-IS-1087", title: "Eğitim desteği makbuz kontrolü", owner: "Bağış Birimi", status: "Beklemede", date: "2026-05-16 09:45", module: "Makbuz" },
  { id: "OKY-IS-1086", title: "Gönüllü buluşması salon rezervasyonu", owner: "Gönüllü Koordinasyonu", status: "Planlandı", date: "2026-05-15 17:10", module: "Rezervasyon" },
  { id: "OKY-IS-1085", title: "Faaliyet raporu görsel kontrolü", owner: "Raporlama", status: "Yeni", date: "2026-05-15 15:30", module: "Rapor" }
]);

export const recentWorkRecords = demoOnly([
  { id: "WRK-4012", type: "Bağış", title: "Bir Koli Bir Umut desteği", status: "Tamamlandı", time: "10:42" },
  { id: "WRK-4011", type: "Gönüllü", title: "Lojistik destek başvurusu", status: "Yeni", time: "10:15" },
  { id: "WRK-4010", type: "Ödeme", title: "EFT/Havale demo kontrolü", status: "Beklemede", time: "09:50" },
  { id: "WRK-4009", type: "Görev", title: "Saha notu güncellendi", status: "Devam Ediyor", time: "09:20" }
]);

export const workRecords = demoOnly([
  { id: "OKY-IS-1088", unit: "Saha Operasyon", category: "Kış Yardımı", title: "Dağıtım noktası planı", owner: "Mehmet K.", status: "Devam Ediyor", date: "2026-05-16", module: "Görev", relatedCount: 8 },
  { id: "OKY-IS-1087", unit: "Bağış Birimi", category: "Makbuz", title: "Makbuz onay kontrolü", owner: "Ayşe D.", status: "Beklemede", date: "2026-05-16", module: "Finans", relatedCount: 5 },
  { id: "OKY-IS-1086", unit: "Gönüllü Koordinasyon", category: "Toplantı", title: "Gönüllü eğitim salonu", owner: "Zeynep A.", status: "Planlandı", date: "2026-05-15", module: "Rezervasyon", relatedCount: 3 },
  { id: "OKY-IS-1085", unit: "Raporlama", category: "Faaliyet Raporu", title: "2026 ilk dönem özetleri", owner: "Elif Ş.", status: "Yeni", date: "2026-05-15", module: "Rapor", relatedCount: 4 }
]);

export const assignmentRows = demoOnly([
  { id: "47884", subject: "Kış yardımı saha koordinasyonu", responsible: "Mehmet K.", taskDate: "2026-05-16", closeTarget: "2026-05-20", closedAt: "-", adminAdvance: "12.000 TL", projectAdvance: "35.000 TL", stage: "Devam Ediyor", expense: "18.450 TL", remaining: "28.550 TL" },
  { id: "47883", subject: "Gönüllü eğitim toplantısı", responsible: "Zeynep A.", taskDate: "2026-05-15", closeTarget: "2026-05-18", closedAt: "-", adminAdvance: "2.500 TL", projectAdvance: "0 TL", stage: "Planlandı", expense: "650 TL", remaining: "1.850 TL" },
  { id: "47882", subject: "Eğitim desteği rapor kontrolü", responsible: "Elif Ş.", taskDate: "2026-05-14", closeTarget: "2026-05-17", closedAt: "2026-05-16", adminAdvance: "0 TL", projectAdvance: "8.000 TL", stage: "Tamamlandı", expense: "7.420 TL", remaining: "580 TL" },
  { id: "47881", subject: "Bağış makbuzu muhasebe kontrolü", responsible: "Ayşe D.", taskDate: "2026-05-13", closeTarget: "2026-05-16", closedAt: "-", adminAdvance: "0 TL", projectAdvance: "0 TL", stage: "Beklemede", expense: "0 TL", remaining: "0 TL" }
]);

export const assignmentDetail = {
  id: "47884",
  unit: "Saha Operasyon Birimi",
  region: "Marmara / İstanbul",
  startAt: "2026-05-16 09:00",
  endAt: "2026-05-20 18:00",
  subject: "Kış yardımı saha koordinasyonu",
  description: "Destek paketlerinin saha ekipleriyle koordineli şekilde dağıtım planına alınması ve raporlanması.",
  fundActivity: "Kış Yardımları",
  fundRegion: "İstanbul / Anadolu Yakası",
  responsible: "Mehmet K.",
  signers: "Saha Koordinatörü, Raporlama Sorumlusu",
  stage: "Devam Ediyor",
  transport: "Kurum aracı ve saha lojistik desteği",
  finance: {
    adminAdvance: "12.000 TL",
    projectAdvance: "35.000 TL",
    totalAdvance: "47.000 TL",
    advanceTerm: "5 gün",
    paymentMethod: "Banka transferi demo",
    iban: "TR** **** **** **** **** **",
    accountCode: "770.20.01",
    balance: "28.550 TL",
    payments: "18.450 TL",
    returns: "0 TL",
    expense: "18.450 TL",
    remaining: "28.550 TL",
    taskDate: "2026-05-16",
    closeTarget: "2026-05-20"
  }
};

export const relatedRecordGroups = demoOnly([
  { label: "Dokümanlar", count: 4 },
  { label: "Açık Görevler", count: 3 },
  { label: "Görevli Kişiler", count: 6 },
  { label: "Gidecek Yerler", count: 5 },
  { label: "Bağlantılı Projeler", count: 2 },
  { label: "Ulaşım Konaklama", count: 3 },
  { label: "Harcamalar", count: 7 },
  { label: "Yardımlar", count: 12 },
  { label: "Banka Ödeme Emirleri", count: 2 },
  { label: "Banka Hareketleri", count: 5 },
  { label: "Kasa Hareketleri", count: 1 },
  { label: "Yurtdışı İşlem Ödemeleri", count: 0 },
  { label: "Görev Raporu", count: 1 },
  { label: "Notlar", count: 8 },
  { label: "Süreç Aşamaları", count: 4 },
  { label: "Avans Fon Hareketleri", count: 3 },
  { label: "Muhasebe Fiş Bilgileri", count: 2 }
]);

export const expenseRows = demoOnly([
  ["2026-05-16", "Kış Yardımı", "Saha paket taşıma gideri", "Lojistik", "Dağıtım", "Proje Fonu", "İstanbul", "Kış Gelmeden", "8.450 TL", "0 TL", "770.20.01"],
  ["2026-05-16", "Kış Yardımı", "Araç yakıt gideri", "Ulaşım", "Saha", "Genel Fon", "İstanbul", "Bir Koli Bir Umut", "3.250 TL", "0 TL", "770.20.02"],
  ["2026-05-15", "Gönüllü Eğitim", "Salon hazırlık gideri", "Organizasyon", "Eğitim", "Genel Fon", "İstanbul", "Gönüllü Buluşması", "1.900 TL", "0 TL", "770.30.01"]
]);

export const expenseRequests = demoOnly([
  { id: "EXP-2201", description: "Saha paket taşıma gideri", type: "Lojistik", amount: "8.450 TL", activity: "Kış Yardımı", status: "Onay Bekliyor", code: "770.20.01" },
  { id: "EXP-2202", description: "Gönüllü eğitim salonu", type: "Organizasyon", amount: "1.900 TL", activity: "Gönüllü Eğitim", status: "Planlandı", code: "770.30.01" },
  { id: "EXP-2203", description: "Araç yakıt gideri", type: "Ulaşım", amount: "3.250 TL", activity: "Saha Operasyon", status: "Tamamlandı", code: "770.20.02" }
]);

export const transportRows = demoOnly([
  { task: "Kış yardımı saha koordinasyonu", person: "Mehmet K.", route: "Üsküdar - Sultanbeyli", date: "2026-05-16", type: "Kurum aracı", stay: "Yok", status: "Planlandı" },
  { task: "Gönüllü eğitim toplantısı", person: "Zeynep A.", route: "Genel Merkez", date: "2026-05-18", type: "Toplu ulaşım", stay: "Yok", status: "Beklemede" },
  { task: "Faaliyet raporu kontrolü", person: "Elif Ş.", route: "Merkez Ofis", date: "2026-05-19", type: "Yok", stay: "Yok", status: "Tamamlandı" }
]);

export const reservationRows = demoOnly([
  { id: "RSV-1401", reservedAt: "2026-05-16", place: "Toplantı Salonu A", unit: "Gönüllü Koordinasyon", subject: "Gönüllü Eğitim Toplantısı", useDate: "2026-05-18", repeat: "Tek sefer", start: "10:00", end: "12:30", participant: "28", opener: "Zeynep A.", status: "Onaylandı" },
  { id: "RSV-1402", reservedAt: "2026-05-15", place: "Online Görüşme Odası", unit: "Raporlama", subject: "Faaliyet raporu kontrolü", useDate: "2026-05-17", repeat: "Tek sefer", start: "14:00", end: "15:00", participant: "6", opener: "Elif Ş.", status: "Beklemede" },
  { id: "RSV-1403", reservedAt: "2026-05-14", place: "Saha Planlama Odası", unit: "Saha Operasyon", subject: "Dağıtım rota toplantısı", useDate: "2026-05-16", repeat: "Haftalık", start: "09:00", end: "10:00", participant: "9", opener: "Mehmet K.", status: "Planlandı" }
]);
