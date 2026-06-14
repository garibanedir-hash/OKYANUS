type SafeLogLevel = "info" | "warn" | "error";
type SafeLogContext = Record<string, unknown>;

const REDACTED = "[redacted]";
const MAX_STRING_LENGTH = 500;
const MAX_ARRAY_ITEMS = 20;
const MAX_DEPTH = 4;

const SENSITIVE_KEY_PATTERN =
  /secret|token|password|authorization|cookie|session|service[_-]?role|merchant[_-]?key|merchant[_-]?salt|paytr[_-]?key|paytr[_-]?salt|upstash|turnstile|hash|signature|payload|raw|email|phone|address|identity|iban|card|cvv|tc|kimlik/i;

const SECRET_VALUE_PATTERN =
  /sb_secret_|service_role|Bearer\s+[A-Za-z0-9._-]+|sk_(live|test)_[A-Za-z0-9]+|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.|AKIA[0-9A-Z]{16}/i;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof Error);
}

function shouldRedactKey(key: string) {
  return SENSITIVE_KEY_PATTERN.test(key);
}

function sanitizeString(value: string) {
  if (SECRET_VALUE_PATTERN.test(value)) return REDACTED;
  if (value.length <= MAX_STRING_LENGTH) return value;
  return `${value.slice(0, MAX_STRING_LENGTH)}...`;
}

export function sanitizeLogValue(value: unknown, key = "", depth = 0): unknown {
  if (key && shouldRedactKey(key)) return REDACTED;
  if (value === null || value === undefined) return value;

  if (typeof value === "string") return sanitizeString(value);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "bigint") return value.toString();

  if (value instanceof Error) {
    return {
      name: value.name,
      message: sanitizeString(value.message)
    };
  }

  if (Array.isArray(value)) {
    if (depth >= MAX_DEPTH) return "[array]";
    return value.slice(0, MAX_ARRAY_ITEMS).map((item) => sanitizeLogValue(item, "", depth + 1));
  }

  if (isPlainObject(value)) {
    if (depth >= MAX_DEPTH) return "[object]";
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => [entryKey, sanitizeLogValue(entryValue, entryKey, depth + 1)])
    );
  }

  return String(value);
}

export function safeLog(level: SafeLogLevel, scope: string, event: string, context?: SafeLogContext) {
  const prefix = `[${scope}]`;
  if (context === undefined) {
    console[level](prefix, event);
    return;
  }

  console[level](prefix, event, sanitizeLogValue(context));
}

export const safeLogger = {
  info(scope: string, event: string, context?: SafeLogContext) {
    safeLog("info", scope, event, context);
  },
  warn(scope: string, event: string, context?: SafeLogContext) {
    safeLog("warn", scope, event, context);
  },
  error(scope: string, event: string, context?: SafeLogContext) {
    safeLog("error", scope, event, context);
  }
};
