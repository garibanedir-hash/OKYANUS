import type { MetadataRoute } from "next";
import { getLegalPagePath, legalPages } from "@/data/legalPages";
import { getNewsPosts } from "@/lib/data/newsRepository";
import { getProjects } from "@/lib/data/projectsRepository";
import { getActiveQurbanCampaigns } from "@/lib/data/qurbanRepository";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.okyanus.org.tr";

function entry(path: string, priority = 0.7): MetadataRoute.Sitemap[number] {
  return {
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, news, qurbanCampaigns] = await Promise.all([
    getProjects(),
    getNewsPosts(),
    getActiveQurbanCampaigns()
  ]);

  return [
    entry("/", 1),
    entry("/hakkimizda", 0.85),
    entry("/tuzuk", 0.65),
    entry("/sss", 0.65),
    entry("/projeler", 0.9),
    entry("/faaliyetler", 0.8),
    entry("/kurban", 0.8),
    entry("/yetim-hamiligi", 0.8),
    entry("/bagis-yap", 0.75),
    entry("/gonullu-ol", 0.75),
    entry("/iletisim", 0.75),
    entry("/seffaflik", 0.75),
    entry("/faaliyet-raporlari", 0.7),
    entry("/hukuki", 0.55),
    ...legalPages.map((page) => entry(getLegalPagePath(page.slug), 0.5)),
    ...projects.map((project) => entry(`/projeler/${project.slug}`, 0.78)),
    ...news.map((item) => entry(`/haberler/${item.slug}`, 0.65)),
    ...qurbanCampaigns.map((campaign) => entry(`/kurban/${campaign.slug}`, 0.68))
  ];
}
