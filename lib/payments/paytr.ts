import "server-only";

import crypto from "node:crypto";
import type { PaymentIntentStatus } from "@/data/paymentMock";

const DEFAULT_TOKEN_URL = "https://www.paytr.com/odeme/api/get-token";
const FALLBACK_EMAIL = "bagisci@example.org";
const FALLBACK_NAME = "Okyanus Bağışçısı";
const FALLBACK_PHONE = "0000000000";
const FALLBACK_ADDRESS = "Okyanus İnsani Yardım Derneği";

export type PaytrConfig = {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
  testMode: boolean;
  debugOn: boolean;
  iframeTokenUrl: string;
  siteUrl: string | null;
};

export type PaytrTokenInput = {
  intentNo: string;
  amount: number;
  currency?: string | null;
  donorName?: string | null;
  donorEmail?: string | null;
  donorPhone?: string | null;
  description?: string | null;
  userIp: string;
  siteUrl?: string | null;
  userAddress?: string | null;
  noInstallment?: 0 | 1;
  maxInstallment?: number;
  timeoutLimit?: number;
  lang?: "tr" | "en";
};

export type PaytrTokenPayload = {
  merchant_id: string;
  user_ip: string;
  merchant_oid: string;
  email: string;
  payment_amount: string;
  paytr_token: string;
  user_basket: string;
  debug_on: "0" | "1";
  no_installment: string;
  max_installment: string;
  user_name: string;
  user_address: string;
  user_phone: string;
  merchant_ok_url: string;
  merchant_fail_url: string;
  timeout_limit: string;
  currency: string;
  test_mode: "0" | "1";
  lang: "tr" | "en";
};

export type PaytrIframeTokenResult = {
  token: string;
  merchantOid: string;
  paymentAmount: number;
  payload: PaytrTokenPayload;
};

export type PaytrCallbackPayload = {
  merchant_oid: string;
  status: string;
  total_amount: string;
  hash: string;
  failed_reason_code?: string;
  failed_reason_msg?: string;
  payment_type?: string;
  currency?: string;
  payment_amount?: string;
  installment_count?: string;
  test_mode?: string;
  [key: string]: string | undefined;
};

export class PaytrConfigError extends Error {
  constructor(message = "PayTR test yapılandırması eksik.") {
    super(message);
    this.name = "PaytrConfigError";
  }
}

export class PaytrRequestError extends Error {
  constructor(message = "PayTR test token isteği tamamlanamadı.") {
    super(message);
    this.name = "PaytrRequestError";
  }
}

function readBoolean(value: string | undefined, fallback: boolean) {
  if (value === undefined || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

function trimSlash(value: string) {
  return value.trim().replace(/\/+$/, "");
}

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new PaytrConfigError("PayTR test yapılandırması eksik.");
  return value;
}

function normalizePaytrCurrency(value: string | null | undefined) {
  const currency = value?.trim().toUpperCase() || "TRY";
  return currency === "TRY" ? "TL" : currency;
}

function formatBasketAmount(amount: number) {
  return amount.toFixed(2);
}

function encodeBasket(description: string, amount: number) {
  const basket = [[description, formatBasketAmount(amount), 1]];
  return Buffer.from(JSON.stringify(basket), "utf8").toString("base64");
}

function toPaytrAmount(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new PaytrRequestError("Ödeme tutarı PayTR için geçerli değil.");
  }

  return Math.round(amount * 100);
}

function safeText(value: string | null | undefined, fallback: string, maxLength: number) {
  const trimmed = value?.trim() || fallback;
  return trimmed.slice(0, maxLength);
}

function safeEmail(value: string | null | undefined) {
  const trimmed = value?.trim().toLowerCase();
  if (!trimmed || !trimmed.includes("@")) return FALLBACK_EMAIL;
  return trimmed.slice(0, 100);
}

function safeIp(value: string) {
  return (value.split(",")[0]?.trim() || "127.0.0.1").slice(0, 39);
}

function hmacBase64(key: string, value: string) {
  return crypto.createHmac("sha256", key).update(value).digest("base64");
}

function timingSafeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function getPaytrConfig(): PaytrConfig {
  return {
    merchantId: requiredEnv("PAYTR_MERCHANT_ID"),
    merchantKey: requiredEnv("PAYTR_MERCHANT_KEY"),
    merchantSalt: requiredEnv("PAYTR_MERCHANT_SALT"),
    testMode: readBoolean(process.env.PAYTR_TEST_MODE, true),
    debugOn: readBoolean(process.env.PAYTR_DEBUG_ON, true),
    iframeTokenUrl: process.env.PAYTR_IFRAME_TOKEN_URL?.trim() || DEFAULT_TOKEN_URL,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ? trimSlash(process.env.NEXT_PUBLIC_SITE_URL) : null
  };
}

export function createPaytrMerchantOid(intentNo: string) {
  const normalized = intentNo.replace(/[^a-zA-Z0-9]/g, "");
  if (!normalized) throw new PaytrRequestError("Ödeme referansı PayTR için geçerli değil.");
  return normalized.slice(0, 64);
}

export function createPaytrTokenPayload(input: PaytrTokenInput): PaytrTokenPayload {
  const config = getPaytrConfig();
  const siteUrl = input.siteUrl ? trimSlash(input.siteUrl) : config.siteUrl;
  if (!siteUrl) throw new PaytrConfigError("PayTR dönüş adresi için NEXT_PUBLIC_SITE_URL tanımlanmalı.");

  const paymentAmount = toPaytrAmount(input.amount);
  const currency = normalizePaytrCurrency(input.currency);
  const merchantOid = createPaytrMerchantOid(input.intentNo);
  const email = safeEmail(input.donorEmail);
  const userName = safeText(input.donorName, FALLBACK_NAME, 60);
  const userPhone = safeText(input.donorPhone, FALLBACK_PHONE, 20);
  const userAddress = safeText(input.userAddress, FALLBACK_ADDRESS, 400);
  const description = safeText(input.description, `Okyanus bağış ödemesi ${input.intentNo}`, 120);
  const userBasket = encodeBasket(description, input.amount);
  const noInstallment = String(input.noInstallment ?? 0);
  const maxInstallment = String(input.maxInstallment ?? 0);
  const testMode = config.testMode ? "1" : "0";
  const debugOn = config.debugOn ? "1" : "0";
  const hashSource =
    config.merchantId +
    safeIp(input.userIp) +
    merchantOid +
    email +
    paymentAmount +
    userBasket +
    noInstallment +
    maxInstallment +
    currency +
    testMode;

  return {
    merchant_id: config.merchantId,
    user_ip: safeIp(input.userIp),
    merchant_oid: merchantOid,
    email,
    payment_amount: String(paymentAmount),
    paytr_token: hmacBase64(config.merchantKey, hashSource + config.merchantSalt),
    user_basket: userBasket,
    debug_on: debugOn as "0" | "1",
    no_installment: noInstallment,
    max_installment: maxInstallment,
    user_name: userName,
    user_address: userAddress,
    user_phone: userPhone,
    merchant_ok_url: `${siteUrl}/odeme/basarili`,
    merchant_fail_url: `${siteUrl}/odeme/basarisiz`,
    timeout_limit: String(input.timeoutLimit ?? 30),
    currency,
    test_mode: testMode as "0" | "1",
    lang: input.lang ?? "tr"
  };
}

export function generatePaytrRequestHash(payload: Pick<
  PaytrTokenPayload,
  "merchant_id" | "user_ip" | "merchant_oid" | "email" | "payment_amount" | "user_basket" | "no_installment" | "max_installment" | "currency" | "test_mode"
>) {
  const config = getPaytrConfig();
  const hashSource =
    payload.merchant_id +
    payload.user_ip +
    payload.merchant_oid +
    payload.email +
    payload.payment_amount +
    payload.user_basket +
    payload.no_installment +
    payload.max_installment +
    payload.currency +
    payload.test_mode;

  return hmacBase64(config.merchantKey, hashSource + config.merchantSalt);
}

export async function requestPaytrIframeToken(input: PaytrTokenInput): Promise<PaytrIframeTokenResult> {
  const config = getPaytrConfig();
  const payload = createPaytrTokenPayload(input);

  const response = await fetch(config.iframeTokenUrl, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(payload),
    cache: "no-store"
  });

  let result: { status?: string; token?: string; reason?: string };
  try {
    result = await response.json();
  } catch {
    throw new PaytrRequestError("PayTR test token yanıtı okunamadı.");
  }

  if (!response.ok || result.status !== "success" || !result.token) {
    throw new PaytrRequestError(result.reason ? "PayTR test token isteği reddedildi." : "PayTR test token alınamadı.");
  }

  return {
    token: result.token,
    merchantOid: payload.merchant_oid,
    paymentAmount: Number(payload.payment_amount),
    payload
  };
}

export function verifyPaytrCallbackHash(callback: PaytrCallbackPayload) {
  const config = getPaytrConfig();
  const expected = hmacBase64(
    config.merchantKey,
    `${callback.merchant_oid}${config.merchantSalt}${callback.status}${callback.total_amount}`
  );

  return timingSafeCompare(expected, callback.hash);
}

export function mapPaytrStatus(status: string): Extract<PaymentIntentStatus, "paid" | "failed" | "cancelled"> {
  if (status === "success") return "paid";
  if (status === "cancelled") return "cancelled";
  return "failed";
}

