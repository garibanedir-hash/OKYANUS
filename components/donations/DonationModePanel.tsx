import Link from "next/link";
import { MessageCircle, PauseCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { legalLinks } from "@/components/forms/LegalConsent";
import { getDonationMode, getDonationTarget } from "@/lib/donations/donationMode";
import type { DonationContext } from "@/lib/donations/donationTarget";

type DonationModePanelProps = {
  context?: DonationContext;
  onlineHref?: string;
  title?: string;
  description?: string;
};

export function DonationModePanel({
  context,
  onlineHref = "/bagis-yap",
  title,
  description
}: DonationModePanelProps) {
  const mode = getDonationMode();
  const target = getDonationTarget(context, onlineHref);

  if (mode === "whatsapp") {
    return (
      <div className="rounded-[1.75rem] border border-ocean-green/20 bg-white p-6 shadow-soft sm:p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint-green text-ocean-green">
          <MessageCircle aria-hidden className="h-7 w-7" />
        </div>
        <h2 className="mt-5 text-2xl font-extrabold text-dark-navy">{title ?? "Bağış Bilgilendirme Hattı"}</h2>
        <p className="mt-3 leading-7 text-ink-muted">
          {description ??
            "Şu anda bağış sürecimizi WhatsApp üzerinden yönlendiriyoruz. Destek olmak istediğiniz alanı bize yazabilir, ekibimizden bilgi alabilirsiniz."}
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button
            href={target.href}
            target={target.isExternal ? "_blank" : undefined}
            rel={target.isExternal ? "noopener noreferrer" : undefined}
            showIcon
          >
            WhatsApp Üzerinden Bilgi Al
          </Button>
          <Button href="/projeler" variant="ghost">
            Projeleri İncele
          </Button>
        </div>
        <div className="mt-6 flex gap-3 rounded-2xl border border-border-soft bg-soft-gray p-4 text-sm font-semibold leading-6 text-ink-muted">
          <ShieldCheck aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-ocean-green" />
          <p>
            WhatsApp üzerinden iletişime geçtiğinizde paylaşacağınız bilgiler, talebinizin yanıtlanması amacıyla değerlendirilir.{" "}
            <Link href={legalLinks.kvkk} className="font-extrabold text-deep-blue underline-offset-4 hover:underline">
              KVKK
            </Link>{" "}
            ve{" "}
            <Link href={legalLinks.privacy} className="font-extrabold text-deep-blue underline-offset-4 hover:underline">
              gizlilik
            </Link>{" "}
            metinlerini inceleyebilirsiniz.
          </p>
        </div>
      </div>
    );
  }

  if (mode === "disabled") {
    return (
      <div className="rounded-[1.75rem] border border-warm-accent/25 bg-white p-6 shadow-soft sm:p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warm-accent/10 text-warm-accent">
          <PauseCircle aria-hidden className="h-7 w-7" />
        </div>
        <h2 className="mt-5 text-2xl font-extrabold text-dark-navy">{title ?? "Bağış İşlemleri Geçici Olarak Kapalı"}</h2>
        <p className="mt-3 leading-7 text-ink-muted">
          {description ??
            "Bağış işlemleri geçici olarak kapalıdır. Lütfen daha sonra tekrar deneyin veya iletişim sayfasından bize ulaşın."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/iletisim" variant="secondary">
            İletişime Geç
          </Button>
          <Button href="/projeler" variant="ghost">
            Projeleri İncele
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
