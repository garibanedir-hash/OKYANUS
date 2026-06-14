import type { Project } from "@/data/projects";
import { projects as fallbackProjects } from "@/data/projects";

export type ProjectRegionSlug = string;

export type ProjectRegionCategory =
  | "food"
  | "water"
  | "health"
  | "shelter"
  | "orphan"
  | "education"
  | "qurban"
  | "emergency";

export type ProjectRegion = {
  id: string;
  slug: ProjectRegionSlug;
  name: string;
  region: string;
  country: string;
  iso?: string;
  coords: [longitude: number, latitude: number];
  tagline: string;
  description: string;
  shortDescription: string;
  regionLabel: string;
  focusAreas: string[];
  priorityLabel: string;
  operatingModel: string;
  projectCount: number;
  activeProjectCount: number;
  beneficiaryEstimate: string;
  stats: Array<{ label: string; value: string }>;
  categories: ProjectRegionCategory[];
  recentUpdates: Array<{ title: string; dateLabel: string; summary: string }>;
  coverImageUrl?: string;
  coverTone: string;
  relatedProjectSlugs: string[];
};

export const projectRegionCategoryLabels: Record<ProjectRegionCategory, string> = {
  food: "Gıda",
  water: "Su",
  health: "Sağlık",
  shelter: "Barınma",
  orphan: "Yetim",
  education: "Eğitim",
  qurban: "Kurban",
  emergency: "Acil Yardım"
};

export const projectRegionCategoryIconPaths: Record<ProjectRegionCategory, string> = {
  water: "M12 3.5C12 3.5 6 10 6 14a6 6 0 0 0 12 0c0-4-6-10.5-6-10.5Z",
  food: "M12 21V10 M12 10c0-2-1.5-3.5-3.5-3.5C8.5 8.5 10 10 12 10Zm0 0c0-2 1.5-3.5 3.5-3.5C15.5 8.5 14 10 12 10Zm0-5c0-2-1.5-3.5-3.5-3.5C8.5 3.5 10 5 12 5Zm0 0c0-2 1.5-3.5 3.5-3.5C15.5 3.5 14 5 12 5Z",
  education: "M4 5.5A1.5 1.5 0 0 1 5.5 4H12v15H5.5A1.5 1.5 0 0 1 4 17.5ZM20 5.5A1.5 1.5 0 0 0 18.5 4H12v15h6.5a1.5 1.5 0 0 0 1.5-1.5Z",
  health: "M9 3h6v6h6v6h-6v6H9v-6H3V9h6Z",
  shelter: "M4 11 12 4l8 7M6 10v10h12V10",
  orphan: "M12 20s-7-4.6-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.4 12 20 12 20Z",
  qurban: "M7 8c1.8-2.7 8.2-2.7 10 0M6 12h12M8 16h8M12 5v14",
  emergency: "M12 3l9 16H3L12 3Zm0 5v5m0 3h.01"
};

export const projectRegions: ProjectRegion[] = [
  {
    id: "region-gaza",
    slug: "gazze",
    name: "Gazze",
    region: "Doğu Akdeniz kriz hattı",
    country: "Filistin",
    iso: "PS",
    coords: [34.39, 31.45],
    tagline: "Acil insani yardım ve temel yaşam desteği",
    description:
      "Gazze hattında gıda, hijyen, sağlık ve barınma ihtiyaçları önceliklendirilir. Bağışlar, insan onurunu gözeten yardım çalışmalarıyla ihtiyaç sahibi ailelere ulaştırılır.",
    shortDescription:
      "Acil gıda, sağlık, hijyen ve barınma desteğinin önceliklendirildiği saha hattı.",
    regionLabel: "Doğu Akdeniz kriz hattı",
    focusAreas: ["Acil yardım", "Gıda", "Sağlık", "Barınma"],
    priorityLabel: "Kriz müdahalesi",
    operatingModel: "Yerel temas + lojistik teyit + dönemsel raporlama",
    projectCount: 0,
    activeProjectCount: 0,
    beneficiaryEstimate: "Saha verisi doğrulanınca paylaşılacak",
    stats: [
      { label: "Bilgi Durumu", value: "Doğrulama bekliyor" },
      { label: "Paylaşım", value: "Saha notları güncellenecek" },
      { label: "Kayıt", value: "Faaliyetle birlikte yayınlanır" }
    ],
    categories: ["emergency", "food", "health", "shelter", "qurban"],
    recentUpdates: [
      {
        title: "Gıda desteği hazırlıkları tamamlandı",
        dateLabel: "Son güncelleme",
        summary: "Aile ihtiyaç listeleri saha temaslarıyla güncellendi; destek paketleri öncelik sırasına göre planlandı."
      },
      {
        title: "Hijyen desteği için ihtiyaç tespiti yapıldı",
        dateLabel: "Saha notu",
        summary: "Hijyen ve temel yaşam desteği başlıkları aile bazlı ihtiyaçlarla eşleştirildi."
      }
    ],
    coverTone: "from-[#0F2547] via-[#1F8083] to-[#D7DEE8]",
    relatedProjectSlugs: ["gazze-acil-yardim", "kurban-organizasyonu", "temiz-suya-ulasim"]
  },
  {
    id: "region-lebanon",
    slug: "lubnan",
    name: "Lübnan",
    region: "Mülteci ve aile destek hattı",
    country: "Lübnan",
    iso: "LB",
    coords: [35.85, 33.85],
    tagline: "Mülteci aileler, çocuklar ve eğitim destekleri",
    description:
      "Lübnan bölgesinde mülteci ailelerin temel ihtiyaçları, çocukların eğitim materyalleri ve aile destekleri düzenli programlarla ele alınır.",
    shortDescription:
      "Mülteci aileler, eğitim desteği ve temel gıda ihtiyaçları için sürdürülebilir programlar.",
    regionLabel: "Mülteci ve aile destek hattı",
    focusAreas: ["Mülteci destekleri", "Gıda", "Eğitim"],
    priorityLabel: "Aile ve eğitim desteği",
    operatingModel: "Programlı yardım + aile takibi + eğitim materyali",
    projectCount: 0,
    activeProjectCount: 0,
    beneficiaryEstimate: "Saha verisi doğrulanınca paylaşılacak",
    stats: [
      { label: "Bilgi Durumu", value: "Doğrulama bekliyor" },
      { label: "Paylaşım", value: "Saha notları güncellenecek" },
      { label: "Kayıt", value: "Faaliyetle birlikte yayınlanır" }
    ],
    categories: ["food", "education", "orphan"],
    recentUpdates: [
      {
        title: "Eğitim setleri için aile listeleri güncellendi",
        dateLabel: "Program takibi",
        summary: "Çocukların eğitim dönemi ihtiyaçları kırtasiye ve temel destek başlıklarıyla yeniden planlandı."
      },
      {
        title: "Aile destek çalışması sürdürüldü",
        dateLabel: "Saha notu",
        summary: "Mülteci ailelere yönelik gıda ve temel ihtiyaç desteği için dönemsel takip yapıldı."
      }
    ],
    coverTone: "from-[#0F2547] via-[#1F8083] to-[#EEF4F6]",
    relatedProjectSlugs: ["yetim-cocuklara-egitim-destegi", "bir-koli-bir-umut"]
  },
  {
    id: "region-egypt",
    slug: "misir",
    name: "Mısır",
    region: "Lojistik ve geçiş destekleri",
    country: "Mısır",
    iso: "EG",
    coords: [31.0, 28.5],
    tagline: "Bölgesel lojistik, sağlık ve geçiş destekleri",
    description:
      "Mısır hattı, temiz su, sağlık/hijyen ve bölgesel geçiş desteklerinin planlandığı tamamlayıcı bir insani yardım çalışma alanıdır.",
    shortDescription:
      "Lojistik hazırlık, sağlık ve geçiş destekleriyle bölgesel insani yardım akışını güçlendiren hat.",
    regionLabel: "Lojistik ve geçiş destekleri",
    focusAreas: ["Lojistik", "Sağlık", "Geçiş destekleri"],
    priorityLabel: "Lojistik hazırlık",
    operatingModel: "Geçiş desteği + sağlık/hijyen lojistiği",
    projectCount: 0,
    activeProjectCount: 0,
    beneficiaryEstimate: "Saha verisi doğrulanınca paylaşılacak",
    stats: [
      { label: "Bilgi Durumu", value: "Doğrulama bekliyor" },
      { label: "Paylaşım", value: "Saha notları güncellenecek" },
      { label: "Kayıt", value: "Faaliyetle birlikte yayınlanır" }
    ],
    categories: ["health", "water", "emergency"],
    recentUpdates: [
      {
        title: "Temiz su ve hijyen desteği planlandı",
        dateLabel: "Son güncelleme",
        summary: "Su ve hijyen ihtiyaçları için öncelikli destek noktaları belirlendi."
      },
      {
        title: "Sağlık desteği hazırlıkları gözden geçirildi",
        dateLabel: "Saha notu",
        summary: "Bölgesel ihtiyaçlara göre sağlık ve geçiş destekleri için hazırlık listesi güncellendi."
      }
    ],
    coverTone: "from-[#071C28] via-[#1F8083] to-[#D7DEE8]",
    relatedProjectSlugs: ["temiz-suya-ulasim", "gazze-acil-yardim"]
  },
  {
    id: "region-turkey",
    slug: "turkiye",
    name: "Türkiye",
    region: "Merkez, afet ve sosyal destek ağı",
    country: "Türkiye",
    iso: "TR",
    coords: [37.5, 38.6],
    tagline: "Merkez koordinasyon, afet ve sosyal destek çalışmaları",
    description:
      "Türkiye hattı, dernek merkez koordinasyonu, afet yardımı, sosyal destek, yetim ve aile destek programlarının planlandığı ana çalışma alanıdır.",
    shortDescription:
      "Sosyal destek, afet yardımı, yetim ve aile destekleri için merkez ve saha koordinasyonu.",
    regionLabel: "Merkez, afet ve sosyal destek ağı",
    focusAreas: ["Sosyal destek", "Afet yardımı", "Yetim", "Aile destekleri"],
    priorityLabel: "Merkez koordinasyon",
    operatingModel: "Merkez ekip + saha gönüllüleri + sosyal destek ağı",
    projectCount: 0,
    activeProjectCount: 0,
    beneficiaryEstimate: "Saha verisi doğrulanınca paylaşılacak",
    stats: [
      { label: "Bilgi Durumu", value: "Doğrulama bekliyor" },
      { label: "Paylaşım", value: "Saha notları güncellenecek" },
      { label: "Kayıt", value: "Faaliyetle birlikte yayınlanır" }
    ],
    categories: ["food", "orphan", "education", "emergency"],
    recentUpdates: [
      {
        title: "Aile destek çalışmaları güncellendi",
        dateLabel: "Son güncelleme",
        summary: "Sosyal destek başvuruları ve aile ihtiyaçları öncelik durumuna göre yeniden sınıflandırıldı."
      },
      {
        title: "Kış desteği hazırlıkları başlatıldı",
        dateLabel: "Program notu",
        summary: "Battaniye, giyim ve yakacak destekleri için bölge bazlı ihtiyaç hazırlığı yapıldı."
      }
    ],
    coverTone: "from-[#0F2547] via-[#1F8083] to-[#F8FAFB]",
    relatedProjectSlugs: ["bir-koli-bir-umut", "kis-gelmeden", "yetim-cocuklara-egitim-destegi"]
  }
];

export const regionFallbackProjects = fallbackProjects.filter((project) =>
  projectRegions.some((region) => region.relatedProjectSlugs.includes(project.slug))
);

export function getProjectRegionBySlug(slug?: string | null) {
  if (!slug) return undefined;
  return projectRegions.find((region) => region.slug === slug);
}

function normalize(value: string | null | undefined) {
  return (value ?? "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const regionMatchRules: Array<{ slug: ProjectRegionSlug; keywords: string[] }> = [
  {
    slug: "gazze",
    keywords: ["gazze", "gaza", "filistin", "palestine", "qurban", "kurban"]
  },
  {
    slug: "lubnan",
    keywords: ["lubnan", "lebanon", "lbnan", "multeci", "refugee"]
  },
  {
    slug: "misir",
    keywords: ["misir", "egypt", "lojistik", "gecis", "saglik", "temiz su", "water"]
  },
  {
    slug: "turkiye",
    keywords: ["turkiye", "turkey", "konya", "istanbul", "anadolu", "deprem", "aile destek", "kis"]
  }
];

export function isProjectRegionCategory(value: string): value is ProjectRegionCategory {
  return value in projectRegionCategoryLabels;
}

export function inferProjectRegion(project: Pick<Project, "slug" | "title" | "category" | "location" | "tags">) {
  const haystack = normalize([project.slug, project.title, project.category, project.location, ...(project.tags ?? [])].join(" "));
  const match = regionMatchRules.find((rule) => rule.keywords.some((keyword) => haystack.includes(normalize(keyword))));

  return getProjectRegionBySlug(match?.slug ?? "turkiye");
}

export function enrichProjectWithRegion(project: Project): Project {
  const explicitRegion = getProjectRegionBySlug(project.regionSlug);
  const region = explicitRegion ?? (project.regionSlug ? undefined : inferProjectRegion(project));
  if (!region) return project;

  return {
    ...project,
    regionSlug: region.slug,
    regionName: region.name,
    country: project.country ?? region.country
  };
}

export function mergeProjectsWithRegionalFallbacks(projects: Project[]) {
  const seen = new Set(projects.map((project) => project.slug));
  const merged = [
    ...projects,
    ...regionFallbackProjects.filter((project) => !seen.has(project.slug))
  ];

  return merged.map((project) => enrichProjectWithRegion(project));
}

export function getProjectsForRegion(projects: Project[], regionSlug: ProjectRegion["slug"]) {
  const region = getProjectRegionBySlug(regionSlug);
  return mergeProjectsWithRegionalFallbacks(projects).filter((project) => {
    if (project.regionSlug === regionSlug) return true;
    return region?.relatedProjectSlugs.includes(project.slug) ?? false;
  });
}
