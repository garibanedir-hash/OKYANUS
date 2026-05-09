export type MockDonation = {
  id: string;
  donorName: string;
  amount: number;
  donationType: string;
  projectSlug?: string;
  date: string;
  status: "Tamamlandı" | "Beklemede" | "İptal" | "Demo kayıt";
  paymentStatus: "Ödendi" | "Beklemede" | "Başarısız" | "Demo";
  receiptStatus: "Oluşturuldu" | "Bekliyor" | "Gerekli değil" | "Demo";
  note?: string;
};

export type MockVolunteerApplication = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  interestArea: string;
  experience: string;
  status: "Yeni Başvuru" | "İnceleniyor" | "Görüşmeye Davet" | "Uygun Ekip Bekliyor" | "Tamamlandı";
  submittedAt: string;
  note?: string;
};

export type MockContactMessage = {
  id: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  status: "Yeni" | "Okundu" | "Yanıtlandı" | "Arşivlendi";
  submittedAt: string;
};

export const mockDonations: MockDonation[] = [
  {
    id: "don-1001",
    donorName: "Ayşe Demir",
    amount: 500,
    donationType: "Gıda Desteği",
    projectSlug: "bir-koli-bir-umut",
    date: "2026-05-06",
    status: "Demo kayıt",
    paymentStatus: "Demo",
    receiptStatus: "Demo",
    note: "Proje bazlı demo bağış kaydı"
  },
  {
    id: "don-1002",
    donorName: "Mehmet Kaya",
    amount: 1000,
    donationType: "Eğitim Desteği",
    projectSlug: "yetim-cocuklara-egitim-destegi",
    date: "2026-05-05",
    status: "Beklemede",
    paymentStatus: "Beklemede",
    receiptStatus: "Bekliyor"
  },
  {
    id: "don-1003",
    donorName: "Kurumsal Destekçi",
    amount: 2500,
    donationType: "Genel Bağış",
    date: "2026-05-03",
    status: "Tamamlandı",
    paymentStatus: "Ödendi",
    receiptStatus: "Oluşturuldu"
  }
];

export const mockVolunteerApplications: MockVolunteerApplication[] = [
  {
    id: "vol-2001",
    fullName: "Zeynep Arslan",
    email: "zeynep@example.com",
    phone: "+90 555 000 00 01",
    city: "İstanbul",
    interestArea: "Saha Faaliyetleri",
    experience: "Üniversite kulübünde yardım organizasyonlarına katıldı.",
    status: "Yeni Başvuru",
    submittedAt: "6 Mayıs 2026",
    note: "Hafta sonu uygun"
  },
  {
    id: "vol-2002",
    fullName: "Ali Yılmaz",
    email: "ali@example.com",
    phone: "+90 555 000 00 02",
    city: "Ankara",
    interestArea: "Lojistik Destek",
    experience: "Depo ve sevkiyat süreçlerinde deneyimli.",
    status: "İnceleniyor",
    submittedAt: "4 Mayıs 2026"
  },
  {
    id: "vol-2003",
    fullName: "Elif Şahin",
    email: "elif@example.com",
    phone: "+90 555 000 00 03",
    city: "Bursa",
    interestArea: "Sosyal Medya / Tasarım",
    experience: "Grafik tasarım ve içerik üretimi yapıyor.",
    status: "Görüşmeye Davet",
    submittedAt: "2 Mayıs 2026"
  }
];

export const mockContactMessages: MockContactMessage[] = [
  {
    id: "msg-3001",
    fullName: "Fatma Öztürk",
    email: "fatma@example.com",
    subject: "Bağış bilgisi",
    message: "Gıda desteği bağış süreci hakkında bilgi almak istiyorum.",
    status: "Yeni",
    submittedAt: "6 Mayıs 2026"
  },
  {
    id: "msg-3002",
    fullName: "Hasan Çelik",
    email: "hasan@example.com",
    subject: "Gönüllülük",
    message: "Saha faaliyetlerine gönüllü olarak katılmak istiyorum.",
    status: "Okundu",
    submittedAt: "5 Mayıs 2026"
  },
  {
    id: "msg-3003",
    fullName: "Kurumsal İletişim",
    email: "iletisim@example.com",
    subject: "İş birliği",
    message: "Kurumsal destek ve iş birliği için görüşmek isteriz.",
    status: "Yanıtlandı",
    submittedAt: "1 Mayıs 2026"
  }
];

export type MockStaffMember = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: "Aktif" | "Meşgul" | "İzinli" | "Pasif";
  lastActivity: string;
  responsibilityArea: string;
  assignedTaskCount: number;
  completedTaskCount: number;
};

export type MockTask = {
  id: string;
  title: string;
  description: string;
  assignedBy: string;
  assignedTo: string;
  priority: "Düşük" | "Orta" | "Yüksek" | "Acil";
  status: "Yeni" | "Devam Ediyor" | "Beklemede" | "Tamamlandı" | "Gecikti" | "İptal";
  relatedEntityType: "Proje" | "Bağış" | "Gönüllü Başvurusu" | "İletişim Mesajı" | "Faaliyet Raporu" | "Genel";
  relatedEntityId?: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  internalNotes: string;
};

export type MockConversation = {
  id: string;
  subject: string;
  type: "Admin duyurusu" | "Personel mesajı" | "Görev yorumu" | "Proje iç notu" | "Gönüllü koordinasyon mesajı";
  participantNames: string[];
  lastMessageAt: string;
  unreadCount: number;
  relatedTaskId?: string;
};

export type MockInternalMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  recipientIds: string[];
  body: string;
  relatedTaskId?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  readBy: string[];
  createdAt: string;
};

export type MockTaskComment = {
  id: string;
  taskId: string;
  authorName: string;
  body: string;
  createdAt: string;
};

export const mockStaffMembers: MockStaffMember[] = [
  { id: "staff-1", fullName: "Serdar Yıldırım", email: "serdar@okyanus.org", role: "Super Admin", status: "Aktif", lastActivity: "10 dk önce", responsibilityArea: "Genel yönetim", assignedTaskCount: 5, completedTaskCount: 18 },
  { id: "staff-2", fullName: "Ayşe Demir", email: "ayse@okyanus.org", role: "Bağış Sorumlusu", status: "Aktif", lastActivity: "24 dk önce", responsibilityArea: "Bağış ve makbuz", assignedTaskCount: 7, completedTaskCount: 31 },
  { id: "staff-3", fullName: "Mehmet Kaya", email: "mehmet@okyanus.org", role: "Gönüllü Koordinatörü", status: "Meşgul", lastActivity: "1 saat önce", responsibilityArea: "Gönüllü koordinasyonu", assignedTaskCount: 9, completedTaskCount: 22 },
  { id: "staff-4", fullName: "Elif Şahin", email: "elif@okyanus.org", role: "İçerik Editörü", status: "Aktif", lastActivity: "Bugün", responsibilityArea: "Haber ve sosyal medya", assignedTaskCount: 4, completedTaskCount: 16 },
  { id: "staff-5", fullName: "Zeynep Arslan", email: "zeynep@okyanus.org", role: "Raporlama Sorumlusu", status: "Aktif", lastActivity: "Dün", responsibilityArea: "Faaliyet raporları", assignedTaskCount: 6, completedTaskCount: 14 }
];

export const mockTasks: MockTask[] = [
  { id: "task-1", title: "Kış yardımı rapor metriklerini güncelle", description: "Kış Gelmeden projesi için aile, battaniye ve il metriklerini kontrol et.", assignedBy: "Serdar Yıldırım", assignedTo: "Zeynep Arslan", priority: "Yüksek", status: "Devam Ediyor", relatedEntityType: "Faaliyet Raporu", relatedEntityId: "2025-kis-yardimlari-raporu", dueDate: "10 Mayıs 2026", createdAt: "6 Mayıs 2026", updatedAt: "7 Mayıs 2026", internalNotes: "PDF öncesi metrik doğrulaması yapılacak." },
  { id: "task-2", title: "Bağış makbuzu kontrol listesi hazırla", description: "Demo bağış kayıtları için makbuz durumu alanlarını muhasebe notuna göre işaretle.", assignedBy: "Serdar Yıldırım", assignedTo: "Ayşe Demir", priority: "Orta", status: "Yeni", relatedEntityType: "Bağış", relatedEntityId: "don-1002", dueDate: "9 Mayıs 2026", createdAt: "7 Mayıs 2026", updatedAt: "7 Mayıs 2026", internalNotes: "Gerçek ödeme yok; süreç notu hazırlanacak." },
  { id: "task-3", title: "Gönüllü başvurusu ön değerlendirme", description: "Saha faaliyetleri başvurularını şehir ve uygunluk durumuna göre sınıflandır.", assignedBy: "Mehmet Kaya", assignedTo: "Mehmet Kaya", priority: "Acil", status: "Gecikti", relatedEntityType: "Gönüllü Başvurusu", relatedEntityId: "vol-2001", dueDate: "6 Mayıs 2026", createdAt: "3 Mayıs 2026", updatedAt: "7 Mayıs 2026", internalNotes: "İstanbul ekibiyle görüşme planlanacak." },
  { id: "task-4", title: "Kış kampanyası haberini yayına hazırla", description: "Kampanya haberindeki proje bağlantılarını ve görsel placeholder alanını kontrol et.", assignedBy: "Serdar Yıldırım", assignedTo: "Elif Şahin", priority: "Orta", status: "Tamamlandı", relatedEntityType: "Proje", relatedEntityId: "kis-gelmeden", dueDate: "5 Mayıs 2026", createdAt: "2 Mayıs 2026", updatedAt: "5 Mayıs 2026", completedAt: "5 Mayıs 2026", internalNotes: "Haber yayına alındı." },
  { id: "task-5", title: "Faaliyet raporu PDF hazırlığı", description: "2026 ilk dönem faaliyet özeti için PDF alanlarını kontrol et.", assignedBy: "Zeynep Arslan", assignedTo: "Zeynep Arslan", priority: "Düşük", status: "Beklemede", relatedEntityType: "Faaliyet Raporu", relatedEntityId: "2026-ilk-donem-faaliyet-ozeti", dueDate: "15 Mayıs 2026", createdAt: "7 Mayıs 2026", updatedAt: "7 Mayıs 2026", internalNotes: "PDF upload modülü sonraki aşamada bağlanacak." }
];

export const mockConversations: MockConversation[] = [
  { id: "conv-1", subject: "Kış yardımı rapor koordinasyonu", type: "Görev yorumu", participantNames: ["Serdar Yıldırım", "Zeynep Arslan"], lastMessageAt: "12 dk önce", unreadCount: 2, relatedTaskId: "task-1" },
  { id: "conv-2", subject: "Bağış makbuzu süreç notu", type: "Personel mesajı", participantNames: ["Ayşe Demir", "Serdar Yıldırım"], lastMessageAt: "45 dk önce", unreadCount: 0, relatedTaskId: "task-2" },
  { id: "conv-3", subject: "Gönüllü saha ekipleri", type: "Gönüllü koordinasyon mesajı", participantNames: ["Mehmet Kaya", "Elif Şahin"], lastMessageAt: "Bugün", unreadCount: 1, relatedTaskId: "task-3" }
];

export const mockMessages: MockInternalMessage[] = [
  { id: "im-1", conversationId: "conv-1", senderId: "staff-1", senderName: "Serdar Yıldırım", recipientIds: ["staff-5"], body: "Kış raporu metriklerinde aile sayısını son saha notuyla eşleştirebilir misin?", relatedTaskId: "task-1", relatedEntityType: "Faaliyet Raporu", relatedEntityId: "2025-kis-yardimlari-raporu", readBy: ["staff-1"], createdAt: "12 dk önce" },
  { id: "im-2", conversationId: "conv-1", senderId: "staff-5", senderName: "Zeynep Arslan", recipientIds: ["staff-1"], body: "Kontrol ediyorum, PDF öncesi tabloyu güncelleyeceğim.", relatedTaskId: "task-1", readBy: ["staff-5"], createdAt: "8 dk önce" },
  { id: "im-3", conversationId: "conv-2", senderId: "staff-2", senderName: "Ayşe Demir", recipientIds: ["staff-1"], body: "Makbuz statülerini demo kayıtlar üzerinden ayırdım. Gerçek ödeme gelince provider id alanı gerekecek.", relatedTaskId: "task-2", readBy: ["staff-2", "staff-1"], createdAt: "45 dk önce" }
];

export const mockTaskComments: MockTaskComment[] = [
  { id: "tc-1", taskId: "task-1", authorName: "Zeynep Arslan", body: "Metrik kaynakları rapor taslağıyla karşılaştırılıyor.", createdAt: "Bugün" },
  { id: "tc-2", taskId: "task-3", authorName: "Mehmet Kaya", body: "Gecikme nedeni şehir ekiplerinin uygunluk bilgisini beklememiz.", createdAt: "Dün" }
];
