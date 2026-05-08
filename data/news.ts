export type NewsItem = {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  summary: string;
  content: string;
  tags: string[];
  relatedProjectSlug?: string;
  relatedActivitySlug?: string;
};

export const news: NewsItem[] = [
  {
    id: "news-2026-001",
    slug: "yardim-organizasyonu-tamamlandi",
    title: "Yardım Organizasyonu Tamamlandı",
    category: "Faaliyet",
    date: "12 Nisan 2026",
    summary:
      "Gıda ve hijyen desteklerinden oluşan saha çalışmamız gönüllülerimizin katkısıyla tamamlandı.",
    content:
      "Gönüllülerimizin desteğiyle hazırlanan gıda ve hijyen paketleri, saha koordinasyonu tamamlanan ailelere ulaştırıldı. Çalışma boyunca emanet bilinci, mahremiyet ve düzenli kayıt anlayışı temel alındı.",
    tags: ["gıda", "saha", "gönüllülük"],
    relatedProjectSlug: "bir-koli-bir-umut",
    relatedActivitySlug: "gida-erzak"
  },
  {
    id: "news-2026-002",
    slug: "yeni-gonullu-bulusmasi",
    title: "Yeni Gönüllü Buluşması Gerçekleşti",
    category: "Gönüllülük",
    date: "28 Mart 2026",
    summary:
      "Gönüllülerimizle saha süreçleri, emanet bilinci ve proje takibi üzerine verimli bir buluşma yaptık.",
    content:
      "Buluşmada gönüllülük süreci, saha koordinasyonu, bağışçı bilgilendirmesi ve insan onurunu koruyan iletişim dili üzerine değerlendirmeler yapıldı. Yeni gönüllüler için uygun ekip yönlendirme akışı paylaşıldı.",
    tags: ["gönüllülük", "eğitim", "koordinasyon"],
    relatedActivitySlug: "egitim"
  },
  {
    id: "news-2026-003",
    slug: "kis-yardimi-kampanyasi",
    title: "Kış Yardımı Kampanyası Başladı",
    category: "Kampanya",
    date: "4 Mart 2026",
    summary:
      "Battaniye, mont, bot ve yakacak destekleri için kış yardımı kampanyamızı başlattık.",
    content:
      "Kış ayları öncesinde destek bekleyen ailelerin temel ihtiyaçlarına katkı sunmak amacıyla kampanya hazırlıkları başladı. Kampanya kapsamında destek türleri ve saha öncelikleri proje bazlı takip edilecek.",
    tags: ["kış", "kampanya", "acil yardım"],
    relatedProjectSlug: "kis-gelmeden",
    relatedActivitySlug: "kis-yardimi"
  }
];
