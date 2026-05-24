import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { AlertTriangle, CheckCircle2, CreditCard, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import {
  appendPaymentStatusLog,
  getPaymentIntentByIntentNo,
  markPaymentInitiated
} from "@/lib/data/paymentWriteRepository";
import {
  createPaytrMerchantOid,
  PaytrConfigError,
  PaytrRequestError,
  requestPaytrIframeToken
} from "@/lib/payments/paytr";
import { formatCurrency, formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "PayTR Test Ödeme",
  description: "PayTR iFrame test ödeme ekranı. Canlı ödeme alma kapalıdır."
};

export const dynamic = "force-dynamic";

type PaytrPaymentPageProps = {
  params: Promise<{ intentNo: string }>;
};

function getRequestIp(requestHeaders: Headers) {
  return (
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    "127.0.0.1"
  );
}

function getSiteUrl(requestHeaders: Headers) {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) return envUrl.replace(/\/+$/, "");

  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host");
  if (!host) return null;
  const proto = requestHeaders.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`;
}

function PaymentStatusCard({
  title,
  description,
  tone = "info"
}: {
  title: string;
  description: string;
  tone?: "info" | "success" | "warning";
}) {
  const Icon = tone === "success" ? CheckCircle2 : tone === "warning" ? AlertTriangle : ShieldCheck;
  const toneClass =
    tone === "success"
      ? "border-ocean-green/20 bg-mint-green/40 text-ocean-green"
      : tone === "warning"
        ? "border-warm-accent/25 bg-warm-accent/10 text-warm-accent"
        : "border-primary-blue/20 bg-soft-blue text-deep-blue";

  return (
    <section className={`rounded-lg border p-5 shadow-sm ${toneClass}`}>
      <Icon aria-hidden className="h-6 w-6" />
      <h2 className="mt-3 text-xl font-extrabold text-dark-navy">{title}</h2>
      <p className="mt-2 text-sm font-semibold leading-6 text-ink-muted">{description}</p>
    </section>
  );
}

export default async function PaytrPaymentPage({ params }: PaytrPaymentPageProps) {
  const { intentNo } = await params;
  const paymentIntent = await getPaymentIntentByIntentNo(decodeURIComponent(intentNo));
  if (!paymentIntent) notFound();

  const requestHeaders = await headers();
  const amountLabel = formatCurrency(paymentIntent.amount);
  const merchantOid = createPaytrMerchantOid(paymentIntent.intentNo);
  const siteUrl = getSiteUrl(requestHeaders);
  const canRequestToken = ["pending", "initiated", "requires_action"].includes(paymentIntent.status);

  let iframeToken: string | null = null;
  let setupError: string | null = null;

  if (canRequestToken) {
    try {
      const result = await requestPaytrIframeToken({
        intentNo: paymentIntent.intentNo,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        donorName: paymentIntent.donorName,
        donorEmail: paymentIntent.donorEmail,
        donorPhone: paymentIntent.donorPhone,
        description: paymentIntent.metadata.summary as string | undefined,
        userIp: getRequestIp(requestHeaders),
        siteUrl
      });

      iframeToken = result.token;
      await markPaymentInitiated(paymentIntent.id, result.merchantOid, { actorRole: "paytr_test_page" });
    } catch (error) {
      setupError =
        error instanceof PaytrConfigError || error instanceof PaytrRequestError
          ? "PayTR test ödeme ekranı şu anda hazırlanamadı. Lütfen dernek yönetimiyle iletişime geçin."
          : "Ödeme ekranı hazırlanırken beklenmeyen bir hata oluştu.";

      await appendPaymentStatusLog({
        paymentIntentId: paymentIntent.id,
        oldStatus: paymentIntent.status,
        newStatus: paymentIntent.status,
        eventType: "paytr_token_failed",
        actorRole: "paytr_test_page",
        note: "PayTR test iframe token alınamadı; ödeme durumu değiştirilmedi."
      });
    }
  }

  return (
    <main className="bg-soft-gray py-12 sm:py-16">
      <Container>
        <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <aside className="grid gap-4">
            <section className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
              <CreditCard aria-hidden className="h-7 w-7 text-ocean-green" />
              <h1 className="mt-4 text-3xl font-extrabold text-dark-navy">PayTR Test Ödeme</h1>
              <p className="mt-3 text-sm font-semibold leading-7 text-ink-muted">
                Bu ekran PayTR iFrame test entegrasyonu içindir. Kart bilgisi Okyanus sistemlerinde toplanmaz veya saklanmaz.
              </p>
              <dl className="mt-5 grid gap-3 text-sm">
                <div>
                  <dt className="font-extrabold text-ink-muted">Ödeme No</dt>
                  <dd className="mt-1 font-black text-dark-navy">{paymentIntent.intentNo}</dd>
                </div>
                <div>
                  <dt className="font-extrabold text-ink-muted">PayTR merchant_oid</dt>
                  <dd className="mt-1 font-black text-dark-navy">{merchantOid}</dd>
                </div>
                <div>
                  <dt className="font-extrabold text-ink-muted">Tutar</dt>
                  <dd className="mt-1 font-black text-dark-navy">{amountLabel}</dd>
                </div>
                <div>
                  <dt className="font-extrabold text-ink-muted">Durum</dt>
                  <dd className="mt-1 font-black text-dark-navy">{paymentIntent.status}</dd>
                </div>
                <div>
                  <dt className="font-extrabold text-ink-muted">Oluşturma</dt>
                  <dd className="mt-1 font-black text-dark-navy">{paymentIntent.createdAt ? formatDate(paymentIntent.createdAt) : "-"}</dd>
                </div>
              </dl>
            </section>
            <PaymentStatusCard
              title="Kesin onay callback ile yapılır"
              description="Başarılı veya başarısız dönüş sayfaları yalnızca bilgilendirme içindir; ödeme sonucu PayTR Bildirim URL callback’iyle doğrulanır."
            />
          </aside>

          <section className="rounded-brand border border-border-soft bg-white p-5 shadow-card">
            {paymentIntent.status === "paid" ? (
              <PaymentStatusCard
                tone="success"
                title="Bu ödeme daha önce onaylandı"
                description="Ödeme kaydı paid durumunda. Yeni bir kart işlemi başlatılmaz."
              />
            ) : null}
            {["failed", "cancelled", "expired", "refunded"].includes(paymentIntent.status) ? (
              <PaymentStatusCard
                tone="warning"
                title="Bu ödeme için yeni işlem başlatılamaz"
                description="Ödeme durumu tamamlanmış veya kapatılmış görünüyor. Gerekirse dernek yönetimi yeni bir ödeme niyeti oluşturmalıdır."
              />
            ) : null}
            {setupError ? <PaymentStatusCard tone="warning" title="Test ödeme ekranı hazırlanamadı" description={setupError} /> : null}
            {iframeToken ? (
              <div className="grid gap-4">
                <div className="rounded-lg bg-soft-blue p-4 text-sm font-semibold leading-6 text-deep-blue">
                  PayTR test iframe açıldı. Bu aşamada canlı tahsilat kapalıdır; sonuç yalnızca `/api/paytr/callback` Bildirim URL doğrulamasıyla işlenir.
                </div>
                <iframe
                  id="paytriframe"
                  title="PayTR test ödeme formu"
                  src={`https://www.paytr.com/odeme/guvenli/${iframeToken}`}
                  className="min-h-[720px] w-full rounded-lg border border-border-soft bg-white"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="payment *"
                />
              </div>
            ) : null}
            {!canRequestToken && paymentIntent.status !== "paid" && !["failed", "cancelled", "expired", "refunded"].includes(paymentIntent.status) ? (
              <PaymentStatusCard
                title="Ödeme henüz başlatılamıyor"
                description="Bu ödeme kaydı ödeme ekranına açılmadan önce hazırlık durumundan çıkarılmalıdır."
              />
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/panel/bagislarim" variant="ghost">Bağışlarım</Button>
              <Button href="/" variant="ghost">Ana Sayfa</Button>
            </div>
          </section>
        </div>
      </Container>
    </main>
  );
}
