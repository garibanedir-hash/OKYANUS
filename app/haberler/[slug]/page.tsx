import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { news as fallbackNews } from "@/data/news";
import { activities } from "@/data/activities";
import { getNewsPostBySlug, getNewsPosts } from "@/lib/data/newsRepository";
import { getProjects } from "@/lib/data/projectsRepository";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { NewsCard } from "@/components/NewsCard";
import { Badge } from "@/components/ui/Badge";

export function generateStaticParams() {
  return fallbackNews.map((item) => ({ slug: item.slug }));
}

type NewsPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getNewsPostBySlug(slug);
  return {
    title: item?.title ?? "Haber",
    description: item?.summary ?? "Okyanus Derneği haber detayı."
  };
}

export default async function NewsDetailPage({ params }: NewsPageProps) {
  const { slug } = await params;
  const item = await getNewsPostBySlug(slug);

  if (!item) {
    notFound();
  }

  const [news, projects] = await Promise.all([getNewsPosts(), getProjects()]);
  const related = news.filter((entry) => entry.slug !== slug).slice(0, 2);
  const relatedProject = projects.find((project) => project.slug === item.relatedProjectSlug);
  const relatedActivity = activities.find((activity) => activity.slug === item.relatedActivitySlug);

  return (
    <article className="bg-warm-white py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ocean-green">{item.category} / {item.date}</p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight text-dark-navy sm:text-5xl">{item.title}</h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">{item.summary}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="blue">{tag}</Badge>
            ))}
          </div>
          <div className="mt-10 rounded-[1.75rem] bg-soft-gray p-7 leading-8 text-slate-700">
            <p>{item.content}</p>
            <p className="mt-4">
              Bu detay sayfası CMS entegrasyonuna hazır bir içerik modeliyle çalışır; görsel galeri, rapor bağlantısı ve ilgili proje alanları sonraki aşamada gerçek veriye bağlanabilir.
            </p>
          </div>
          {(relatedProject || relatedActivity) ? (
            <div className="mt-8 rounded-brand border border-border-soft bg-white p-6 shadow-card">
              <h2 className="text-xl font-bold text-dark-navy">İlgili bağlantılar</h2>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                {relatedProject ? (
                  <Button href={`/projeler/${relatedProject.slug}`} variant="ghost" showIcon>
                    İlgili Proje
                  </Button>
                ) : null}
                {relatedActivity ? (
                  <Button href="/faaliyetler" variant="ghost" showIcon>
                    İlgili Faaliyet Alanı
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
          <Button href="/haberler" variant="ghost" className="mt-8">
            Haberlere Dön
          </Button>
        </div>
        {related.length ? (
          <section className="mt-16 border-t border-slate-200 pt-10">
            <h2 className="text-2xl font-bold text-dark-navy">İlgili haberler</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {related.map((entry) => (
                <NewsCard key={entry.slug} {...entry} />
              ))}
            </div>
          </section>
        ) : null}
      </Container>
    </article>
  );
}
