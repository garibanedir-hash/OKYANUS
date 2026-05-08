import { getUserSupportedProjects } from "@/lib/data/portalRepository";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default function PortalProjectsPage() {
  const projects = getUserSupportedProjects();

  return (
    <div className="grid gap-6">
      <section className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ocean-green">Kişisel proje görünümü</p>
        <h1 className="mt-2 text-3xl font-extrabold text-dark-navy">Projeler</h1>
        <p className="mt-2 leading-7 text-ink-muted">Public proje listesinden farklı olarak desteklediğiniz, gönüllü olabileceğiniz ve size önerilen projeleri gösterir.</p>
      </section>
      <section className="grid gap-5 md:grid-cols-2">
        {projects.map((project) => (
          <article key={project.slug} className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
            <span className="rounded-full bg-soft-blue px-3 py-1 text-xs font-bold text-deep-blue">{project.relation}</span>
            <h2 className="mt-3 text-xl font-bold text-dark-navy">{project.title}</h2>
            <p className="mt-2 text-sm font-semibold text-ink-muted">{project.status}</p>
            <div className="mt-4"><ProgressBar value={project.progress} /></div>
            <div className="mt-5 flex gap-2"><Button href="/bagis-yap" showIcon>Bağış Yap</Button><Button href="/gonullu-ol" variant="ghost">Gönüllü Ol</Button></div>
          </article>
        ))}
      </section>
    </div>
  );
}
