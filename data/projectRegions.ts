import type { Project } from "@/data/projects";
import { projects as fallbackProjects } from "@/data/projects";

export type ProjectRegion = {
  id: string;
  slug: "gazze" | "lubnan" | "misir" | "turkiye";
  name: string;
  country: string;
  regionLabel: string;
  shortDescription: string;
  focusAreas: string[];
  mapPosition: { x: number; y: number };
  priorityLabel: string;
  operatingModel: string;
  activeProjectCount: number;
  beneficiaryEstimate: string;
  coverTone: string;
  relatedProjectSlugs: string[];
};

export const projectRegions: ProjectRegion[] = [
  {
    id: "region-gaza",
    slug: "gazze",
    name: "Gazze",
    country: "Filistin",
    regionLabel: "Doğu Akdeniz kriz hattı",
    shortDescription:
      "Acil gıda, sağlık, hijyen ve barınma desteğinin önceliklendirildiği saha hattı.",
    focusAreas: ["Acil yardım", "Gıda", "Sağlık", "Barınma"],
    mapPosition: { x: 59, y: 57 },
    priorityLabel: "Kriz müdahalesi",
    operatingModel: "Yerel temas + lojistik teyit + dönemsel raporlama",
    activeProjectCount: 2,
    beneficiaryEstimate: "8.000+ kişi hedefi",
    coverTone: "from-soft-blue via-warm-white to-mint-green",
    relatedProjectSlugs: ["gazze-acil-yardim", "kurban-organizasyonu", "temiz-suya-ulasim"]
  },
  {
    id: "region-lebanon",
    slug: "lubnan",
    name: "Lübnan",
    country: "Lübnan",
    regionLabel: "Mülteci ve aile destek hattı",
    shortDescription:
      "Mülteci aileler, eğitim desteği ve temel gıda ihtiyaçları için sürdürülebilir programlar.",
    focusAreas: ["Mülteci destekleri", "Gıda", "Eğitim"],
    mapPosition: { x: 57, y: 47 },
    priorityLabel: "Aile ve eğitim desteği",
    operatingModel: "Programlı yardım + aile takibi + eğitim materyali",
    activeProjectCount: 1,
    beneficiaryEstimate: "1.200+ çocuk ve aile",
    coverTone: "from-mint-green via-soft-blue to-warm-white",
    relatedProjectSlugs: ["yetim-cocuklara-egitim-destegi", "bir-koli-bir-umut"]
  },
  {
    id: "region-egypt",
    slug: "misir",
    name: "Mısır",
    country: "Mısır",
    regionLabel: "Lojistik ve geçiş destekleri",
    shortDescription:
      "Lojistik hazırlık, sağlık ve geçiş destekleriyle bölgesel insani yardım akışını güçlendiren hat.",
    focusAreas: ["Lojistik", "Sağlık", "Geçiş destekleri"],
    mapPosition: { x: 52, y: 67 },
    priorityLabel: "Lojistik hazırlık",
    operatingModel: "Geçiş desteği + sağlık/hijyen lojistiği",
    activeProjectCount: 1,
    beneficiaryEstimate: "2.400+ faydalanıcı",
    coverTone: "from-soft-blue via-warm-white to-soft-gray",
    relatedProjectSlugs: ["temiz-suya-ulasim", "gazze-acil-yardim"]
  },
  {
    id: "region-turkey",
    slug: "turkiye",
    name: "Türkiye",
    country: "Türkiye",
    regionLabel: "Merkez, afet ve sosyal destek ağı",
    shortDescription:
      "Sosyal destek, afet yardımı, yetim ve aile destekleri için merkez ve saha koordinasyonu.",
    focusAreas: ["Sosyal destek", "Afet yardımı", "Yetim", "Aile destekleri"],
    mapPosition: { x: 49, y: 37 },
    priorityLabel: "Merkez koordinasyon",
    operatingModel: "Merkez ekip + saha gönüllüleri + sosyal destek ağı",
    activeProjectCount: 2,
    beneficiaryEstimate: "3.500+ aile hedefi",
    coverTone: "from-mint-green via-soft-blue to-warm-white",
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
  return (value ?? "").toLocaleLowerCase("tr-TR");
}

export function inferProjectRegion(project: Pick<Project, "slug" | "title" | "category" | "location" | "tags">) {
  const haystack = normalize([project.slug, project.title, project.category, project.location, ...(project.tags ?? [])].join(" "));

  if (haystack.includes("gazze") || haystack.includes("filistin") || haystack.includes("kurban")) {
    return getProjectRegionBySlug("gazze");
  }
  if (haystack.includes("lübnan") || haystack.includes("lubnan") || haystack.includes("mülteci")) {
    return getProjectRegionBySlug("lubnan");
  }
  if (haystack.includes("mısır") || haystack.includes("misir") || haystack.includes("lojistik") || haystack.includes("temiz su")) {
    return getProjectRegionBySlug("misir");
  }
  if (haystack.includes("türkiye") || haystack.includes("turkiye") || haystack.includes("istanbul") || haystack.includes("anadolu") || haystack.includes("kış")) {
    return getProjectRegionBySlug("turkiye");
  }

  return getProjectRegionBySlug("turkiye");
}

export function enrichProjectWithRegion(project: Project): Project {
  const region = getProjectRegionBySlug(project.regionSlug) ?? inferProjectRegion(project);
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
