import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLegalPageBySlug, getLegalPagePath, legalPages } from "@/data/legalPages";
import { LegalPageLayout } from "@/components/ui/LegalPageLayout";

type LegalDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return legalPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: LegalDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getLegalPageBySlug(slug);

  if (!page) {
    return {
      title: "Hukuki Sayfa Bulunamadı"
    };
  }

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: getLegalPagePath(page.slug)
    },
    openGraph: {
      title: page.title,
      description: page.description,
      type: "article"
    }
  };
}

export default async function LegalDetailPage({ params }: LegalDetailPageProps) {
  const { slug } = await params;
  const page = getLegalPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return <LegalPageLayout {...page} />;
}
