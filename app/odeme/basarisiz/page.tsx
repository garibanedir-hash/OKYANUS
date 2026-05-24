import type { Metadata } from "next";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Ödeme Sonucu Kontrol Ediliyor",
  description: "PayTR başarısız dönüş bilgilendirme sayfası."
};

export default function PaymentFailedReturnPage() {
  return (
    <main className="bg-soft-gray py-16 sm:py-20">
      <Container>
        <section className="mx-auto max-w-2xl rounded-brand border border-warm-accent/25 bg-white p-8 text-center shadow-card">
          <AlertTriangle aria-hidden className="mx-auto h-10 w-10 text-warm-accent" />
          <h1 className="mt-5 text-3xl font-extrabold text-dark-navy">Ödeme sonucunuz kontrol ediliyor</h1>
          <p className="mt-4 leading-7 text-ink-muted">
            PayTR başarısız dönüş sayfasına geldiniz. Kesin durum sistem tarafından arka planda Bildirim URL callback’i ile doğrulanacaktır.
          </p>
          <div className="mt-6 rounded-lg bg-warm-accent/10 p-4 text-sm font-semibold leading-6 text-ink-muted">
            Bu sayfa sipariş veya bağış iptali yapmaz; iptal/başarısız durum yalnızca hash doğrulaması yapılmış callback sonrası kaydedilir.
          </div>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button href="/panel/bagislarim" variant="secondary">Bağışlarım</Button>
            <Button href="/" variant="ghost">Ana Sayfa</Button>
          </div>
          <ShieldCheck aria-hidden className="mx-auto mt-8 h-5 w-5 text-ocean-green" />
        </section>
      </Container>
    </main>
  );
}

