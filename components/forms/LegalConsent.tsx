import type { ReactNode } from "react";
import Link from "next/link";

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
  children
}: {
  name: string;
  required?: boolean;
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
        aria-labelledby={labelId}
        className="mt-1 h-4 w-4 accent-ocean-green"
      />
      <span id={labelId}>{children}</span>
    </div>
  );
}
