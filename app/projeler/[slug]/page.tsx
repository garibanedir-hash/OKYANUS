import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, ClipboardCheck, HandHeart, MapPin, ShieldCheck } from "lucide-react";
import { projects as fallbackProjects } from "@/data/projects";
import { formatCurrency } from "@/lib/format";
import { getPublicProjectActivities } from "@/lib/data/projectActivityRepository";
import { getProjectBySlug, getProjects } from "@/lib/data/projectsRepository";
import { getProjectRegionBySlug } from "@/lib/data/projectRegionRepository";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { MetricCard } from "@/components/ui/MetricCard";
import { InfoBlock } from "@/components/ui/InfoBlock";
import { Timeline } from "@/components/ui/Timeline";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectActivityTimeline } from "@/components/project/ProjectActivityTimeline";
import { VisualPlaceholder } from "@/components/VisualPlaceholder";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return fallbackProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  return {
    title: project?.title ?? "Proje Detayı",
    description: project?.summary ?? "Okyanus Derneği proje detay sayfası."
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const progress = project.goal > 0 ? Math.min(Math.round((project.raised / project.goal) * 100), 100) : 0;
  const heroImageUrl = project.coverImageUrl || project.thumbnailUrl;
  const [projects, activities, region] = await Promise.all([
    getProjects(),
    getPublicProjectActivities(project.id),
    getProjectRegionBySlug(project.regionSlug)
  ]);
  const similar = projects.filter((item) => item.slug !== project.slug && item.category === project.category).slice(0, 3);
  const fallbackSimilar = similar.length ? similar : projects.filter((item) => item.slug !== project.slug).slice(0, 3);

  return (
    <>
      <section className="ocean-surface relative overflow-hidden py-14 sm:py-20">
        <div className="absolute inset-0 wave-grid opacity-40" />
        <Container className="relative grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <Badge variant="light">{project.category}</Badge>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-dark-navy sm:text-5xl">{project.title}</h1>
            <p className="mt-5 text-lg leading-8 text-ink-muted">{project.summary}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {region ? <Badge variant="light">{region.name} · {region.country}</Badge> : null}
              <Badge variant="green">{project.status}</Badge>
              <Badge variant="blue">{project.location}</Badge>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href={project.cta.href} showIcon>
                {project.cta.label}
              </Button>
              <Button href="/projeler" variant="ghost">
                Tüm Projeler
              </Button>
            </div>
          </div>
          <div className="rounded-[1.75rem] bg-white p-4 shadow-soft">
            {heroImageUrl ? (
              <div
                className="h-80 rounded-[1.35rem] bg-cover bg-center"
                style={{ backgroundImage: `url("${heroImageUrl}")` }}
                aria-label={`${project.title} proje görseli`}
              />
            ) : (
              <VisualPlaceholder label={project.category} className={`h-80 rounded-[1.35rem] bg-gradient-to-br ${project.visualTone}`} />
            )}
          </div>
        </Container>
      </section>

      <section className="bg-warm-white py-16">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1fr_0.42fr]">
            <div className="grid gap-6">
              <div className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-ink-muted">Ulaşılan destek</p>
                    <p className="mt-1 text-2xl font-extrabold text-deep-blue">{formatCurrency(project.raised)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink-muted">Hedeflenen destek</p>
                    <p className="mt-1 text-2xl font-extrabold text-dark-navy">{formatCurrency(project.goal)}</p>
                  </div>
                </div>
                <ProgressBar value={progress} label={`${progress}% tamamlandı`} className="mt-6" />
              </div>

              <InfoBlock icon={HandHeart} title="Bu proje ne için var?">
                <p>{project.detail}</p>
              </InfoBlock>

              <InfoBlock icon={ClipboardCheck} title="Bu destek neye dönüşür?">
                <div className="flex flex-wrap gap-2">
                  {project.impactItems.map((item) => (
                    <Badge key={item} variant="green">{item}</Badge>
                  ))}
                </div>
              </InfoBlock>

              <InfoBlock icon={CalendarDays} title="Proje kapsamında neler yapılıyor?">
                <Timeline items={project.scopeItems} />
              </InfoBlock>

              <InfoBlock icon={ShieldCheck} title="Şeffaflık notu">
                <p>{project.transparencyNote}</p>
              </InfoBlock>
            </div>

            <aside className="grid gap-5 self-start">
              <div className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
                <h2 className="text-xl font-bold text-dark-navy">Proje bilgileri</h2>
                <dl className="mt-5 grid gap-4 text-sm">
                  <div className="flex gap-3">
                    <MapPin aria-hidden className="h-5 w-5 text-ocean-green" />
                    <div><dt className="font-bold text-dark-navy">Lokasyon</dt><dd className="text-ink-muted">{project.location}</dd></div>
                  </div>
                  {region ? (
                    <div>
                      <dt className="font-bold text-dark-navy">Çalışma Bölgesi</dt>
                      <dd className="text-ink-muted">{region.name} · {region.regionLabel}</dd>
                    </div>
                  ) : null}
                  <div><dt className="font-bold text-dark-navy">Başlangıç</dt><dd className="text-ink-muted">{project.startDate}</dd></div>
                  <div><dt className="font-bold text-dark-navy">Güncelleme</dt><dd className="text-ink-muted">{project.updatedAt}</dd></div>
                  <div><dt className="font-bold text-dark-navy">Durum</dt><dd className="text-ink-muted">{project.status}</dd></div>
                </dl>
              </div>
              <div className="grid gap-4">
                {project.metrics.map((metric) => (
                  <MetricCard key={metric.label} {...metric} />
                ))}
              </div>
            </aside>
          </div>

          <ProjectActivityTimeline activities={activities} />

          <section className="mt-16">
            <h2 className="text-3xl font-bold text-dark-navy">Benzer projeler</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {fallbackSimilar.map((item) => (
                <ProjectCard key={item.slug} {...item} />
              ))}
            </div>
          </section>
        </Container>
      </section>
    </>
  );
}
