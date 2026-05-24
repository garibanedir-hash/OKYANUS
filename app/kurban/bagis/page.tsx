import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, CheckCircle2, FileCheck2, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/sections/PageHero";
import { getActiveQurbanCampaigns } from "@/lib/data/qurbanRepository";
import { createQurbanOrderAction } from "@/app/kurban/bagis/actions";
import { QurbanDonationForm } from "@/app/kurban/bagis/QurbanDonationForm";
import { getCurrentQurbanDonorContext } from "@/lib/data/qurbanWriteRepository";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = {
  title: "Kurban Bağışı",
  description: "Kurban bağışı için vekalet, başvuru ve hisse rezervasyon formu. Ödeme entegrasyonu henüz kapalıdır."
};

type QurbanDonationPageProps = {
  searchParams?: Promise<{
    durum?: string;
    kampanya?: string;
    campaign?: string;
    siparis?: string;
    adet?: string;
    tutar?: string;
    mesaj?: string;
    odeme?: string;
    odeme_hata?: string;
  }>;
};

export default async function QurbanDonationDemoPage({ searchParams }: QurbanDonationPageProps) {
  const params = await searchParams;
  const campaigns = await getActiveQurbanCampaigns();
  const selectedSlug = params?.kampanya ?? params?.campaign;
  const donorContext = await getCurrentQurbanDonorContext();
  const donorDefaults = donorContext?.account
    ? {
        fullName: donorContext.account.full_name,
        email: donorContext.account.email,
        phone: donorContext.account.phone ?? "",
        city: donorContext.account.city ?? ""
      }
    : undefined;
  const success = params?.durum === "basarili" || params?.durum === "alindi";
  const totalAmount = Number(params?.tutar ?? 0);

  return (
    <>
      <PageHero
        eyebrow="Kurban Başvurusu"
        title="Kurban bağışı ve vekalet akışı"
        description="Kurban bağış başvurunuz alınır, vekalet kabulünüz kaydedilir ve seçtiğiniz hisse/adet ödeme bekliyor durumunda takip edilir."
      />

      <section className="bg-soft-gray py-16 sm:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-start">
            {success ? (
              <div className="rounded-brand border border-ocean-green/20 bg-white p-6 shadow-card">
                <div className="rounded-lg bg-mint-green/50 p-4">
                  <CheckCircle2 aria-hidden className="h-7 w-7 text-ocean-green" />
                  <h2 className="mt-4 text-2xl font-extrabold text-dark-navy">Kurban bağış başvurunuz alınmıştır.</h2>
                  {params?.siparis ? (
                    <p className="mt-3 text-lg font-black text-deep-blue">Sipariş No: {params.siparis}</p>
                  ) : null}
                  <p className="mt-3 text-sm font-semibold leading-7 text-ink-muted">
                    Vekalet kabulünüz ve başvuru bilgileriniz kurban kayıt akışına alınmıştır.
                  </p>
                </div>
                <div className="mt-5 grid gap-3 text-sm font-semibold leading-6 text-ink-muted">
                  {params?.adet ? <p>Rezerve edilen hisse/adet: <strong className="text-dark-navy">{params.adet}</strong></p> : null}
                  {totalAmount > 0 ? <p>Ödeme bekleyen tutar: <strong className="text-dark-navy">{formatCurrency(totalAmount)}</strong></p> : null}
                  <p>Vekalet durumu: <strong className="text-dark-navy">Kaydedildi</strong></p>
                  <p>Ödeme durumu: <strong className="text-dark-navy">Ödeme bekliyor</strong></p>
                  {params?.odeme ? (
                    <p>Ödeme No: <strong className="text-dark-navy">{params.odeme}</strong></p>
                  ) : null}
                  {params?.odeme_hata === "1" ? (
                    <p>Ödeme bağlantısı şu anda oluşturulamadı; başvurunuz alındı ve yönetim ekranından tekrar hazırlanabilir.</p>
                  ) : (
                    <p>Ortak payment intent oluşturuldu; PayTR test ödeme sayfasında canlı tahsilat yapılmadan güvenli test akışı başlatılır.</p>
                  )}
                  <p>PayTR test entegrasyonunda sipariş durumu yalnızca doğrulanmış callback sonrası ilerletilecektir.</p>
                  <p>Başvurunuz dernek yönetim ekranlarında kayıt altına alınmıştır.</p>
                  <p>Bağışçı hesabınızla giriş yaptıysanız kayıt Kurbanlarım panelinde listelenebilir.</p>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  {params?.odeme ? (
                    <Link href={`/odeme/paytr/${params.odeme}`} className="focus-ring inline-flex min-h-11 items-center justify-center rounded-full bg-ocean-green px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-deep-blue">
                      Ödemeye Devam Et
                    </Link>
                  ) : null}
                  <Link href="/panel/kurbanlarim" className="focus-ring inline-flex min-h-11 items-center justify-center rounded-full bg-deep-blue px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-dark-navy">
                    Kurbanlarım
                  </Link>
                  <Link href="/kurban" className="focus-ring inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-extrabold text-deep-blue ring-1 ring-border-soft transition hover:bg-soft-blue">
                    Kurban Çalışmaları
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                {params?.durum === "hata" ? (
                  <div className="rounded-lg border border-warm-accent/30 bg-warm-accent/10 p-4 text-sm font-bold leading-6 text-dark-navy">
                    {params.mesaj ?? "Kurban başvurusu alınamadı. Lütfen bilgilerinizi kontrol edip tekrar deneyin."}
                  </div>
                ) : null}
                <QurbanDonationForm
                  campaigns={campaigns}
                  selectedSlug={selectedSlug}
                  donorDefaults={donorDefaults}
                  action={createQurbanOrderAction}
                />
              </div>
            )}

            <aside className="grid gap-5">
              <div className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
                <div className="flex items-start gap-3">
                  <AlertCircle aria-hidden className="mt-1 h-5 w-5 text-ocean-green" />
                  <div>
                    <h2 className="text-xl font-extrabold text-dark-navy">Ödeme altyapısı hazırlık modunda</h2>
                    <p className="mt-2 text-sm leading-7 text-ink-muted">
                      Bu form başvuru, vekalet kabulü ve hisse/adet rezervasyonu oluşturur. Ortak ödeme niyeti, makbuz ve bildirim modeli hazırlandı; PayTR test iframe altyapısı yalnızca payment intent üzerinden açılır. Canlı ödeme, makbuz PDF, SMS/e-posta ve dosya yükleme bu aşamada yapılmaz.
                    </p>
                  </div>
                </div>
              </div>
              {[
                { icon: FileCheck2, title: "Vekalet", text: "Metin taslak olup onay süreci gerektirir." },
                { icon: ShieldCheck, title: "KVKK", text: "Production öncesi veri işleme metinleri gözden geçirilmelidir." },
                { icon: CheckCircle2, title: "Operasyon", text: "Kesim ve dağıtım takibi sonraki aşamada write action ile bağlanacaktır." }
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-lg border border-border-soft bg-white p-5 shadow-sm">
                  <Icon aria-hidden className="h-5 w-5 text-ocean-green" />
                  <h3 className="mt-3 font-extrabold text-dark-navy">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">{text}</p>
                </div>
              ))}
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
