export const mockReceipts = [
  { receiptNo: "OKY-MKB-2026-001", donor: "Ayşe D.", amount: "500 TL", project: "Bir Koli Bir Umut", status: "Bekliyor", date: "2026-05-06" },
  { receiptNo: "OKY-MKB-2026-002", donor: "Mehmet K.", amount: "1.000 TL", project: "Eğitim Desteği", status: "Kesildi", date: "2026-05-05" },
  { receiptNo: "OKY-MKB-2026-003", donor: "Kurumsal Destekçi", amount: "2.500 TL", project: "Genel Fon", status: "Demo", date: "2026-05-03" }
];

export const mockPaymentRecords = [
  { id: "PAY-DEMO-1001", donor: "Ayşe D.", amount: "500 TL", method: "Sanal POS demo", status: "Başarılı", date: "2026-05-06", reference: "ref_demo_1001" },
  { id: "PAY-DEMO-1002", donor: "Mehmet K.", amount: "1.000 TL", method: "EFT/Havale demo", status: "Beklemede", date: "2026-05-05", reference: "ref_demo_1002" },
  { id: "PAY-DEMO-1003", donor: "Demo Destekçi", amount: "250 TL", method: "Kart demo", status: "Başarısız", date: "2026-05-04", reference: "ref_demo_1003" }
];

export const mockDonorDirectory = [
  { fullName: "Ayşe Demir", email: "a***@example.com", phone: "+90 *** *** ** 01", totalDonation: "4.250 TL", lastDonation: "2026-05-06", projectCount: 3, sponsorship: "Yok" },
  { fullName: "Mehmet Kaya", email: "m***@example.com", phone: "+90 *** *** ** 02", totalDonation: "8.750 TL", lastDonation: "2026-05-05", projectCount: 4, sponsorship: "Aktif" },
  { fullName: "Kurumsal Destekçi", email: "k***@example.com", phone: "+90 *** *** ** 03", totalDonation: "15.000 TL", lastDonation: "2026-05-03", projectCount: 2, sponsorship: "Yok" }
];

export const mockVolunteerPool = [
  { fullName: "Zeynep A.", city: "İstanbul", interestArea: "Saha Faaliyetleri", status: "Aktif", activityCount: 6, lastActivity: "2026-05-06", coordinator: "Mehmet Kaya" },
  { fullName: "Ali Y.", city: "Ankara", interestArea: "Lojistik Destek", status: "Eğitim Almış", activityCount: 3, lastActivity: "2026-04-28", coordinator: "Zeynep Arslan" },
  { fullName: "Elif Ş.", city: "Bursa", interestArea: "Sosyal Medya / Tasarım", status: "Uygun", activityCount: 4, lastActivity: "2026-05-01", coordinator: "Elif Şahin" }
];
