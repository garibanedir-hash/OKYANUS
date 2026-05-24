import "server-only";

import type { PaymentContextType, PaymentIntentStatus, ReceiptStatus } from "@/data/paymentMock";
import { paymentContextTypeLabels, paymentIntentStatusLabels, receiptStatusLabels } from "@/data/paymentMock";

export type ReceiptPdfInput = {
  receiptNo: string;
  paymentIntentNo?: string | null;
  contextType: PaymentContextType;
  donorName?: string | null;
  donorEmail?: string | null;
  amount: number;
  currency: string;
  receiptStatus: ReceiptStatus;
  paymentStatus?: PaymentIntentStatus | null;
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
  contextLabel: string;
  amountLabel: string;
  paymentStatusLabel: string;
  receiptStatusLabel: string;
  description: string;
  legalNote: string;
  footer: string;
};

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
  "₺": "TRY"
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
  return paymentContextTypeLabels[contextType] ?? "Bagis";
}

export function formatReceiptAmount(amount: number, currency: string) {
  return `${new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)} ${currency}`;
}

export function formatReceiptDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.valueOf())) return "Tarih guncellenecek";

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(parsed);
}

export function buildReceiptPdfData(receipt: ReceiptPdfInput): ReceiptPdfData {
  return {
    brandName: "Okyanus Insani Yardim Dernegi",
    receiptNo: receipt.receiptNo,
    paymentIntentNo: receipt.paymentIntentNo ?? "Odeme kaydi yok",
    dateLabel: formatPdfDateValue(receipt.generatedAt ?? receipt.issuedAt ?? receipt.createdAt),
    donorName: receipt.donorName?.trim() || "Bagisci",
    donorEmail: receipt.donorEmail?.trim() || "E-posta bilgisi yok",
    contextLabel: getReceiptContextLabel(receipt.contextType),
    amountLabel: formatReceiptAmount(receipt.amount, receipt.currency),
    paymentStatusLabel: receipt.paymentStatus ? paymentIntentStatusLabels[receipt.paymentStatus] : "Odeme kaydi",
    receiptStatusLabel: receiptStatusLabels[receipt.receiptStatus] ?? receipt.receiptStatus,
    description: receipt.description?.trim() || "Okyanus ortak odeme altyapisi ile olusturulan makbuz hazirlik ciktisi.",
    legalNote:
      "Bu belge odeme kaydinin sistemde olusturulan makbuz ciktisidir. Resmi muhasebe/mali surecler dernek yonetimi tarafindan ayrica dogrulanmalidir.",
    footer: "Okyanus Insani Yardim Dernegi"
  };
}

function textLine(label: string, value: string, x: number, y: number, size = 11) {
  return `BT /F1 ${size} Tf ${x} ${y} Td (${escapePdfText(`${label}: ${value}`)}) Tj ET\n`;
}

function titleLine(value: string, x: number, y: number, size = 19) {
  return `BT /F1 ${size} Tf ${x} ${y} Td (${escapePdfText(value)}) Tj ET\n`;
}

function paragraphLines(value: string, x: number, y: number, maxChars = 84) {
  const words = toPdfSafeText(value).split(" ");
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });

  if (current) lines.push(current);

  return lines
    .slice(0, 5)
    .map((line, index) => `BT /F1 9 Tf ${x} ${y - index * 14} Td (${escapePdfText(line)}) Tj ET\n`)
    .join("");
}

export function generateReceiptPdfBuffer(data: ReceiptPdfData): Buffer {
  const content = [
    titleLine(data.brandName, 50, 790, 20),
    titleLine("Makbuz", 50, 760, 16),
    textLine("Makbuz No", data.receiptNo, 50, 720),
    textLine("Odeme No", data.paymentIntentNo, 50, 700),
    textLine("Tarih", data.dateLabel, 50, 680),
    textLine("Bagisci", data.donorName, 50, 650),
    textLine("E-posta", data.donorEmail, 50, 630),
    textLine("Bagis Turu", data.contextLabel, 50, 600),
    textLine("Tutar", data.amountLabel, 50, 580),
    textLine("Odeme Durumu", data.paymentStatusLabel, 50, 560),
    textLine("Makbuz Durumu", data.receiptStatusLabel, 50, 540),
    titleLine("Aciklama", 50, 505, 12),
    paragraphLines(data.description, 50, 485),
    titleLine("Kurumsal Not", 50, 390, 12),
    paragraphLines(data.legalNote, 50, 370),
    `BT /F1 9 Tf 50 70 Td (${escapePdfText(data.footer)}) Tj ET\n`
  ].join("");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}endstream`
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, "latin1");
}
