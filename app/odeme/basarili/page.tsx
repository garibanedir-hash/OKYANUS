import type { Metadata } from "next";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Ödeme Sonucu Kontrol Ediliyor",
  description: "PayTR başarılı dönüş bilgilendirme sayfası."
};

export default function PaymentSuccessReturnPage() {
  return (
    <main className="bg-soft-gray py-16 sm:py-20">
      <Container>
        <section className="mx-auto max-w-2xl rounded-brand border border-ocean-green/20 bg-white p-8 text-center shadow-card">
          <CheckCircle2 aria-hidden className="mx-auto h-10 w-10 text-ocean-green" />
          <h1 className="mt-5 text-3xl font-extrabold text-dark-navy">Ödeme sonucunuz kontrol ediliyor</h1>
          <p className="mt-4 leading-7 text-ink-muted">
            PayTR başarılı dönüş sayfasına geldiniz. Kesin ödeme durumu sistem tarafından arka planda Bildirim URL callback’i ile doğrulanacaktır.
          </p>
          <div className="mt-6 rounded-lg bg-soft-blue p-4 text-sm font-semibold leading-6 text-deep-blue">
            Bu sayfa sipariş veya bağış onayı yapmaz; onay yalnızca hash doğrulaması yapılmış callback sonrası kaydedilir.
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

