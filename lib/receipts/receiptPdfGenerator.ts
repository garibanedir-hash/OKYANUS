import "server-only";

import fs from "node:fs";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, StandardFonts, rgb, type PDFImage, type PDFPage, type PDFFont, type RGB } from "pdf-lib";
import type { PaymentContextType, PaymentIntentStatus, PaymentProvider, ReceiptStatus } from "@/data/paymentMock";
import {
  paymentContextTypeLabels,
  paymentIntentStatusLabels,
  paymentProviderLabels,
  receiptStatusLabels
} from "@/data/paymentMock";

export type ReceiptPdfInput = {
  receiptNo: string;
  paymentIntentNo?: string | null;
  contextType: PaymentContextType;
  donorName?: string | null;
  donorEmail?: string | null;
  donorPhone?: string | null;
  amount: number;
  currency: string;
  receiptStatus: ReceiptStatus;
  paymentStatus?: PaymentIntentStatus | null;
  paymentProvider?: PaymentProvider | null;
  projectOrCampaign?: string | null;
  issuedAt?: string | null;
  generatedAt?: string | null;
  createdAt?: string | null;
  description?: string | null;
};

export type ReceiptPdfData = {
  brandName: string;
  receiptNo: string;
  paymentIntentNo: string;
  dateLabel: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  contextLabel: string;
  projectOrCampaign: string;
  amountLabel: string;
  paymentProviderLabel: string;
  paymentStatusLabel: string;
  receiptStatusLabel: string;
  description: string;
  transparencyNote: string;
  thankYouText: string;
  registryNote: string;
  website: string;
  email: string;
  phone: string;
  address: string;
};

type FontRole = "regular" | "medium" | "bold" | "black";

type ReceiptPdfFonts = Record<FontRole, PDFFont> & {
  embeddedGilroy: boolean;
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 42;
const NAVY = "#0F2547";
const TEAL = "#1F8083";
const TEXT = "#1F2937";
const MUTED = "#64748B";
const BORDER = "#D7DEE8";
const SOFT = "#F7FAFB";
const LIGHT_TEAL = "#EAF7F7";
const HEADER_SOFT = "#F2F7F8";
const WHITE = "#FFFFFF";
const FONT_DIR = path.join(process.cwd(), "app", "fonts");
const BRAND_LOGO_PATH = path.join(process.cwd(), "public", "brand", "logo.png");

const TURKISH_CHAR_MAP: Record<string, string> = {
  "ç": "c",
  "Ç": "C",
  "ğ": "g",
  "Ğ": "G",
  "ı": "i",
  "İ": "I",
  "ö": "o",
  "Ö": "O",
  "ş": "s",
  "Ş": "S",
  "ü": "u",
  "Ü": "U",
  "₺": "TL"
};

const FONT_CANDIDATES: Record<FontRole, string[]> = {
  regular: ["Gilroy-Regular.ttf", "Gilroy-Regular.woff2"],
  medium: ["Gilroy-Medium.ttf", "Gilroy-Medium.woff2"],
  bold: ["Gilroy-Bold.ttf", "Gilroy-Bold.woff2"],
  black: ["Gilroy-Black.ttf", "Gilroy-Black.woff2"]
};

function normalizeForFallback(value: string) {
  return value
    .replace(/[çÇğĞıİöÖşŞüÜ₺]/g, (char) => TURKISH_CHAR_MAP[char] ?? char)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function safeText(value: string | null | undefined, embeddedGilroy: boolean) {
  const text = (value || "-").replace(/\s+/g, " ").trim();
  return embeddedGilroy ? text : normalizeForFallback(text);
}

function formatPdfDateValue(value?: string | null) {
  if (!value) return formatReceiptDate(new Date().toISOString());
  return formatReceiptDate(value);
}

export function getReceiptContextLabel(contextType: PaymentContextType) {
  return paymentContextTypeLabels[contextType] ?? "Bağış";
}

export function formatReceiptAmount(amount: number, currency: string) {
  const currencyLabel = currency === "TRY" ? "TL" : currency;
  return `${new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)} ${currencyLabel}`;
}

export function formatReceiptDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.valueOf())) return "Tarih güncellenecek";

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(parsed);
}

function getPaymentProviderLabel(provider?: PaymentProvider | null) {
  if (!provider) return "Online Ödeme";
  return paymentProviderLabels[provider] ?? provider;
}

export function buildReceiptPdfData(receipt: ReceiptPdfInput): ReceiptPdfData {
  const contextLabel = getReceiptContextLabel(receipt.contextType);

  return {
    brandName: "Okyanus İnsani Yardım Derneği",
    receiptNo: receipt.receiptNo,
    paymentIntentNo: receipt.paymentIntentNo ?? "Ödeme kaydı yok",
    dateLabel: formatPdfDateValue(receipt.generatedAt ?? receipt.issuedAt ?? receipt.createdAt),
    donorName: receipt.donorName?.trim() || "Bağışçı",
    donorEmail: receipt.donorEmail?.trim() || "-",
    donorPhone: receipt.donorPhone?.trim() || "-",
    contextLabel,
    projectOrCampaign: receipt.projectOrCampaign?.trim() || "-",
    amountLabel: formatReceiptAmount(receipt.amount, receipt.currency),
    paymentProviderLabel: getPaymentProviderLabel(receipt.paymentProvider),
    paymentStatusLabel: receipt.paymentStatus ? paymentIntentStatusLabels[receipt.paymentStatus] : "Ödeme kaydı",
    receiptStatusLabel: receiptStatusLabels[receipt.receiptStatus] ?? receipt.receiptStatus,
    description: receipt.description?.trim() || `${contextLabel} kaydı için oluşturulan bağış makbuzu.`,
    transparencyNote:
      "Bu makbuz, Okyanus İnsani Yardım Derneği bağış sistemi tarafından oluşturulmuştur ve bağışınızın kayıt altına alındığını gösterir. Bağışlarınız, derneğimizin amaçları doğrultusunda şeffaf, hesap verebilir ve etik ilkelere uygun şekilde kullanılmaktadır. Resmî muhasebe ve yasal kayıt süreçleri derneğimiz tarafından yürütülmektedir.",
    thankYouText:
      "Siz değerli bağışçılarımızın desteğiyle daha fazla insana umut oluyoruz. İyiliği birlikte büyütüyoruz.",
    registryNote: "Okyanus İnsani Yardım Derneği, ilgili mevzuat kapsamında faaliyet gösteren bir insani yardım kuruluşudur.",
    website: "okyanus.org.tr",
    email: "bilgi@okyanus.org.tr",
    phone: "+90 212 000 00 00",
    address: "İstanbul / Türkiye"
  };
}

function hexToRgb(hex: string): RGB {
  const value = hex.replace("#", "");
  return rgb(
    Number.parseInt(value.slice(0, 2), 16) / 255,
    Number.parseInt(value.slice(2, 4), 16) / 255,
    Number.parseInt(value.slice(4, 6), 16) / 255
  );
}

function resolveFontPath(role: FontRole) {
  return FONT_CANDIDATES[role].map((fileName) => path.join(FONT_DIR, fileName)).find((fontPath) => fs.existsSync(fontPath)) ?? null;
}

async function embedFontIfAvailable(pdfDoc: PDFDocument, role: FontRole) {
  const fontPath = resolveFontPath(role);
  if (!fontPath) return null;

  try {
    return await pdfDoc.embedFont(fs.readFileSync(fontPath), { subset: true });
  } catch (error) {
    console.warn("[receipt-pdf] gilroy_font_embed_failed", {
      role,
      fileName: path.basename(fontPath),
      message: error instanceof Error ? error.message : "Bilinmeyen font embed hatası"
    });
    return null;
  }
}

async function loadReceiptFonts(pdfDoc: PDFDocument): Promise<ReceiptPdfFonts> {
  pdfDoc.registerFontkit(fontkit);

  const [fallbackRegular, fallbackBold, regular, medium, bold, black] = await Promise.all([
    pdfDoc.embedFont(StandardFonts.Helvetica),
    pdfDoc.embedFont(StandardFonts.HelveticaBold),
    embedFontIfAvailable(pdfDoc, "regular"),
    embedFontIfAvailable(pdfDoc, "medium"),
    embedFontIfAvailable(pdfDoc, "bold"),
    embedFontIfAvailable(pdfDoc, "black")
  ]);

  const embeddedGilroy = Boolean(regular && medium && bold && black);
  if (!embeddedGilroy) {
    console.warn("[receipt-pdf] gilroy_font_embed_incomplete", {
      regular: Boolean(regular),
      medium: Boolean(medium),
      bold: Boolean(bold),
      black: Boolean(black),
      fallback: "Helvetica"
    });
  }

  return {
    regular: regular ?? fallbackRegular,
    medium: medium ?? regular ?? fallbackRegular,
    bold: bold ?? medium ?? fallbackBold,
    black: black ?? bold ?? fallbackBold,
    embeddedGilroy
  };
}

async function loadOfficialLogo(pdfDoc: PDFDocument) {
  try {
    if (!fs.existsSync(BRAND_LOGO_PATH)) return null;
    return await pdfDoc.embedPng(fs.readFileSync(BRAND_LOGO_PATH));
  } catch (error) {
    console.warn("[receipt-pdf] official_logo_embed_failed", {
      path: "public/brand/logo.png",
      message: error instanceof Error ? error.message : "Bilinmeyen logo embed hatası"
    });
    return null;
  }
}

function measureTextWidth(value: string, font: PDFFont, size: number, embeddedGilroy: boolean) {
  return font.widthOfTextAtSize(safeText(value, embeddedGilroy), size);
}

function truncateText(value: string, maxWidth: number, font: PDFFont, size: number, embeddedGilroy: boolean) {
  const source = safeText(value, embeddedGilroy);
  if (font.widthOfTextAtSize(source, size) <= maxWidth) return source;

  let result = source;
  while (result.length > 1 && font.widthOfTextAtSize(`${result}...`, size) > maxWidth) {
    result = result.slice(0, -1);
  }

  return `${result.trim()}...`;
}

function truncateMiddleText(value: string, maxWidth: number, font: PDFFont, size: number, embeddedGilroy: boolean) {
  const source = safeText(value, embeddedGilroy);
  if (font.widthOfTextAtSize(source, size) <= maxWidth) return source;
  if (source.length <= 12) return truncateText(source, maxWidth, font, size, embeddedGilroy);

  let startLength = Math.min(14, Math.ceil(source.length * 0.48));
  let endLength = Math.min(8, Math.floor(source.length * 0.28));
  let result = `${source.slice(0, startLength)}...${source.slice(-endLength)}`;

  while (font.widthOfTextAtSize(result, size) > maxWidth && (startLength > 5 || endLength > 4)) {
    if (startLength >= endLength && startLength > 5) {
      startLength -= 1;
    } else if (endLength > 4) {
      endLength -= 1;
    } else {
      break;
    }

    result = `${source.slice(0, startLength)}...${source.slice(-endLength)}`;
  }

  return font.widthOfTextAtSize(result, size) <= maxWidth ? result : truncateText(source, maxWidth, font, size, embeddedGilroy);
}

function splitLongWord(word: string, maxWidth: number, font: PDFFont, size: number, embeddedGilroy: boolean) {
  const chunks: string[] = [];
  let current = "";

  Array.from(word).forEach((char) => {
    const next = `${current}${char}`;
    if (current && measureTextWidth(next, font, size, embeddedGilroy) > maxWidth) {
      chunks.push(current);
      current = char;
    } else {
      current = next;
    }
  });

  if (current) chunks.push(current);
  return chunks;
}

function splitTextToLines(value: string, maxWidth: number, font: PDFFont, size: number, embeddedGilroy: boolean) {
  const words = safeText(value, embeddedGilroy).split(" ").filter(Boolean);
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    const pieces = measureTextWidth(word, font, size, embeddedGilroy) > maxWidth ? splitLongWord(word, maxWidth, font, size, embeddedGilroy) : [word];
    pieces.forEach((piece) => {
      const next = current ? `${current} ${piece}` : piece;
      if (current && measureTextWidth(next, font, size, embeddedGilroy) > maxWidth) {
        lines.push(current);
        current = piece;
      } else {
        current = next;
      }
    });
  });

  if (current) lines.push(current);
  return lines.length ? lines : ["-"];
}

function drawText(
  page: PDFPage,
  value: string,
  x: number,
  y: number,
  options: {
    font: PDFFont;
    size: number;
    color?: string;
    align?: "left" | "right" | "center";
    maxWidth?: number;
    embeddedGilroy: boolean;
  }
) {
  const textValue = options.maxWidth ? truncateText(value, options.maxWidth, options.font, options.size, options.embeddedGilroy) : safeText(value, options.embeddedGilroy);
  const width = options.font.widthOfTextAtSize(textValue, options.size);
  const adjustedX = options.align === "right" ? x - width : options.align === "center" ? x - width / 2 : x;

  page.drawText(textValue, {
    x: adjustedX,
    y,
    size: options.size,
    font: options.font,
    color: hexToRgb(options.color ?? TEXT)
  });
}

function drawWrappedText(
  page: PDFPage,
  value: string,
  x: number,
  y: number,
  maxWidth: number,
  options: {
    font: PDFFont;
    size: number;
    color?: string;
    maxLines?: number;
    leading?: number;
    embeddedGilroy: boolean;
  }
) {
  const maxLines = options.maxLines ?? 5;
  const leading = options.leading ?? options.size + 4;
  const allLines = splitTextToLines(value, maxWidth, options.font, options.size, options.embeddedGilroy);
  const lines = allLines.slice(0, maxLines);
  if (allLines.length > maxLines) {
    lines[lines.length - 1] = truncateText(lines[lines.length - 1], maxWidth, options.font, options.size, options.embeddedGilroy);
  }

  lines.forEach((line, index) => {
    drawText(page, line, x, y - index * leading, {
      font: options.font,
      size: options.size,
      color: options.color,
      maxWidth,
      embeddedGilroy: options.embeddedGilroy
    });
  });

  return y - lines.length * leading;
}

function drawBox(page: PDFPage, x: number, y: number, width: number, height: number, options: { fill?: string; border?: string; borderWidth?: number } = {}) {
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: options.fill ? hexToRgb(options.fill) : undefined,
    borderColor: options.border ? hexToRgb(options.border) : undefined,
    borderWidth: options.border ? (options.borderWidth ?? 1) : undefined
  });
}

function drawLine(page: PDFPage, start: { x: number; y: number }, end: { x: number; y: number }, color = BORDER, thickness = 1) {
  page.drawLine({
    start,
    end,
    color: hexToRgb(color),
    thickness
  });
}

function drawLabelValueRow(
  page: PDFPage,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
  fonts: ReceiptPdfFonts
) {
  drawText(page, label.toLocaleUpperCase("tr-TR"), x, y, {
    font: fonts.bold,
    size: 7.5,
    color: MUTED,
    maxWidth: width,
    embeddedGilroy: fonts.embeddedGilroy
  });
  drawText(page, value || "-", x, y - 14, {
    font: fonts.medium,
    size: 9.5,
    color: TEXT,
    maxWidth: width,
    embeddedGilroy: fonts.embeddedGilroy
  });
}

function getStatusBadgeStyle(value: string) {
  const normalized = value.toLocaleLowerCase("tr-TR");

  if (normalized.includes("ödendi") || normalized.includes("odendi")) {
    return { fill: LIGHT_TEAL, border: "#B9E1E2", color: TEAL };
  }

  if (normalized.includes("iptal") || normalized.includes("başarısız") || normalized.includes("basarisiz") || normalized.includes("hata")) {
    return { fill: "#FEF2F2", border: "#FCA5A5", color: "#991B1B" };
  }

  return { fill: HEADER_SOFT, border: BORDER, color: NAVY };
}

function drawStatusBadge(page: PDFPage, value: string, x: number, y: number, maxWidth: number, fonts: ReceiptPdfFonts) {
  const textSize = 7.2;
  const label = truncateText(value, maxWidth - 14, fonts.bold, textSize, fonts.embeddedGilroy);
  const textWidth = fonts.bold.widthOfTextAtSize(label, textSize);
  const badgeWidth = Math.min(maxWidth, Math.max(48, textWidth + 14));
  const badgeHeight = 13;
  const style = getStatusBadgeStyle(value);

  drawBox(page, x, y - 3, badgeWidth, badgeHeight, {
    fill: style.fill,
    border: style.border,
    borderWidth: 0.8
  });
  drawText(page, label, x + badgeWidth / 2, y + 1, {
    font: fonts.bold,
    size: textSize,
    color: style.color,
    align: "center",
    maxWidth: badgeWidth - 10,
    embeddedGilroy: fonts.embeddedGilroy
  });
}

function drawMetaRow(
  page: PDFPage,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
  fonts: ReceiptPdfFonts,
  options: { compactValue?: boolean; badge?: boolean } = {}
) {
  const labelWidth = 52;
  const gap = 7;
  const valueX = x + labelWidth + gap;
  const valueWidth = width - labelWidth - gap;

  drawText(page, label, x, y, {
    font: fonts.bold,
    size: 6.8,
    color: MUTED,
    maxWidth: labelWidth,
    embeddedGilroy: fonts.embeddedGilroy
  });

  if (options.badge) {
    drawStatusBadge(page, value, valueX, y - 1, valueWidth, fonts);
    return y - 17;
  }

  const valueSize = options.compactValue ? 7.1 : 7.6;
  const textValue = options.compactValue
    ? truncateMiddleText(value, valueWidth, fonts.bold, valueSize, fonts.embeddedGilroy)
    : truncateText(value, valueWidth, fonts.bold, valueSize, fonts.embeddedGilroy);

  drawText(page, textValue, valueX, y, {
    font: fonts.bold,
    size: valueSize,
    color: NAVY,
    maxWidth: valueWidth,
    embeddedGilroy: fonts.embeddedGilroy
  });

  return y - 16;
}

function drawHeader(page: PDFPage, data: ReceiptPdfData, fonts: ReceiptPdfFonts, logo: PDFImage | null) {
  drawBox(page, 0, PAGE_HEIGHT - 10, PAGE_WIDTH, 10, { fill: NAVY });
  drawBox(page, 0, PAGE_HEIGHT - 13, PAGE_WIDTH, 3, { fill: TEAL });

  const logoBox = { x: MARGIN_X, y: 758, width: 158, height: 58 };

  if (logo) {
    const scale = Math.min(logoBox.width / logo.width, logoBox.height / logo.height);
    const logoWidth = logo.width * scale;
    const logoHeight = logo.height * scale;
    page.drawImage(logo, {
      x: logoBox.x,
      y: logoBox.y + (logoBox.height - logoHeight) / 2,
      width: logoWidth,
      height: logoHeight
    });
  } else {
    drawBox(page, logoBox.x, logoBox.y + 15, 28, 28, { fill: TEAL });
    drawText(page, "OKYANUS", logoBox.x + 36, logoBox.y + 31, { font: fonts.black, size: 17, color: NAVY, embeddedGilroy: fonts.embeddedGilroy });
    drawText(page, "İNSANİ YARDIM DERNEĞİ", logoBox.x + 36, logoBox.y + 17, {
      font: fonts.bold,
      size: 8.5,
      color: MUTED,
      embeddedGilroy: fonts.embeddedGilroy
    });
  }

  const panelX = 333;
  const panelY = 735;
  const panelWidth = 220;
  const panelHeight = 90;
  const innerX = panelX + 14;
  const innerWidth = panelWidth - 26;

  drawBox(page, panelX, panelY, panelWidth, panelHeight, { fill: WHITE, border: BORDER, borderWidth: 0.8 });
  drawBox(page, panelX, panelY, 3, panelHeight, { fill: TEAL });
  drawText(page, "DİJİTAL MAKBUZ", innerX, panelY + panelHeight - 14, {
    font: fonts.black,
    size: 6.6,
    color: TEAL,
    maxWidth: innerWidth,
    embeddedGilroy: fonts.embeddedGilroy
  });

  let cursorY = panelY + panelHeight - 30;
  cursorY = drawMetaRow(page, "Makbuz No", data.receiptNo, innerX, cursorY, innerWidth, fonts, { compactValue: true });
  cursorY = drawMetaRow(page, "Ödeme No", data.paymentIntentNo, innerX, cursorY, innerWidth, fonts, { compactValue: true });
  cursorY = drawMetaRow(page, "Tarih", data.dateLabel, innerX, cursorY, innerWidth, fonts);
  drawMetaRow(page, "Durum", data.paymentStatusLabel, innerX, cursorY, innerWidth, fonts, { badge: true });
}

function drawTitle(page: PDFPage, fonts: ReceiptPdfFonts) {
  drawText(page, "BAĞIŞ MAKBUZU", 42, 714, {
    font: fonts.black,
    size: 27,
    color: NAVY,
    embeddedGilroy: fonts.embeddedGilroy
  });
  drawBox(page, 42, 698, 94, 3, { fill: TEAL });
  drawWrappedText(
    page,
    "Aşağıda bilgileri yer alan bağış, Okyanus İnsani Yardım Derneği kayıtlarına alınmış olup teşekkür ederiz.",
    42,
    680,
    500,
    { font: fonts.regular, size: 10.2, color: MUTED, maxLines: 2, embeddedGilroy: fonts.embeddedGilroy }
  );
}

function drawDonorPanel(page: PDFPage, data: ReceiptPdfData, fonts: ReceiptPdfFonts) {
  drawBox(page, 42, 510, 511, 150, { fill: SOFT, border: BORDER });
  drawBox(page, 42, 636, 511, 24, { fill: NAVY });
  drawText(page, "BAĞIŞÇI BİLGİLERİ", 56, 644, {
    font: fonts.black,
    size: 9,
    color: WHITE,
    embeddedGilroy: fonts.embeddedGilroy
  });

  drawLabelValueRow(page, "Bağışçı Adı Soyadı", data.donorName, 58, 617, 210, fonts);
  drawLabelValueRow(page, "E-posta", data.donorEmail, 58, 588, 210, fonts);
  drawLabelValueRow(page, "Telefon", data.donorPhone, 58, 559, 210, fonts);
  drawLabelValueRow(page, "Tutar", data.amountLabel, 58, 530, 210, fonts);
  drawLabelValueRow(page, "Bağış Türü", data.contextLabel, 305, 617, 205, fonts);
  drawLabelValueRow(page, "Proje / Kampanya", data.projectOrCampaign, 305, 588, 205, fonts);
  drawLabelValueRow(page, "Ödeme Yöntemi", data.paymentProviderLabel, 305, 559, 205, fonts);

  drawText(page, "ÖDEME DURUMU", 305, 530, {
    font: fonts.bold,
    size: 7.5,
    color: MUTED,
    embeddedGilroy: fonts.embeddedGilroy
  });
  drawBox(page, 305, 508, 108, 17, { fill: LIGHT_TEAL, border: "#B9E1E2", borderWidth: 0.8 });
  drawText(page, data.paymentStatusLabel, 359, 513.5, {
    font: fonts.bold,
    size: 8.1,
    color: TEAL,
    align: "center",
    maxWidth: 92,
    embeddedGilroy: fonts.embeddedGilroy
  });
}

function drawSummaryTable(page: PDFPage, data: ReceiptPdfData, fonts: ReceiptPdfFonts) {
  drawText(page, "BAĞIŞ ÖZETİ", 42, 478, {
    font: fonts.black,
    size: 12,
    color: NAVY,
    embeddedGilroy: fonts.embeddedGilroy
  });
  drawBox(page, 42, 386, 511, 74, { fill: WHITE, border: BORDER });
  drawBox(page, 42, 435, 511, 25, { fill: HEADER_SOFT });
  drawText(page, "AÇIKLAMA", 56, 445, { font: fonts.bold, size: 8, color: MUTED, embeddedGilroy: fonts.embeddedGilroy });
  drawText(page, "TUTAR", 326, 445, { font: fonts.bold, size: 8, color: MUTED, embeddedGilroy: fonts.embeddedGilroy });
  drawText(page, "ADET", 418, 445, { font: fonts.bold, size: 8, color: MUTED, embeddedGilroy: fonts.embeddedGilroy });
  drawText(page, "TOPLAM", 531, 445, { font: fonts.bold, size: 8, color: MUTED, align: "right", embeddedGilroy: fonts.embeddedGilroy });
  drawLine(page, { x: 42, y: 435 }, { x: 553, y: 435 }, BORDER);
  drawLine(page, { x: 306, y: 386 }, { x: 306, y: 460 }, BORDER);
  drawLine(page, { x: 400, y: 386 }, { x: 400, y: 460 }, BORDER);
  drawLine(page, { x: 456, y: 386 }, { x: 456, y: 460 }, BORDER);
  drawWrappedText(page, data.description, 56, 419, 226, {
    font: fonts.medium,
    size: 8.6,
    color: TEXT,
    maxLines: 2,
    leading: 11,
    embeddedGilroy: fonts.embeddedGilroy
  });
  drawText(page, data.amountLabel, 326, 410, { font: fonts.bold, size: 8.8, color: TEXT, maxWidth: 64, embeddedGilroy: fonts.embeddedGilroy });
  drawText(page, "1", 428, 410, { font: fonts.bold, size: 8.8, color: TEXT, embeddedGilroy: fonts.embeddedGilroy });
  drawText(page, data.amountLabel, 531, 410, {
    font: fonts.bold,
    size: 8.8,
    color: NAVY,
    align: "right",
    maxWidth: 70,
    embeddedGilroy: fonts.embeddedGilroy
  });
}

function drawTotalBox(page: PDFPage, data: ReceiptPdfData, fonts: ReceiptPdfFonts) {
  drawBox(page, 42, 317, 511, 52, { fill: LIGHT_TEAL, border: "#B9E1E2" });
  drawText(page, "TOPLAM TUTAR", 58, 343, { font: fonts.black, size: 9, color: NAVY, embeddedGilroy: fonts.embeddedGilroy });
  drawText(page, "Bağış kayıt toplamı", 58, 328, { font: fonts.regular, size: 8.3, color: MUTED, embeddedGilroy: fonts.embeddedGilroy });
  drawText(page, data.amountLabel, 535, 333, {
    font: fonts.black,
    size: 21,
    color: TEAL,
    align: "right",
    maxWidth: 250,
    embeddedGilroy: fonts.embeddedGilroy
  });
}

function drawTransparency(page: PDFPage, data: ReceiptPdfData, fonts: ReceiptPdfFonts) {
  drawBox(page, 42, 204, 511, 90, { fill: WHITE, border: BORDER });
  drawBox(page, 42, 290, 511, 4, { fill: TEAL });
  drawText(page, "KURUMSAL ŞEFFAFLIK", 58, 270, { font: fonts.black, size: 10.2, color: NAVY, embeddedGilroy: fonts.embeddedGilroy });
  drawWrappedText(page, data.transparencyNote, 58, 250, 475, {
    font: fonts.regular,
    size: 8.2,
    color: TEXT,
    maxLines: 5,
    leading: 11,
    embeddedGilroy: fonts.embeddedGilroy
  });
}

function drawFooter(page: PDFPage, data: ReceiptPdfData, fonts: ReceiptPdfFonts) {
  drawLine(page, { x: 42, y: 164 }, { x: 553, y: 164 }, BORDER);
  drawText(page, "TEŞEKKÜR EDERİZ", 42, 138, { font: fonts.black, size: 13, color: NAVY, embeddedGilroy: fonts.embeddedGilroy });
  drawWrappedText(page, data.thankYouText, 42, 119, 280, {
    font: fonts.regular,
    size: 8.8,
    color: MUTED,
    maxLines: 2,
    leading: 12,
    embeddedGilroy: fonts.embeddedGilroy
  });
  drawText(page, "İLETİŞİM", 368, 138, { font: fonts.black, size: 8.4, color: NAVY, embeddedGilroy: fonts.embeddedGilroy });
  drawText(page, data.website, 368, 122, { font: fonts.regular, size: 8.2, color: TEXT, maxWidth: 170, embeddedGilroy: fonts.embeddedGilroy });
  drawText(page, data.email, 368, 109, { font: fonts.regular, size: 8.2, color: TEXT, maxWidth: 170, embeddedGilroy: fonts.embeddedGilroy });
  drawText(page, data.phone, 368, 96, { font: fonts.regular, size: 8.2, color: TEXT, maxWidth: 170, embeddedGilroy: fonts.embeddedGilroy });
  drawText(page, data.address, 368, 83, { font: fonts.regular, size: 8.2, color: TEXT, maxWidth: 170, embeddedGilroy: fonts.embeddedGilroy });
  drawBox(page, 42, 42, 511, 26, { fill: SOFT });
  drawWrappedText(page, data.registryNote, 56, 53, 470, {
    font: fonts.regular,
    size: 7.5,
    color: MUTED,
    maxLines: 1,
    embeddedGilroy: fonts.embeddedGilroy
  });
}

function drawReceiptPage(page: PDFPage, data: ReceiptPdfData, fonts: ReceiptPdfFonts, logo: PDFImage | null) {
  drawBox(page, 0, 0, PAGE_WIDTH, PAGE_HEIGHT, { fill: WHITE });
  drawHeader(page, data, fonts, logo);
  drawTitle(page, fonts);
  drawDonorPanel(page, data, fonts);
  drawSummaryTable(page, data, fonts);
  drawTotalBox(page, data, fonts);
  drawTransparency(page, data, fonts);
  drawFooter(page, data, fonts);
}

export async function generateReceiptPdfBuffer(data: ReceiptPdfData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const fonts = await loadReceiptFonts(pdfDoc);
  const logo = await loadOfficialLogo(pdfDoc);

  drawReceiptPage(page, data, fonts, logo);

  const pdfBytes = await pdfDoc.save({
    useObjectStreams: false
  });

  return Buffer.from(pdfBytes);
}
