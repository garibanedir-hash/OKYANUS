"use client";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { OfficialLogo } from "@/components/brand/OfficialLogo";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="bg-warm-white py-20 sm:py-28">
      <Container className="grid min-h-[58vh] place-items-center">
        <div className="max-w-xl text-center">
          <OfficialLogo variant="color" context="header" className="mx-auto max-w-[260px]" />
          <p className="mt-8 text-sm font-extrabold uppercase tracking-[0.18em] text-ocean-green">Bir sorun oluştu</p>
          <h1 className="mt-3 text-4xl font-extrabold text-dark-navy sm:text-5xl">Sayfayı şu anda gösteremiyoruz</h1>
          <p className="mt-5 text-base leading-8 text-ink-muted">
            Kısa süre sonra yeniden deneyebilir veya iletişim sayfası üzerinden bize ulaşabilirsiniz.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={reset}>Tekrar Dene</Button>
            <Button href="/" variant="ghost" showIcon>Ana Sayfa</Button>
            <Button href="/iletisim" variant="ghost">İletişim</Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
