export type ProjectCategory = "Eğitim" | "Gıda" | "Sağlık" | "Acil Yardım" | "Yetim";
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
    goal: 450000,
    raised: 318000,
    status: "Devam Ediyor",
    location: "İstanbul ve çevre iller",
    startDate: "1 Mart 2026",
    updatedAt: "28 Nisan 2026",
    visualTone: "from-mint-green via-soft-blue to-warm-white",
    tags: ["gıda", "aile desteği", "ramazan"],
    metrics: [
      { label: "Hedef koli", value: "900" },
      { label: "Ulaşılan aile", value: "620" },
      { label: "Gönüllü ekip", value: "42" }
    ],
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
    goal: 600000,
    raised: 372000,
    status: "Devam Ediyor",
    location: "Türkiye geneli",
    startDate: "15 Şubat 2026",
    updatedAt: "20 Nisan 2026",
    visualTone: "from-soft-blue via-warm-white to-mint-green",
    tags: ["eğitim", "yetim", "kırtasiye"],
    metrics: [
      { label: "Öğrenci hedefi", value: "750" },
      { label: "Hazırlanan set", value: "465" },
      { label: "Eğitim dönemi", value: "2026" }
    ],
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
    goal: 520000,
    raised: 291000,
    status: "Planlanıyor",
    location: "Doğu ve İç Anadolu öncelikli",
    startDate: "1 Ekim 2026",
    updatedAt: "18 Nisan 2026",
    visualTone: "from-soft-blue via-warm-white to-soft-gray",
    tags: ["kış", "acil yardım", "aile desteği"],
    metrics: [
      { label: "Hedef aile", value: "520" },
      { label: "Battaniye", value: "1.200" },
      { label: "Planlanan il", value: "8" }
    ],
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
    category: "Sağlık",
    summary:
      "Temiz su ve hijyen imkanlarına erişimi güçlendiren kalıcı destekler geliştiriyoruz.",
    description:
      "Temiz suya erişimi ve hijyen imkanlarını güçlendirmeye yönelik sürdürülebilir destek projesi.",
    detail:
      "Temiz Suya Ulaşım projesi, hijyen ve sağlık açısından kritik ihtiyaçları kalıcı çözümlerle ele almayı hedefler. Proje, yerel paydaşlarla koordinasyon ve düzenli durum güncellemeleri gerektiren uzun soluklu bir yapı olarak kurgulanmıştır.",
    goal: 750000,
    raised: 405000,
    status: "Devam Ediyor",
    location: "Yurt dışı saha çalışmaları",
    startDate: "10 Ocak 2026",
    updatedAt: "22 Nisan 2026",
    visualTone: "from-mint-green via-soft-blue to-warm-white",
    tags: ["sağlık", "temiz su", "hijyen"],
    metrics: [
      { label: "Hedef nokta", value: "12" },
      { label: "Tamamlanan", value: "5" },
      { label: "Faydalanıcı", value: "2.400+" }
    ],
    impactItems: ["Temiz su erişimi", "Hijyen bilgilendirmesi", "Sürdürülebilir saha takibi"],
    scopeItems: ["Saha analizi", "Yerel koordinasyon", "Uygulama takibi", "Periyodik raporlama"],
    transparencyNote:
      "Uzun soluklu projelerde güncelleme tarihi ve saha notları bağışçı bilgilendirmesi için ayrıca tutulur.",
    cta: { label: "Su Projesine Destek Ol", href: "/bagis-yap?proje=temiz-suya-ulasim" }
  }
];
