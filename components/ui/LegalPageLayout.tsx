import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/sections/PageHero";

export function LegalPageLayout({
  title,
  description,
  sections
}: {
  title: string;
  description: string;
  sections: Array<{ title: string; content: string }>;
}) {
  return (
    <>
      <PageHero eyebrow="Yasal Bilgilendirme" title={title} description={description} />
      <section className="bg-warm-white py-16">
        <Container className="max-w-4xl">
          <div className="rounded-2xl border border-warm-accent/30 bg-warm-accent/10 p-5 text-sm font-semibold leading-7 text-dark-navy">
            Taslak metindir. Resmi kullanım öncesinde hukuki danışmanlıkla gözden geçirilmelidir.
          </div>
          <div className="mt-8 grid gap-5">
            {sections.map((section) => (
              <section key={section.title} className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
                <h2 className="text-2xl font-bold text-dark-navy">{section.title}</h2>
                <p className="mt-3 leading-8 text-ink-muted">{section.content}</p>
              </section>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
