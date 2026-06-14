import "server-only";

import fs from "node:fs";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, StandardFonts, rgb, type PDFImage, type PDFPage, type PDFFont, type RGB } from "pdf-lib";
import type { ManualReceipt } from "@/data/manualReceiptMock";

type ManualReceiptFonts = {
  regular: PDFFont;
  bold: PDFFont;
  black: PDFFont;
  embeddedGilroy: boolean;
};

const PAGE_WIDTH = 841.89;
const PAGE_HEIGHT = 595.28;
const NAVY = "#0F2547";
const TEAL = "#1F8083";
const TEXT = "#1F2937";
const MUTED = "#64748B";
const BORDER = "#D7DEE8";
const SOFT = "#F7FAFB";
const WHITE = "#FFFFFF";
const FONT_DIR = path.join(process.cwd(), "app", "fonts");
const LOGO_PATH = path.join(process.cwd(), "public", "brand", "logo.png");

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

function hexToRgb(hex: string): RGB {
  const value = hex.replace("#", "");
  return rgb(
    Number.parseInt(value.slice(0, 2), 16) / 255,
    Number.parseInt(value.slice(2, 4), 16) / 255,
    Number.parseInt(value.slice(4, 6), 16) / 255
  );
}

function normalizeForFallback(value: string) {
  return value
    .replace(/[çÇğĞıİöÖşŞüÜ₺]/g, (char) => TURKISH_CHAR_MAP[char] ?? char)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function safeText(value: string | number | null | undefined, embeddedGilroy: boolean) {
  const text = String(value ?? "-").replace(/\s+/g, " ").trim() || "-";
  return embeddedGilroy ? text : normalizeForFallback(text);
}

function resolveFontPath(fileName: string) {
  const candidates = [fileName.replace(".ttf", ".ttf"), fileName.replace(".ttf", ".woff2")];
  return candidates.map((candidate) => path.join(FONT_DIR, candidate)).find((candidate) => fs.existsSync(candidate)) ?? null;
}

async function embedFont(pdfDoc: PDFDocument, fileName: string) {
  const fontPath = resolveFontPath(fileName);
  if (!fontPath) return null;
  try {
    return await pdfDoc.embedFont(fs.readFileSync(fontPath), { subset: true });
  } catch {
    return null;
  }
}

async function loadFonts(pdfDoc: PDFDocument): Promise<ManualReceiptFonts> {
  pdfDoc.registerFontkit(fontkit);
  const [fallbackRegular, fallbackBold, regular, bold, black] = await Promise.all([
    pdfDoc.embedFont(StandardFonts.Helvetica),
    pdfDoc.embedFont(StandardFonts.HelveticaBold),
    embedFont(pdfDoc, "Gilroy-Regular.ttf"),
    embedFont(pdfDoc, "Gilroy-Bold.ttf"),
    embedFont(pdfDoc, "Gilroy-Black.ttf")
  ]);
  const embeddedGilroy = Boolean(regular && bold && black);

  return {
    regular: regular ?? fallbackRegular,
    bold: bold ?? fallbackBold,
    black: black ?? bold ?? fallbackBold,
    embeddedGilroy
  };
}

async function loadLogo(pdfDoc: PDFDocument) {
  try {
    if (!fs.existsSync(LOGO_PATH)) return null;
    return await pdfDoc.embedPng(fs.readFileSync(LOGO_PATH));
  } catch {
    return null;
  }
}

function drawBox(page: PDFPage, x: number, y: number, width: number, height: number, fill?: string, border = BORDER) {
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: fill ? hexToRgb(fill) : undefined,
    borderColor: border ? hexToRgb(border) : undefined,
    borderWidth: border ? 0.8 : undefined
  });
}

function textWidth(value: string, font: PDFFont, size: number, embeddedGilroy: boolean) {
  return font.widthOfTextAtSize(safeText(value, embeddedGilroy), size);
}

function truncate(value: string, maxWidth: number, font: PDFFont, size: number, embeddedGilroy: boolean) {
  const source = safeText(value, embeddedGilroy);
  if (textWidth(source, font, size, embeddedGilroy) <= maxWidth) return source;
  let result = source;
  while (result.length > 1 && textWidth(`${result}...`, font, size, embeddedGilroy) > maxWidth) {
    result = result.slice(0, -1);
  }
  return `${result.trim()}...`;
}

function drawText(
  page: PDFPage,
  value: string | number | null | undefined,
  x: number,
  y: number,
  options: {
    font: PDFFont;
    size: number;
    color?: string;
    maxWidth?: number;
    align?: "left" | "right" | "center";
    embeddedGilroy: boolean;
  }
) {
  const text = options.maxWidth
    ? truncate(String(value ?? "-"), options.maxWidth, options.font, options.size, options.embeddedGilroy)
    : safeText(value, options.embeddedGilroy);
  const width = options.font.widthOfTextAtSize(text, options.size);
  const adjustedX = options.align === "right" ? x - width : options.align === "center" ? x - width / 2 : x;
  page.drawText(text, {
    x: adjustedX,
    y,
    size: options.size,
    font: options.font,
    color: hexToRgb(options.color ?? TEXT)
  });
}

function wrap(value: string, maxWidth: number, font: PDFFont, size: number, embeddedGilroy: boolean, maxLines = 3) {
  const words = safeText(value, embeddedGilroy).split(" ").filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (current && textWidth(next, font, size, embeddedGilroy) > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, maxLines);
}

function drawWrapped(page: PDFPage, value: string, x: number, y: number, maxWidth: number, options: { font: PDFFont; size: number; color?: string; leading?: number; maxLines?: number; embeddedGilroy: boolean }) {
  const lines = wrap(value, maxWidth, options.font, options.size, options.embeddedGilroy, options.maxLines ?? 3);
  const leading = options.leading ?? options.size + 4;
  lines.forEach((line, index) => {
    drawText(page, line, x, y - index * leading, {
      font: options.font,
      size: options.size,
      color: options.color,
      maxWidth,
      embeddedGilroy: options.embeddedGilroy
    });
  });
}

function drawField(page: PDFPage, label: string, value: string | number | null | undefined, x: number, y: number, width: number, fonts: ManualReceiptFonts, height = 34) {
  drawBox(page, x, y, width, height, WHITE, BORDER);
  drawText(page, label.toLocaleUpperCase("tr-TR"), x + 8, y + height - 12, {
    font: fonts.bold,
    size: 6.8,
    color: MUTED,
    maxWidth: width - 16,
    embeddedGilroy: fonts.embeddedGilroy
  });
  drawText(page, value ?? "-", x + 8, y + 8, {
    font: fonts.bold,
    size: 9,
    color: NAVY,
    maxWidth: width - 16,
    embeddedGilroy: fonts.embeddedGilroy
  });
}

function formatAmount(receipt: ManualReceipt) {
  const currency = receipt.currency === "TRY" ? "TL" : receipt.currency;
  return `${new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(receipt.amount)} ${currency}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "Tarih güncellenecek";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function drawHeader(page: PDFPage, receipt: ManualReceipt, fonts: ManualReceiptFonts, logo: PDFImage | null) {
  drawBox(page, 0, PAGE_HEIGHT - 12, PAGE_WIDTH, 12, NAVY, NAVY);
  drawBox(page, 0, PAGE_HEIGHT - 16, PAGE_WIDTH, 4, TEAL, TEAL);

  if (logo) {
    const box = { x: 36, y: 512, width: 150, height: 48 };
    const scale = Math.min(box.width / logo.width, box.height / logo.height);
    page.drawImage(logo, {
      x: box.x,
      y: box.y + (box.height - logo.height * scale) / 2,
      width: logo.width * scale,
      height: logo.height * scale
    });
  } else {
    drawText(page, "OKYANUS", 36, 535, { font: fonts.black, size: 18, color: NAVY, embeddedGilroy: fonts.embeddedGilroy });
    drawText(page, "İNSANİ YARDIM DERNEĞİ", 36, 520, { font: fonts.bold, size: 8, color: MUTED, embeddedGilroy: fonts.embeddedGilroy });
  }

  drawText(page, "MANUEL BAĞIŞ MAKBUZU", PAGE_WIDTH / 2, 535, {
    font: fonts.black,
    size: 21,
    color: NAVY,
    align: "center",
    embeddedGilroy: fonts.embeddedGilroy
  });
  drawText(page, "Fiziksel / saha tipi tahsilat formu", PAGE_WIDTH / 2, 516, {
    font: fonts.bold,
    size: 8.5,
    color: TEAL,
    align: "center",
    embeddedGilroy: fonts.embeddedGilroy
  });

  drawField(page, "Makbuz No", receipt.receiptNo, 640, 525, 166, fonts, 32);
  drawField(page, "Seri / Sıra", `${receipt.serialNo ?? "-"} / ${receipt.sequenceNo ?? "-"}`, 640, 488, 78, fonts, 32);
  drawField(page, "Tarih", formatDate(receipt.receiptDate), 728, 488, 78, fonts, 32);
}

function drawSignatureBox(page: PDFPage, title: string, name: string | undefined, x: number, y: number, fonts: ManualReceiptFonts) {
  drawBox(page, x, y, 226, 74, WHITE, BORDER);
  drawText(page, title, x + 12, y + 54, { font: fonts.black, size: 8.5, color: NAVY, embeddedGilroy: fonts.embeddedGilroy });
  drawText(page, name || "-", x + 12, y + 34, { font: fonts.bold, size: 8.2, color: TEXT, maxWidth: 190, embeddedGilroy: fonts.embeddedGilroy });
  page.drawLine({ start: { x: x + 12, y: y + 18 }, end: { x: x + 214, y: y + 18 }, color: hexToRgb(BORDER), thickness: 0.8 });
  drawText(page, "İmza", x + 12, y + 6, { font: fonts.regular, size: 7, color: MUTED, embeddedGilroy: fonts.embeddedGilroy });
}

function drawReceipt(page: PDFPage, receipt: ManualReceipt, fonts: ManualReceiptFonts, logo: PDFImage | null) {
  drawBox(page, 0, 0, PAGE_WIDTH, PAGE_HEIGHT, WHITE, WHITE);
  drawHeader(page, receipt, fonts, logo);

  drawField(page, "Bağışçı / Kurum", receipt.donorName, 36, 454, 312, fonts);
  drawField(page, "Telefon", receipt.donorPhone, 360, 454, 150, fonts);
  drawField(page, "E-posta", receipt.donorEmail, 522, 454, 150, fonts);
  drawField(page, "Şube / Birim", [receipt.branchName, receipt.unitName].filter(Boolean).join(" / ") || "-", 684, 454, 122, fonts);

  drawField(page, "Bağış Türü", receipt.donationTypeLabel, 36, 408, 158, fonts);
  drawField(page, "Ödeme Yöntemi", receipt.paymentMethodLabel, 206, 408, 140, fonts);
  drawField(page, "Kampanya / Proje", receipt.campaignName || receipt.projectName || "-", 358, 408, 216, fonts);
  drawField(page, "Tutar Rakamla", formatAmount(receipt), 586, 408, 220, fonts);

  drawBox(page, 36, 336, 770, 58, SOFT, BORDER);
  drawText(page, "TUTAR YAZIYLA", 48, 374, { font: fonts.bold, size: 7, color: MUTED, embeddedGilroy: fonts.embeddedGilroy });
  drawWrapped(page, receipt.amountInWords || "-", 48, 356, 734, {
    font: fonts.black,
    size: 12,
    color: NAVY,
    maxLines: 2,
    leading: 14,
    embeddedGilroy: fonts.embeddedGilroy
  });

  drawBox(page, 36, 250, 770, 70, WHITE, BORDER);
  drawText(page, "BAĞIŞIN AMACI / AÇIKLAMA", 48, 300, { font: fonts.bold, size: 7, color: MUTED, embeddedGilroy: fonts.embeddedGilroy });
  drawWrapped(page, receipt.purpose || receipt.description || "-", 48, 281, 734, {
    font: fonts.regular,
    size: 9,
    color: TEXT,
    maxLines: 3,
    leading: 12,
    embeddedGilroy: fonts.embeddedGilroy
  });

  drawBox(page, 36, 188, 770, 42, "#F2F7F8", BORDER);
  drawWrapped(
    page,
    "Yukarıda bilgileri yer alan bağış tarafımızca teslim alınmıştır. Okyanus İnsani Yardım Derneği, yapılan bu bağışı ilgili mevzuat ve dernek amaçları doğrultusunda kullanmayı taahhüt eder.",
    50,
    214,
    742,
    { font: fonts.bold, size: 8.5, color: NAVY, maxLines: 2, leading: 12, embeddedGilroy: fonts.embeddedGilroy }
  );

  drawSignatureBox(page, "Teslim Alan", receipt.collectorName, 36, 92, fonts);
  drawSignatureBox(page, "Muhasebe / Yetkili", receipt.accountingOfficerName, 308, 92, fonts);
  drawSignatureBox(page, "Onay", receipt.approvedByName, 580, 92, fonts);

  drawText(page, "Bu belge manuel/fiziksel makbuz çıktısı olarak oluşturulmuştur. Resmî belge niteliği, seri-sıra kullanımı ve arşiv süresi dernek yönetimi ve mali müşavir onayıyla kesinleşmelidir.", 36, 48, {
    font: fonts.regular,
    size: 7.5,
    color: MUTED,
    maxWidth: 770,
    embeddedGilroy: fonts.embeddedGilroy
  });
  drawText(page, "okyanus.org.tr · bilgi@okyanus.org.tr · İstanbul / Türkiye", 36, 32, {
    font: fonts.bold,
    size: 7.8,
    color: NAVY,
    maxWidth: 770,
    embeddedGilroy: fonts.embeddedGilroy
  });
}

export async function generateManualReceiptPdfBuffer(receipt: ManualReceipt): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const fonts = await loadFonts(pdfDoc);
  const logo = await loadLogo(pdfDoc);
  drawReceipt(page, receipt, fonts, logo);
  const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
  return Buffer.from(pdfBytes);
}
