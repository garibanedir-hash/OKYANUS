import type { ReactNode } from "react";
import Link from "next/link";
import { LEGAL_CONSENT_VERSION, type LegalConsentContext } from "@/lib/legal/consent";

function legalPath(slug: string) {
  return `/hukuki/${slug}`;
}

export const legalLinks = {
  kvkk: legalPath("kvkk-aydinlatma-metni"),
  explicitConsent: legalPath("acik-riza-metni"),
  privacy: legalPath("gizlilik-politikasi"),
  cookies: legalPath("cerez-politikasi"),
  donationTerms: legalPath("bagis-bilgilendirme-ve-sartlari"),
  volunteerNotice: legalPath("gonullu-basvuru-aydinlatma-metni"),
  contactNotice: legalPath("iletisim-formu-aydinlatma-metni"),
  terms: legalPath("kullanim-sartlari"),
  onlineDonationNotice: legalPath("mesafeli-bagis-online-odeme-bilgilendirmesi")
} as const;

export function LegalTextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} target="_blank" rel="noopener noreferrer" className="font-extrabold text-deep-blue underline-offset-4 hover:underline">
      {children}
    </Link>
  );
}

export function ConsentCheckbox({
  name,
  required,
  defaultChecked,
  children
}: {
  name: string;
  required?: boolean;
  defaultChecked?: boolean;
  children: ReactNode;
}) {
  const id = `consent-${name}`;
  const labelId = `${id}-label`;

  return (
    <div className="flex items-start gap-3 text-sm font-semibold leading-6 text-ink-muted">
      <input
        id={id}
        name={name}
        type="checkbox"
        required={required}
        defaultChecked={defaultChecked}
        aria-labelledby={labelId}
        className="mt-1 h-4 w-4 accent-ocean-green"
      />
      <span id={labelId}>{children}</span>
    </div>
  );
}

function getAcknowledgementLabel(context: LegalConsentContext) {
  if (context === "contact") {
    return (
      <>
        <LegalTextLink href={legalLinks.contactNotice}>İletişim Formu Aydınlatma Metni</LegalTextLink>&apos;ni okudum; paylaştığım
        bilgilerin talebimin yanıtlanması amacıyla işlenebileceğini biliyorum.
      </>
    );
  }

  if (context === "volunteer") {
    return (
      <>
        <LegalTextLink href={legalLinks.volunteerNotice}>Gönüllü Başvuru Aydınlatma Metni</LegalTextLink>&apos;ni okudum.
      </>
    );
  }

  if (context === "registration") {
    return (
      <>
        <LegalTextLink href={legalLinks.kvkk}>KVKK Aydınlatma Metni</LegalTextLink>&apos;ni okudum.
      </>
    );
  }

  return (
    <>
      <LegalTextLink href={legalLinks.kvkk}>KVKK Aydınlatma Metni</LegalTextLink> ile{" "}
      <LegalTextLink href={legalLinks.donationTerms}>Bağış Bilgilendirme ve Şartları</LegalTextLink>&apos;nı okudum.
    </>
  );
}

function getExplicitConsentLabel(context: LegalConsentContext) {
  if (context === "volunteer") {
    return (
      <>
        <LegalTextLink href={legalLinks.explicitConsent}>Açık Rıza Metni</LegalTextLink> kapsamında gönüllülük başvurumun
        değerlendirilmesi ve uygun gönüllülük alanları için benimle iletişim kurulmasını kabul ediyorum.
      </>
    );
  }

  if (context === "registration") {
    return (
      <>
        <LegalTextLink href={legalLinks.explicitConsent}>Açık Rıza Metni</LegalTextLink> kapsamında üyelik ve başvuru süreçleri için
        gerekli kişisel verilerimin belirtilen amaçlarla işlenmesini kabul ediyorum.
      </>
    );
  }

  return (
    <>
      <LegalTextLink href={legalLinks.explicitConsent}>Açık Rıza Metni</LegalTextLink> kapsamında bu başvuru veya bağış süreci için
      belirtilen kişisel veri işleme faaliyetlerine onay veriyorum.
    </>
  );
}

function getCommunicationPermissionLabel(context: LegalConsentContext) {
  if (context === "contact") {
    return (
      <>
        <LegalTextLink href={legalLinks.explicitConsent}>Açık Rıza Metni</LegalTextLink> kapsamında faaliyet ve bilgilendirme
        duyurularının tarafıma iletilmesini kabul ediyorum.
      </>
    );
  }

  if (context === "volunteer") {
    return (
      <>
        <LegalTextLink href={legalLinks.explicitConsent}>Açık Rıza Metni</LegalTextLink> kapsamında faaliyet, gönüllülük çağrıları ve
        bilgilendirme duyurularının tarafıma iletilmesini kabul ediyorum.
      </>
    );
  }

  if (context === "registration") {
    return (
      <>
        <LegalTextLink href={legalLinks.explicitConsent}>Açık Rıza Metni</LegalTextLink> kapsamında faaliyet ve bilgilendirme
        duyurularının hesabımda paylaştığım iletişim kanallarına iletilmesini kabul ediyorum.
      </>
    );
  }

  return (
    <>
      <LegalTextLink href={legalLinks.explicitConsent}>Açık Rıza Metni</LegalTextLink> kapsamında bağış süreci, faaliyet ve
      bilgilendirme duyuruları için benimle iletişime geçilmesini kabul ediyorum.
    </>
  );
}

export function LegalConsentFields({
  context,
  requireExplicitConsent = false,
  showCommunicationPermission = false,
  defaultCommunicationPermission = false,
  legalVersion = LEGAL_CONSENT_VERSION
}: {
  context: LegalConsentContext;
  requireExplicitConsent?: boolean;
  showCommunicationPermission?: boolean;
  defaultCommunicationPermission?: boolean;
  legalVersion?: string;
}) {
  return (
    <div className="grid gap-3">
      <input type="hidden" name="consentContext" value={context} />
      <input type="hidden" name="consentTextVersion" value={legalVersion} />
      <ConsentCheckbox name="kvkkAcknowledged" required>
        {getAcknowledgementLabel(context)}
      </ConsentCheckbox>
      {requireExplicitConsent ? (
        <ConsentCheckbox name="explicitConsentGiven" required>
          {getExplicitConsentLabel(context)}
        </ConsentCheckbox>
      ) : null}
      {showCommunicationPermission ? (
        <ConsentCheckbox name="communicationPermissionGiven" defaultChecked={defaultCommunicationPermission}>
          {getCommunicationPermissionLabel(context)}
        </ConsentCheckbox>
      ) : null}
    </div>
  );
}
