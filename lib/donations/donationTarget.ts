export type DonationMode = "online" | "whatsapp" | "disabled";

export type DonationSource = "general" | "project" | "qurban" | "orphan" | "zakat" | "sadaqah";

export type DonationContext = {
  source?: DonationSource;
  projectTitle?: string;
  campaignTitle?: string;
  amount?: number;
};

export type DonationPublicConfig = {
  mode: DonationMode;
  whatsappPhone?: string;
  whatsappMessage?: string;
};

export type DonationTarget = {
  mode: DonationMode;
  href: string;
  isExternal: boolean;
  isWhatsapp: boolean;
  disabled: boolean;
  message?: string;
};

const DEFAULT_GENERAL_MESSAGE = "Merhaba, Okyanus İnsani Yardım Derneği'ne bağış yapmak istiyorum.";

export function normalizeDonationMode(value?: string | null): DonationMode {
  if (value === "whatsapp" || value === "disabled" || value === "online") return value;
  return "online";
}

export function normalizeWhatsappPhone(value?: string | null) {
  if (!value) return "";

  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = `90${digits.slice(1)}`;

  return digits;
}

export function buildDonationWhatsappMessage(context: DonationContext = {}, fallbackMessage?: string) {
  if (context.source === "project" && context.projectTitle) {
    return `Merhaba, ${context.projectTitle} projesine destek olmak istiyorum. Bilgi alabilir miyim?`;
  }

  if (context.source === "qurban") {
    return context.campaignTitle
      ? `Merhaba, ${context.campaignTitle} kurban bağışı hakkında bilgi almak istiyorum.`
      : "Merhaba, kurban bağışı hakkında bilgi almak istiyorum.";
  }

  if (context.source === "orphan") {
    return "Merhaba, yetim hamiliği hakkında bilgi almak istiyorum.";
  }

  if (context.source === "zakat") {
    return "Merhaba, zekat bağışı hakkında bilgi almak istiyorum.";
  }

  if (context.source === "sadaqah") {
    return "Merhaba, sadaka bağışı hakkında bilgi almak istiyorum.";
  }

  if (fallbackMessage?.trim()) return fallbackMessage.trim();

  return DEFAULT_GENERAL_MESSAGE;
}

export function buildDonationWhatsappUrl(config: DonationPublicConfig, context: DonationContext = {}) {
  const phone = normalizeWhatsappPhone(config.whatsappPhone);
  if (!phone) return null;

  const message = buildDonationWhatsappMessage(context, config.whatsappMessage);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function resolveDonationTarget(
  config: DonationPublicConfig,
  context: DonationContext = {},
  onlineHref = "/bagis-yap"
): DonationTarget {
  if (config.mode === "whatsapp") {
    const whatsappUrl = buildDonationWhatsappUrl(config, context);
    return {
      mode: config.mode,
      href: whatsappUrl ?? "/iletisim",
      isExternal: Boolean(whatsappUrl),
      isWhatsapp: Boolean(whatsappUrl),
      disabled: false,
      message: buildDonationWhatsappMessage(context, config.whatsappMessage)
    };
  }

  if (config.mode === "disabled") {
    return {
      mode: config.mode,
      href: onlineHref,
      isExternal: false,
      isWhatsapp: false,
      disabled: false
    };
  }

  return {
    mode: "online",
    href: onlineHref,
    isExternal: false,
    isWhatsapp: false,
    disabled: false
  };
}
