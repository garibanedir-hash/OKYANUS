import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ShieldCheck } from "lucide-react";
import { getLegalPagePath, legalPages } from "@/data/legalPages";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/sections/PageHero";

export const metadata: Metadata = {
  title: "Hukuki Bilgilendirme",
  description: "Okyanus İnsani Yardım Derneği KVKK, açık rıza, gizlilik, çerez, bağış ve form aydınlatma metinleri.",
  alternates: {
    canonical: "/hukuki"
  }
};

export default function LegalIndexPage() {
  return (
    <>
      <PageHero
        eyebrow="Hukuki Bilgilendirme"
        title="Gizlilik, KVKK ve bağış süreçleri"
        description="Web sitesi, başvuru ve destek süreçlerine ilişkin temel bilgilendirme metinlerine bu alandan ulaşabilirsiniz."
      />
      <section className="bg-warm-white py-16 sm:py-20">
        <Container>
          <div className="grid gap-5 md:grid-cols-2">
            {legalPages.map((page) => (
              <Link
                key={page.slug}
                href={getLegalPagePath(page.slug)}
                className="focus-ring group rounded-brand border border-border-soft bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-soft"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-soft-blue text-deep-blue">
                  {page.slug.includes("kvkk") || page.slug.includes("gizlilik") ? (
                    <ShieldCheck aria-hidden className="h-6 w-6" />
                  ) : (
                    <FileText aria-hidden className="h-6 w-6" />
                  )}
                </span>
                <h2 className="mt-5 text-2xl font-bold text-dark-navy">{page.title}</h2>
                <p className="mt-3 text-sm leading-7 text-ink-muted">{page.description}</p>
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-ink-muted">Son güncelleme: {page.lastUpdated}</p>
                <span className="mt-5 inline-flex text-sm font-extrabold text-ocean-green group-hover:text-deep-blue">
                  Sayfayı İncele
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
