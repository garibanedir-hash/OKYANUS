export type LegalPage = {
  slug: string;
  title: string;
  description: string;
  sections: Array<{ title: string; content: string }>;
};

export const legalPages: LegalPage[] = [
  {
    slug: "gizlilik-politikasi",
    title: "Gizlilik Politikası",
    description:
      "Bu metin taslak niteliğindedir; resmi kullanım öncesinde hukuki danışmanlıkla gözden geçirilmelidir.",
    sections: [
      { title: "Toplanabilecek Bilgiler", content: "Bağış, gönüllülük ve iletişim formlarında ad soyad, e-posta, telefon, şehir ve mesaj gibi bilgiler alınabilir." },
      { title: "Kullanım Amacı", content: "Bilgiler başvuruların değerlendirilmesi, iletişim kurulması ve destek süreçlerinin planlanması amacıyla kullanılabilir." },
      { title: "Veri Güvenliği", content: "Verilerin güvenli şekilde saklanması ve yalnızca yetkili kişilerce erişilmesi için gerekli teknik ve idari tedbirler planlanmalıdır." },
      { title: "İletişim", content: "Gizlilik talepleri için kurum iletişim kanalları üzerinden başvuru yapılabilir. İletişim bilgileri resmi yayın öncesi netleştirilmelidir." }
    ]
  },
  {
    slug: "kvkk-aydinlatma-metni",
    title: "KVKK Aydınlatma Metni",
    description:
      "Bu sayfa KVKK için taslak bilgilendirme yapısıdır; resmi kullanım öncesi hukuki danışmanlık gerektirir.",
    sections: [
      { title: "Veri Sorumlusu", content: "Veri sorumlusu bilgisi placeholder olarak bırakılmıştır ve resmi bilgilerle güncellenmelidir." },
      { title: "İşlenen Kişisel Veriler", content: "Kimlik, iletişim, başvuru ve işlem güvenliği kategorilerinde veriler işlenebilir." },
      { title: "İşleme Amaçları", content: "Başvuruların alınması, bağış süreçlerinin yürütülmesi, gönüllü koordinasyonu ve bilgilendirme amacıyla veri işlenebilir." },
      { title: "Haklarınız", content: "KVKK kapsamındaki haklarınız için resmi iletişim kanalları üzerinden başvuru yapılabilir." }
    ]
  },
  {
    slug: "cerez-politikasi",
    title: "Çerez Politikası",
    description:
      "Bu metin çerez kullanımı için frontend taslağıdır; gerçek analitik araçları eklendiğinde güncellenmelidir.",
    sections: [
      { title: "Zorunlu Çerezler", content: "Sitenin temel işlevlerinin çalışması için gerekli çerezler kullanılabilir." },
      { title: "Analitik Çerezler", content: "Ziyaretçi deneyimini anlamak için analitik çerezler ileride eklenebilir." },
      { title: "Tercih Çerezleri", content: "Dil, tercih ve erişilebilirlik ayarları için tercih çerezleri kullanılabilir." },
      { title: "Çerez Yönetimi", content: "Kullanıcılar tarayıcı ayarlarından çerez tercihlerini yönetebilir." }
    ]
  },
  {
    slug: "bagis-sartlari",
    title: "Bağış Şartları",
    description:
      "Bu sayfa bağış akışı için taslak bilgilendirme metnidir; ödeme entegrasyonu öncesi resmi metinlerle güncellenmelidir.",
    sections: [
      { title: "Gönüllülük Esası", content: "Bağışlar kullanıcının kendi isteğiyle ve gönüllülük esasına göre yapılır." },
      { title: "Bağış Alanı Seçimi", content: "Bağışçı genel bağış veya belirli destek alanlarından birini seçebilir." },
      { title: "İade ve Değerlendirme", content: "İade, iptal ve değerlendirme süreçleri için resmi prosedür placeholder olarak bırakılmıştır." },
      { title: "Demo Notu", content: "Mevcut bağış ekranı demo/frontend akışı olarak hazırlanmıştır; gerçek ödeme alınmamaktadır." }
    ]
  }
];
