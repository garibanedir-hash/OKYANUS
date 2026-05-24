import "server-only";

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
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

type PdfImage = {
  width: number;
  height: number;
  compressedRgb: Buffer;
};

type DecodedRgbImage = {
  width: number;
  height: number;
  rgb: Buffer;
};

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const NAVY = "#0F2547";
const TURQUOISE = "#1F8083";
const INK = "#223044";
const MUTED = "#637083";
const BORDER = "#DDE7EA";
const SOFT = "#F7FAFB";
const SOFT_TURQUOISE = "#EAF7F7";
const WHITE = "#FFFFFF";

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

function toPdfSafeText(value: string) {
  return value
    .replace(/[çÇğĞıİöÖşŞüÜ₺]/g, (char) => TURKISH_CHAR_MAP[char] ?? char)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapePdfText(value: string) {
  return toPdfSafeText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
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
  if (!provider) return "Ortak ödeme kaydı";
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
    website: "okyanusyardim.org",
    email: "bilgi@okyanusyardim.org",
    phone: "+90 212 000 00 00",
    address: "İstanbul / Türkiye"
  };
}

function hexToRgb(hex: string) {
  const value = hex.replace("#", "");
  const r = Number.parseInt(value.slice(0, 2), 16) / 255;
  const g = Number.parseInt(value.slice(2, 4), 16) / 255;
  const b = Number.parseInt(value.slice(4, 6), 16) / 255;
  return `${r.toFixed(4)} ${g.toFixed(4)} ${b.toFixed(4)}`;
}

function fillColor(hex: string) {
  return `${hexToRgb(hex)} rg`;
}

function strokeColor(hex: string) {
  return `${hexToRgb(hex)} RG`;
}

function n(value: number) {
  return Number(value.toFixed(2)).toString();
}

function rect(x: number, y: number, width: number, height: number, options: { fill?: string; stroke?: string; strokeWidth?: number } = {}) {
  const ops = ["q"];
  if (options.fill) ops.push(fillColor(options.fill));
  if (options.stroke) ops.push(strokeColor(options.stroke));
  if (options.strokeWidth) ops.push(`${n(options.strokeWidth)} w`);
  ops.push(`${n(x)} ${n(y)} ${n(width)} ${n(height)} re`);
  ops.push(options.fill && options.stroke ? "B" : options.fill ? "f" : "S");
  ops.push("Q");
  return `${ops.join(" ")}\n`;
}

function line(x1: number, y1: number, x2: number, y2: number, color = BORDER, strokeWidth = 1) {
  return `q ${strokeColor(color)} ${n(strokeWidth)} w ${n(x1)} ${n(y1)} m ${n(x2)} ${n(y2)} l S Q\n`;
}

function estimateTextWidth(value: string, size: number, font = "F1") {
  const ratio = font === "F2" ? 0.56 : 0.5;
  return toPdfSafeText(value).length * size * ratio;
}

function text(
  value: string,
  x: number,
  y: number,
  size: number,
  options: { font?: "F1" | "F2" | "F3"; color?: string; align?: "left" | "right" | "center" } = {}
) {
  const font = options.font ?? "F1";
  const safe = escapePdfText(value);
  const width = estimateTextWidth(value, size, font);
  const tx = options.align === "right" ? x - width : options.align === "center" ? x - width / 2 : x;
  return `BT ${fillColor(options.color ?? INK)} /${font} ${n(size)} Tf ${n(tx)} ${n(y)} Td (${safe}) Tj ET\n`;
}

function wrapText(value: string, maxWidth: number, size: number, font: "F1" | "F2" | "F3" = "F1") {
  const words = toPdfSafeText(value).split(" ").filter(Boolean);
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (estimateTextWidth(next, size, font) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });

  if (current) lines.push(current);
  return lines;
}

function wrappedText(value: string, x: number, y: number, maxWidth: number, size: number, options: { color?: string; font?: "F1" | "F2" | "F3"; maxLines?: number; leading?: number } = {}) {
  const font = options.font ?? "F1";
  const leading = options.leading ?? size + 4;
  return wrapText(value, maxWidth, size, font)
    .slice(0, options.maxLines ?? 5)
    .map((lineValue, index) => text(lineValue, x, y - index * leading, size, { color: options.color, font }))
    .join("");
}

function labelValue(label: string, value: string, x: number, y: number, valueWidth = 170) {
  return [
    text(label.toUpperCase(), x, y, 7.5, { font: "F2", color: MUTED }),
    wrappedText(value || "-", x, y - 14, valueWidth, 10, { font: "F2", color: INK, maxLines: 1 })
  ].join("");
}

function metaRow(label: string, value: string, y: number) {
  return [
    text(label, 382, y, 7.5, { font: "F2", color: MUTED }),
    text(value, 548, y, 9.2, { font: "F2", color: NAVY, align: "right" })
  ].join("");
}

function drawImage(name: string, x: number, y: number, width: number, height: number) {
  return `q ${n(width)} 0 0 ${n(height)} ${n(x)} ${n(y)} cm /${name} Do Q\n`;
}

function paethPredictor(left: number, above: number, upperLeft: number) {
  const p = left + above - upperLeft;
  const pa = Math.abs(p - left);
  const pb = Math.abs(p - above);
  const pc = Math.abs(p - upperLeft);
  if (pa <= pb && pa <= pc) return left;
  if (pb <= pc) return above;
  return upperLeft;
}

function parsePng(buffer: Buffer): DecodedRgbImage {
  const signature = "89504e470d0a1a0a";
  if (buffer.subarray(0, 8).toString("hex") !== signature) {
    throw new Error("Logo PNG imzası geçersiz.");
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlace = 0;
  const idatChunks: Buffer[] = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    offset += length + 12;

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === "IDAT") {
      idatChunks.push(data);
    } else if (type === "IEND") {
      break;
    }
  }

  if (!width || !height || bitDepth !== 8 || interlace !== 0) {
    throw new Error("Logo PNG formatı PDF embed için uygun değil.");
  }

  const bytesPerPixelByColorType: Record<number, number> = {
    0: 1,
    2: 3,
    4: 2,
    6: 4
  };
  const bytesPerPixel = bytesPerPixelByColorType[colorType];
  if (!bytesPerPixel) throw new Error("Logo PNG renk tipi desteklenmiyor.");

  const inflated = zlib.inflateSync(Buffer.concat(idatChunks));
  const rowLength = width * bytesPerPixel;
  const pixels = Buffer.alloc(rowLength * height);
  let inputOffset = 0;

  for (let y = 0; y < height; y += 1) {
    const filter = inflated[inputOffset];
    inputOffset += 1;
    const rowStart = y * rowLength;
    const previousRowStart = (y - 1) * rowLength;

    for (let x = 0; x < rowLength; x += 1) {
      const raw = inflated[inputOffset];
      inputOffset += 1;
      const left = x >= bytesPerPixel ? pixels[rowStart + x - bytesPerPixel] : 0;
      const up = y > 0 ? pixels[previousRowStart + x] : 0;
      const upperLeft = y > 0 && x >= bytesPerPixel ? pixels[previousRowStart + x - bytesPerPixel] : 0;
      let value = raw;

      if (filter === 1) value = raw + left;
      else if (filter === 2) value = raw + up;
      else if (filter === 3) value = raw + Math.floor((left + up) / 2);
      else if (filter === 4) value = raw + paethPredictor(left, up, upperLeft);
      else if (filter !== 0) throw new Error("Logo PNG filter tipi desteklenmiyor.");

      pixels[rowStart + x] = value & 255;
    }
  }

  const rgb = Buffer.alloc(width * height * 3);
  for (let index = 0; index < width * height; index += 1) {
    const source = index * bytesPerPixel;
    const target = index * 3;
    if (colorType === 6) {
      const alpha = pixels[source + 3] / 255;
      rgb[target] = Math.round(pixels[source] * alpha + 255 * (1 - alpha));
      rgb[target + 1] = Math.round(pixels[source + 1] * alpha + 255 * (1 - alpha));
      rgb[target + 2] = Math.round(pixels[source + 2] * alpha + 255 * (1 - alpha));
    } else if (colorType === 2) {
      rgb[target] = pixels[source];
      rgb[target + 1] = pixels[source + 1];
      rgb[target + 2] = pixels[source + 2];
    } else {
      const gray = pixels[source];
      const alpha = colorType === 4 ? pixels[source + 1] / 255 : 1;
      const composited = Math.round(gray * alpha + 255 * (1 - alpha));
      rgb[target] = composited;
      rgb[target + 1] = composited;
      rgb[target + 2] = composited;
    }
  }

  return { width, height, rgb };
}

function downsampleImage(image: DecodedRgbImage, maxWidth: number): DecodedRgbImage {
  if (image.width <= maxWidth) return image;

  const width = maxWidth;
  const height = Math.max(1, Math.round((image.height * width) / image.width));
  const rgb = Buffer.alloc(width * height * 3);

  for (let y = 0; y < height; y += 1) {
    const sourceY = Math.min(image.height - 1, Math.floor((y * image.height) / height));
    for (let x = 0; x < width; x += 1) {
      const sourceX = Math.min(image.width - 1, Math.floor((x * image.width) / width));
      const source = (sourceY * image.width + sourceX) * 3;
      const target = (y * width + x) * 3;
      rgb[target] = image.rgb[source];
      rgb[target + 1] = image.rgb[source + 1];
      rgb[target + 2] = image.rgb[source + 2];
    }
  }

  return { width, height, rgb };
}

function loadOfficialLogo(): PdfImage | null {
  const logoPath = path.join(process.cwd(), "public", "brand", "logo.png");
  try {
    const decoded = downsampleImage(parsePng(fs.readFileSync(logoPath)), 900);
    return {
      width: decoded.width,
      height: decoded.height,
      compressedRgb: zlib.deflateSync(decoded.rgb)
    };
  } catch (error) {
    console.warn("[receipt-pdf] official_logo_embed_failed", {
      path: "public/brand/logo.png",
      message: error instanceof Error ? error.message : "Bilinmeyen logo embed hatası"
    });
    return null;
  }
}

function drawHeader(data: ReceiptPdfData, hasLogo: boolean) {
  const logoLockup = hasLogo
    ? drawImage("Logo", 42, 758, 150, 60)
    : [
        rect(42, 776, 28, 28, { fill: TURQUOISE }),
        text("OKYANUS", 78, 790, 17, { font: "F2", color: NAVY }),
        text("INSANI YARDIM DERNEGI", 78, 776, 8.5, { font: "F2", color: MUTED })
      ].join("");

  return [
    rect(0, PAGE_HEIGHT - 10, PAGE_WIDTH, 10, { fill: NAVY }),
    rect(0, PAGE_HEIGHT - 13, PAGE_WIDTH, 3, { fill: TURQUOISE }),
    logoLockup,
    line(358, 760, 358, 814, TURQUOISE, 2),
    metaRow("Makbuz No", data.receiptNo, 800),
    metaRow("Ödeme No", data.paymentIntentNo, 784),
    metaRow("Tarih", data.dateLabel, 768),
    metaRow("Durum", data.paymentStatusLabel, 752)
  ].join("");
}

function drawTitle(data: ReceiptPdfData) {
  return [
    text("BAĞIŞ MAKBUZU", 42, 714, 27, { font: "F2", color: NAVY }),
    rect(42, 698, 94, 3, { fill: TURQUOISE }),
    wrappedText(
      "Aşağıda bilgileri yer alan bağış, Okyanus İnsani Yardım Derneği kayıtlarına alınmış olup teşekkür ederiz.",
      42,
      680,
      500,
      10.2,
      { color: MUTED, maxLines: 2 }
    )
  ].join("");
}

function drawDonorPanel(data: ReceiptPdfData) {
  return [
    rect(42, 544, 511, 116, { fill: SOFT, stroke: BORDER, strokeWidth: 1 }),
    rect(42, 636, 511, 24, { fill: NAVY }),
    text("BAĞIŞÇI BİLGİLERİ", 56, 644, 9, { font: "F2", color: WHITE }),
    labelValue("Bağışçı Adı Soyadı", data.donorName, 58, 617, 210),
    labelValue("E-posta", data.donorEmail, 58, 581, 210),
    labelValue("Telefon", data.donorPhone, 58, 553, 210),
    labelValue("Bağış Türü", data.contextLabel, 305, 617, 190),
    labelValue("Proje / Kampanya", data.projectOrCampaign, 305, 581, 190),
    labelValue("Ödeme Yöntemi", data.paymentProviderLabel, 305, 553, 190),
    text("Ödeme Durumu", 452, 617, 7.5, { font: "F2", color: MUTED }),
    rect(452, 591, 78, 18, { fill: SOFT_TURQUOISE, stroke: "#B9E1E2", strokeWidth: 0.8 }),
    text(data.paymentStatusLabel, 491, 597, 8.4, { font: "F2", color: TURQUOISE, align: "center" })
  ].join("");
}

function drawSummaryTable(data: ReceiptPdfData) {
  return [
    text("BAĞIŞ ÖZETİ", 42, 507, 12, { font: "F2", color: NAVY }),
    rect(42, 412, 511, 78, { fill: WHITE, stroke: BORDER, strokeWidth: 1 }),
    rect(42, 464, 511, 26, { fill: "#F2F7F8" }),
    text("AÇIKLAMA", 56, 474, 8, { font: "F2", color: MUTED }),
    text("TUTAR", 332, 474, 8, { font: "F2", color: MUTED }),
    text("ADET", 424, 474, 8, { font: "F2", color: MUTED }),
    text("TOPLAM", 530, 474, 8, { font: "F2", color: MUTED, align: "right" }),
    line(42, 464, 553, 464, BORDER),
    line(310, 412, 310, 490, BORDER),
    line(406, 412, 406, 490, BORDER),
    line(462, 412, 462, 490, BORDER),
    wrappedText(data.description, 56, 446, 228, 9.2, { color: INK, font: "F2", maxLines: 2 }),
    text(data.amountLabel, 332, 438, 9.4, { font: "F2", color: INK }),
    text("1", 434, 438, 9.4, { font: "F2", color: INK }),
    text(data.amountLabel, 530, 438, 9.4, { font: "F2", color: NAVY, align: "right" })
  ].join("");
}

function drawTotal(data: ReceiptPdfData) {
  return [
    rect(42, 334, 511, 54, { fill: SOFT_TURQUOISE, stroke: "#B9E1E2", strokeWidth: 1 }),
    text("TOPLAM TUTAR", 58, 360, 9, { font: "F2", color: NAVY }),
    text("Bağış kayıt toplamı", 58, 345, 8.3, { color: MUTED }),
    text(data.amountLabel, 535, 350, 23, { font: "F2", color: TURQUOISE, align: "right" })
  ].join("");
}

function drawTransparency(data: ReceiptPdfData) {
  return [
    rect(42, 208, 511, 92, { fill: WHITE, stroke: BORDER, strokeWidth: 1 }),
    rect(42, 296, 511, 4, { fill: TURQUOISE }),
    text("KURUMSAL ŞEFFAFLIK", 58, 276, 10.5, { font: "F2", color: NAVY }),
    wrappedText(data.transparencyNote, 58, 255, 475, 8.6, { color: INK, maxLines: 5, leading: 12 })
  ].join("");
}

function drawFooter(data: ReceiptPdfData) {
  return [
    line(42, 164, 553, 164, BORDER),
    text("TEŞEKKÜR EDERİZ", 42, 138, 13, { font: "F2", color: NAVY }),
    wrappedText(data.thankYouText, 42, 119, 280, 8.8, { color: MUTED, maxLines: 2, leading: 12 }),
    text("İLETİŞİM", 368, 138, 8.4, { font: "F2", color: NAVY }),
    text(data.website, 368, 122, 8.2, { color: INK }),
    text(data.email, 368, 109, 8.2, { color: INK }),
    text(data.phone, 368, 96, 8.2, { color: INK }),
    text(data.address, 368, 83, 8.2, { color: INK }),
    rect(42, 42, 511, 26, { fill: SOFT }),
    wrappedText(data.registryNote, 56, 53, 470, 7.5, { color: MUTED, maxLines: 1 })
  ].join("");
}

function drawReceiptPage(data: ReceiptPdfData, hasLogo: boolean) {
  return [
    rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, { fill: WHITE }),
    drawHeader(data, hasLogo),
    drawTitle(data),
    drawDonorPanel(data),
    drawSummaryTable(data),
    drawTotal(data),
    drawTransparency(data),
    drawFooter(data)
  ].join("");
}

function pdfObject(objectNumber: number, body: string | Buffer) {
  const bodyBuffer = typeof body === "string" ? Buffer.from(body, "latin1") : body;
  return Buffer.concat([
    Buffer.from(`${objectNumber} 0 obj\n`, "latin1"),
    bodyBuffer,
    Buffer.from("\nendobj\n", "latin1")
  ]);
}

function streamObject(dictionary: string, stream: Buffer) {
  return Buffer.concat([
    Buffer.from(`${dictionary}\nstream\n`, "latin1"),
    stream,
    Buffer.from("\nendstream", "latin1")
  ]);
}

function buildPdf(objects: Array<string | Buffer>) {
  const chunks: Buffer[] = [Buffer.from("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n", "binary")];
  const offsets = [0];
  let length = chunks[0].byteLength;

  objects.forEach((object, index) => {
    offsets[index + 1] = length;
    const objectBuffer = pdfObject(index + 1, object);
    chunks.push(objectBuffer);
    length += objectBuffer.byteLength;
  });

  const xrefOffset = length;
  const xrefRows = offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("");
  const trailer = [
    `xref\n0 ${objects.length + 1}\n`,
    "0000000000 65535 f \n",
    xrefRows,
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`,
    `startxref\n${xrefOffset}\n%%EOF\n`
  ].join("");

  chunks.push(Buffer.from(trailer, "latin1"));
  return Buffer.concat(chunks);
}

export function generateReceiptPdfBuffer(data: ReceiptPdfData): Buffer {
  const logo = loadOfficialLogo();
  const hasLogo = Boolean(logo);
  const logoObjectNumber = hasLogo ? 7 : null;
  const contentObjectNumber = hasLogo ? 8 : 7;
  const content = Buffer.from(drawReceiptPage(data, hasLogo), "latin1");
  const xObjectResources = logoObjectNumber ? ` /XObject << /Logo ${logoObjectNumber} 0 R >>` : "";
  const pageObject = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 4 0 R /F2 5 0 R /F3 6 0 R >>${xObjectResources} >> /Contents ${contentObjectNumber} 0 R >>`;
  const objects: Array<string | Buffer> = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    pageObject,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>"
  ];

  if (logo) {
    objects.push(
      streamObject(
        `<< /Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /Length ${logo.compressedRgb.byteLength} >>`,
        logo.compressedRgb
      )
    );
  }

  objects.push(streamObject(`<< /Length ${content.byteLength} >>`, content));

  return buildPdf(objects);
}
