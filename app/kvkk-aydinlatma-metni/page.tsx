import type { Metadata } from "next";
import { legalPages } from "@/data/legalPages";
import { LegalPageLayout } from "@/components/ui/LegalPageLayout";

const page = legalPages.find((item) => item.slug === "kvkk-aydinlatma-metni")!;

export const metadata: Metadata = {
  title: page.title,
  description: page.description
};

export default function KvkkPage() {
  return <LegalPageLayout {...page} />;
}
