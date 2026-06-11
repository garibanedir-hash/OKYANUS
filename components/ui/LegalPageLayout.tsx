import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/sections/PageHero";
import type { LegalSection } from "@/data/legalPages";

export function LegalPageLayout({
  title,
  description,
  lastUpdated,
  sections
}: {
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <PageHero eyebrow="Yasal Bilgilendirme" title={title} description={description} />
      <section className="bg-warm-white py-16">
        <Container className="max-w-4xl">
          <div className="rounded-2xl border border-primary-blue/15 bg-soft-blue p-5 text-sm font-semibold leading-7 text-dark-navy">
            <p>Son güncelleme: {lastUpdated}</p>
            <p className="mt-2 text-ink-muted">
              Bu sayfa bilgilendirme amacıyla hazırlanmıştır. Detaylı talepleriniz için dernek resmi iletişim kanallarından bize ulaşabilirsiniz.
            </p>
          </div>
          <div className="mt-8 grid gap-5">
            {sections.map((section) => (
              <section key={section.title} className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
                <h2 className="text-2xl font-bold text-dark-navy">{section.title}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-3 leading-8 text-ink-muted">
                    {paragraph}
                  </p>
                ))}
                {section.items ? (
                  <ul className="mt-4 grid gap-3 text-sm font-semibold leading-7 text-ink-muted">
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span aria-hidden className="mt-2 h-2 w-2 shrink-0 rounded-full bg-ocean-green" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
