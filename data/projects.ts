export type ProjectCategory = "Eğitim" | "Gıda" | "Sağlık" | "Acil Yardım" | "Yetim" | "Su" | "Kurban";
export type ProjectStatus = "Devam Ediyor" | "Tamamlandı" | "Planlanıyor";

export type Project = {
  id: string;
  slug: string;
  title: string;
  category: ProjectCategory;
  summary: string;
  description: string;
  detail: string;
  goal: number;
  raised: number;
  status: ProjectStatus;
  location: string;
  regionSlug?: string;
  regionName?: string;
  country?: string;
  city?: string;
  regionLabel?: string;
  coverImageUrl?: string;
  thumbnailUrl?: string;
  activityCount?: number;
  startDate: string;
  updatedAt: string;
  visualTone: string;
  tags: string[];
  metrics: Array<{ label: string; value: string }>;
  impactItems: string[];
  scopeItems: string[];
  transparencyNote: string;
  cta: { label: string; href: string };
};

export const projects: Project[] = [
  {
    id: "project-food-001",
    slug: "bir-koli-bir-umut",
    title: "Bir Koli Bir Umut",
    category: "Gıda",
    summary:
      "Düzenli erzak desteğiyle ailelerin sofralarına güven ve dayanışma ulaştırıyoruz.",
    description:
      "Destek bekleyen ailelerin temel gıda ihtiyaçlarına düzenli ve kayıtlı şekilde katkı sunan proje.",
    detail:
      "Bir Koli Bir Umut projesi, sahadan gelen ihtiyaç tespitleri doğrultusunda hazırlanan gıda kolilerinin ailelere ulaştırılmasını amaçlar. Proje, bağışların destek alanıyla eşleştirilmesi, teslimat planı ve gönüllü saha koordinasyonu mantığıyla takip edilir.",
    goal: 0,
    raised: 0,
    status: "Devam Ediyor",
    location: "İstanbul ve çevre iller",
    regionSlug: "turkiye",
    regionName: "Türkiye",
    country: "Türkiye",
    activityCount: 0,
    startDate: "1 Mart 2026",
    updatedAt: "28 Nisan 2026",
    visualTone: "from-mint-green via-soft-blue to-warm-white",
    tags: ["gıda", "aile desteği", "ramazan"],
    metrics: [],
    impactItems: ["Temel gıda kolisi", "Hijyen destek paketi", "Aile ihtiyaç takibi"],
    scopeItems: ["İhtiyaç tespiti", "Koli hazırlığı", "Saha teslimatı", "Bağışçı bilgilendirmesi"],
    transparencyNote:
      "Bağışlar proje bazlı kayıt altına alınır; teslimat ve saha notları faaliyet raporlarına aktarılabilecek şekilde tutulur.",
    cta: { label: "Projeye Destek Ol", href: "/bagis-yap?proje=bir-koli-bir-umut" }
  },
  {
    id: "project-education-001",
    slug: "yetim-cocuklara-egitim-destegi",
    title: "Yetim Çocuklara Eğitim Desteği",
    category: "Yetim",
    summary:
      "Okul masrafları, kırtasiye ve eğitim materyalleri için sürdürülebilir destek sağlıyoruz.",
    description:
      "Yetim çocukların eğitim yolculuğuna kırtasiye, materyal ve dönemsel desteklerle katkı sunan proje.",
    detail:
      "Bu proje, yetim çocukların eğitim süreçlerinde karşılaşabildiği temel ihtiyaçlara düzenli destek sağlamayı hedefler. Destekler çocukların mahremiyeti ve ailelerin onuru gözetilerek planlanır.",
    goal: 0,
    raised: 0,
    status: "Devam Ediyor",
    location: "Lübnan ve Türkiye destek hattı",
    regionSlug: "lubnan",
    regionName: "Lübnan",
    country: "Lübnan",
    activityCount: 0,
    startDate: "15 Şubat 2026",
    updatedAt: "20 Nisan 2026",
    visualTone: "from-soft-blue via-warm-white to-mint-green",
    tags: ["eğitim", "yetim", "kırtasiye"],
    metrics: [],
    impactItems: ["Kırtasiye seti", "Eğitim materyali", "Okul ihtiyaç desteği"],
    scopeItems: ["Öğrenci ihtiyaç listesi", "Set hazırlığı", "Aile bilgilendirmesi", "Dönem sonu özet raporu"],
    transparencyNote:
      "Destekler çocuk mahremiyeti gözetilerek raporlanır; kişisel bilgiler kamuya açık paylaşılmaz.",
    cta: { label: "Eğitime Destek Ol", href: "/bagis-yap?proje=yetim-cocuklara-egitim-destegi" }
  },
  {
    id: "project-winter-001",
    slug: "kis-gelmeden",
    title: "Kış Gelmeden",
    category: "Acil Yardım",
    summary:
      "Kış şartları ağırlaşmadan ailelere sıcak tutacak temel ihtiyaçları ulaştırıyoruz.",
    description:
      "Kış ayları öncesinde ailelere battaniye, mont, bot ve yakacak desteği ulaştırmayı hedefleyen çalışma.",
    detail:
      "Kış Gelmeden projesi, soğuk hava koşulları ağırlaşmadan temel kış ihtiyaçlarının planlı biçimde ulaştırılmasına odaklanır. Saha ekipleri, ihtiyaçları bölge ve aile önceliğine göre sınıflandırır.",
    goal: 0,
    raised: 0,
    status: "Planlanıyor",
    location: "Doğu ve İç Anadolu öncelikli",
    regionSlug: "turkiye",
    regionName: "Türkiye",
    country: "Türkiye",
    activityCount: 0,
    startDate: "1 Ekim 2026",
    updatedAt: "18 Nisan 2026",
    visualTone: "from-soft-blue via-warm-white to-soft-gray",
    tags: ["kış", "acil yardım", "aile desteği"],
    metrics: [],
    impactItems: ["Battaniye", "Mont ve bot", "Yakacak katkısı"],
    scopeItems: ["Bölge önceliklendirme", "Malzeme tedariki", "Gönüllü lojistik", "Teslimat kaydı"],
    transparencyNote:
      "Planlanan destekler lokasyon, ürün grubu ve teslimat durumu üzerinden izlenebilir hale getirilecektir.",
    cta: { label: "Kış Desteği Ver", href: "/bagis-yap?proje=kis-gelmeden" }
  },
  {
    id: "project-water-001",
    slug: "temiz-suya-ulasim",
    title: "Temiz Suya Ulaşım",
    category: "Su",
    summary:
      "Temiz su ve hijyen imkanlarına erişimi güçlendiren kalıcı destekler geliştiriyoruz.",
    description:
      "Temiz suya erişimi ve hijyen imkanlarını güçlendirmeye yönelik sürdürülebilir destek projesi.",
    detail:
      "Temiz Suya Ulaşım projesi, hijyen ve sağlık açısından kritik ihtiyaçları kalıcı çözümlerle ele almayı hedefler. Proje, yerel paydaşlarla koordinasyon ve düzenli durum güncellemeleri gerektiren uzun soluklu bir yapı olarak kurgulanmıştır.",
    goal: 0,
    raised: 0,
    status: "Devam Ediyor",
    location: "Mısır lojistik ve saha çalışmaları",
    regionSlug: "misir",
    regionName: "Mısır",
    country: "Mısır",
    activityCount: 0,
    startDate: "10 Ocak 2026",
    updatedAt: "22 Nisan 2026",
    visualTone: "from-mint-green via-soft-blue to-warm-white",
    tags: ["sağlık", "temiz su", "hijyen"],
    metrics: [],
    impactItems: ["Temiz su erişimi", "Hijyen bilgilendirmesi", "Sürdürülebilir saha takibi"],
    scopeItems: ["Saha analizi", "Yerel koordinasyon", "Uygulama takibi", "Periyodik raporlama"],
    transparencyNote:
      "Uzun soluklu projelerde güncelleme tarihi ve saha notları bağışçı bilgilendirmesi için ayrıca tutulur.",
    cta: { label: "Su Projesine Destek Ol", href: "/bagis-yap?proje=temiz-suya-ulasim" }
  },
  {
    id: "project-gaza-emergency-001",
    slug: "gazze-acil-yardim",
    title: "Gazze Acil Yardım",
    category: "Acil Yardım",
    summary:
      "Gazze'de gıda, sağlık, barınma ve temel yaşam ihtiyaçları için hızlı destek çalışmaları yürütüyoruz.",
    description:
      "Acil ihtiyaçların yoğun olduğu Gazze hattında gıda, hijyen, sağlık ve barınma desteklerini kayıtlı şekilde planlayan proje.",
    detail:
      "Gazze Acil Yardım projesi, kriz şartlarında temel insani ihtiyaçlara odaklanır. Yerel temaslar, lojistik imkanlar ve sahadan gelen ihtiyaçlar doğrultusunda destek kalemleri önceliklendirilir.",
    goal: 0,
    raised: 0,
    status: "Devam Ediyor",
    location: "Gazze",
    regionSlug: "gazze",
    regionName: "Gazze",
    country: "Filistin",
    activityCount: 0,
    startDate: "5 Ocak 2026",
    updatedAt: "24 Mayıs 2026",
    visualTone: "from-soft-blue via-warm-white to-mint-green",
    tags: ["gazze", "acil yardım", "gıda", "sağlık", "barınma"],
    metrics: [],
    impactItems: ["Acil gıda desteği", "Hijyen paketi", "Sağlık ve barınma desteği"],
    scopeItems: ["İhtiyaç doğrulama", "Lojistik planlama", "Yerel teslimat", "Dönemsel raporlama"],
    transparencyNote:
      "Kriz bölgelerinde destekler saha şartlarına göre güncellenir; public faaliyet kayıtları doğrulanan teslimatlar üzerinden yayınlanır.",
    cta: { label: "Gazze'ye Destek Ol", href: "/bagis-yap?proje=gazze-acil-yardim" }
  },
  {
    id: "project-qurban-001",
    slug: "kurban-organizasyonu",
    title: "Kurban Organizasyonu",
    category: "Kurban",
    summary:
      "Vekalet, kesim ve dağıtım süreçlerini emanet bilinciyle planlayan kurban destek organizasyonu.",
    description:
      "Kurban bağışlarının bölge, hisse, vekalet ve dağıtım takibiyle yürütülmesi için hazırlanan proje.",
    detail:
      "Kurban Organizasyonu, vekaletlerin kayıt altına alınması, kesim takibi ve ihtiyaç bölgelerinde dağıtım planının şeffaf şekilde yürütülmesine odaklanır.",
    goal: 0,
    raised: 0,
    status: "Planlanıyor",
    location: "Gazze ve çevre ihtiyaç bölgeleri",
    regionSlug: "gazze",
    regionName: "Gazze",
    country: "Filistin",
    activityCount: 0,
    startDate: "1 Mayıs 2026",
    updatedAt: "26 Mayıs 2026",
    visualTone: "from-mint-green via-soft-blue to-warm-white",
    tags: ["kurban", "vekalet", "dağıtım", "gazze"],
    metrics: [],
    impactItems: ["Vekalet kaydı", "Kesim organizasyonu", "Dağıtım bildirimi"],
    scopeItems: ["Hisse planlama", "Vekalet takibi", "Kesim koordinasyonu", "Dağıtım raporu"],
    transparencyNote:
      "Kurban süreçleri kayıt ve durum güncellemeleriyle takip edilir; kesin operasyon bilgileri saha doğrulaması sonrası yayınlanır.",
    cta: { label: "Kurban Bağışı Yap", href: "/kurban" }
  }
];
