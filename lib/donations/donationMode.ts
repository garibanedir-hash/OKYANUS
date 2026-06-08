import {
  buildDonationWhatsappUrl,
  normalizeDonationMode,
  resolveDonationTarget
} from "@/lib/donations/donationTarget";
import type { DonationContext, DonationMode, DonationPublicConfig } from "@/lib/donations/donationTarget";

export type { DonationContext, DonationMode, DonationPublicConfig };

export function getDonationMode(): DonationMode {
  return normalizeDonationMode(process.env.DONATION_MODE ?? process.env.NEXT_PUBLIC_DONATION_MODE);
}

export function getDonationPublicConfig(): DonationPublicConfig {
  return {
    mode: getDonationMode(),
    whatsappPhone: process.env.DONATION_WHATSAPP_PHONE ?? process.env.NEXT_PUBLIC_DONATION_WHATSAPP_PHONE,
    whatsappMessage: process.env.DONATION_WHATSAPP_MESSAGE ?? process.env.NEXT_PUBLIC_DONATION_WHATSAPP_MESSAGE
  };
}

export function isOnlineDonationMode() {
  return getDonationMode() === "online";
}

export function isWhatsappDonationMode() {
  return getDonationMode() === "whatsapp";
}

export function isDonationDisabled() {
  return getDonationMode() === "disabled";
}

export function getDonationWhatsappUrl(context?: DonationContext) {
  return buildDonationWhatsappUrl(getDonationPublicConfig(), context);
}

export function getDonationTarget(context?: DonationContext, onlineHref = "/bagis-yap") {
  return resolveDonationTarget(getDonationPublicConfig(), context, onlineHref);
}
