import type { Metadata } from "next";
import { AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/sections/PageHero";
import { getActiveSponsorshipPrograms } from "@/lib/data/orphanSponsorshipRepository";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = {
  title: "Yetim Hamiliği Başvurusu",
  description: "Yetim hamiliği için demo ön başvuru formu. Gerçek ödeme ve düzenli talimat bu aşamada oluşturulmaz."
};

type OrphanSponsorshipApplicationPageProps = {
  searchParams?: Promise<{ durum?: string; program?: string }>;
};

export default async function OrphanSponsorshipApplicationPage({ searchParams }: OrphanSponsorshipApplicationPageProps) {
  const params = await searchParams;
  const programs = await getActiveSponsorshipPrograms();
  const selectedProgram = programs.find((program) => program.slug === params?.program) ?? programs[0];
  const success = params?.durum === "hazirlandi";

  return (
    <>
      <PageHero
        eyebrow="Yetim Hamiliği Başvurusu"
        title="Düzenli destek niyetinizi güvenli şekilde iletin"
        description="Bu form demo ön başvuru akışıdır. Ödeme, düzenli ödeme talimatı ve gerçek sponsorluk eşleşmesi sonraki aşamada aktif hale getirilecektir."
      />

      <section className="bg-soft-gray py-16 sm:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-start">
            {success ? (
              <div className="rounded-brand border border-ocean-green/20 bg-white p-6 shadow-card">
                <div className="rounded-lg bg-mint-green/50 p-4">
                  <CheckCircle2 aria-hidden className="h-7 w-7 text-ocean-green" />
                  <h2 className="mt-4 text-2xl font-extrabold text-dark-navy">Yetim hamiliği başvurunuz alınmaya hazırlanmıştır.</h2>
                  <p className="mt-3 text-sm font-semibold leading-7 text-ink-muted">
                    Ödeme ve düzenli destek altyapısı tamamlandığında süreç aktif hale getirilecektir.
                  </p>
                </div>
                <div className="mt-5 grid gap-3 text-sm font-semibold leading-6 text-ink-muted">
                  <p>Bu aşamada gerçek sponsorluk kaydı, ödeme talimatı veya makbuz oluşturulmadı.</p>
                  <p>Başvuru deneyimi çocuk mahremiyetini koruyan sponsorluk akışına hazırlık olarak sunulur.</p>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button href="/yetim-hamiligi" variant="secondary">
                    Programa Dön
                  </Button>
                  <Button href="/panel/yetim-sponsorluk" variant="ghost">
                    Panel Önizleme
                  </Button>
                </div>
              </div>
            ) : (
              <form method="get" action="/yetim-hamiligi/basvuru" className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
                <input type="hidden" name="durum" value="hazirlandi" />
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="text-sm font-bold text-dark-navy">
                    Sponsorluk programı
                    <select name="program" defaultValue={selectedProgram?.slug} required className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3">
                      {programs.map((program) => (
                        <option key={program.id} value={program.slug}>
                          {program.title} · {formatCurrency(program.monthlyAmount)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-bold text-dark-navy">
                    Aylık destek tutarı
                    <input name="amount" type="number" min="1" defaultValue={selectedProgram?.monthlyAmount ?? 1250} required className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" />
                  </label>
                  <label className="text-sm font-bold text-dark-navy">
                    Ad soyad
                    <input name="fullName" required className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" placeholder="Ad soyad" />
                  </label>
                  <label className="text-sm font-bold text-dark-navy">
                    E-posta
                    <input name="email" type="email" required className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" placeholder="ornek@example.org" />
                  </label>
                  <label className="text-sm font-bold text-dark-navy">
                    Telefon
                    <input name="phone" required className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" placeholder="+90 5** *** ** **" />
                  </label>
                  <label className="text-sm font-bold text-dark-navy">
                    Şehir
                    <input name="city" className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" placeholder="İl bilgisi" />
                  </label>
                  <label className="text-sm font-bold text-dark-navy">
                    Destek periyodu
                    <select name="period" defaultValue="monthly" className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3">
                      <option value="monthly">Aylık destek</option>
                      <option value="quarterly">3 aylık takip</option>
                      <option value="yearly">Yıllık planlama</option>
                    </select>
                  </label>
                  <label className="text-sm font-bold text-dark-navy md:col-span-2">
                    Not
                    <textarea name="note" rows={4} maxLength={500} className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" placeholder="Destek tercihiniz veya bilgilendirme notunuz" />
                  </label>
                </div>
                <div className="mt-5 grid gap-3">
                  <label className="flex items-start gap-3 text-sm font-semibold leading-6 text-ink-muted">
                    <input name="kvkkAccepted" type="checkbox" required className="mt-1 h-4 w-4 accent-ocean-green" />
                    KVKK bilgilendirmesini okudum ve başvuru bilgilerimin bu süreç için işlenmesini kabul ediyorum.
                  </label>
                  <label className="flex items-start gap-3 text-sm font-semibold leading-6 text-ink-muted">
                    <input name="contactPermission" type="checkbox" className="mt-1 h-4 w-4 accent-ocean-green" />
                    Yetim hamiliği süreciyle ilgili bilgilendirme almak istiyorum.
                  </label>
                </div>
                <button type="submit" className="focus-ring mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ocean-green px-5 py-3 text-sm font-extrabold text-white transition hover:bg-deep-blue">
                  Demo Başvuruyu Hazırla
                </button>
              </form>
            )}

            <aside className="grid gap-5">
              <div className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
                <div className="flex items-start gap-3">
                  <AlertCircle aria-hidden className="mt-1 h-5 w-5 text-ocean-green" />
                  <div>
                    <h2 className="text-xl font-extrabold text-dark-navy">Gerçek ödeme henüz yok</h2>
                    <p className="mt-2 text-sm leading-7 text-ink-muted">
                      Bu form sponsor başvuru deneyimini hazırlar. Gerçek sponsorluk kaydı, düzenli ödeme, makbuz, SMS/e-posta ve dosya yükleme bu aşamada yapılmaz.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border-soft bg-white p-5 shadow-sm">
                <ShieldCheck aria-hidden className="h-5 w-5 text-ocean-green" />
                <h3 className="mt-3 font-extrabold text-dark-navy">Mahremiyet notu</h3>
                <p className="mt-2 text-sm leading-6 text-ink-muted">
                  Sponsor başvurusu çocuklara ait açık kimlik, adres, okul adı, telefon veya aile detayı göstermez.
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
