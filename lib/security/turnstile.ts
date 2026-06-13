import "server-only";

export const TURNSTILE_RESPONSE_FIELD = "cf-turnstile-response";
export const TURNSTILE_GENERIC_ERROR = "Güvenlik doğrulaması tamamlanamadı. Lütfen tekrar deneyin.";

type TurnstileVerificationOptions = {
  form: string;
};

type TurnstileSiteVerifyResponse = {
  success?: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
};

export class TurnstileVerificationError extends Error {
  constructor(message = TURNSTILE_GENERIC_ERROR, public code = "turnstile_verification_failed") {
    super(message);
    this.name = "TurnstileVerificationError";
  }
}

export function isTurnstileEnabled() {
  return process.env.TURNSTILE_ENABLED === "true";
}

function getToken(formData: FormData) {
  const value = formData.get(TURNSTILE_RESPONSE_FIELD);
  return typeof value === "string" ? value.trim() : "";
}

export async function verifyTurnstileToken(token: string, options: TurnstileVerificationOptions) {
  if (!isTurnstileEnabled()) {
    return {
      ok: true,
      required: false,
      metadata: {
        turnstile: {
          enabled: false,
          checkedAt: new Date().toISOString()
        }
      }
    };
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  const checkedAt = new Date().toISOString();

  if (!secret) {
    return {
      ok: false,
      required: true,
      metadata: {
        turnstile: {
          enabled: true,
          verified: false,
          reason: "missing_secret",
          form: options.form,
          checkedAt
        }
      }
    };
  }

  if (!token) {
    return {
      ok: false,
      required: true,
      metadata: {
        turnstile: {
          enabled: true,
          verified: false,
          reason: "missing_token",
          form: options.form,
          checkedAt
        }
      }
    };
  }

  try {
    const body = new URLSearchParams();
    body.set("secret", secret);
    body.set("response", token);

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      cache: "no-store"
    });

    if (!response.ok) {
      return {
        ok: false,
        required: true,
        metadata: {
          turnstile: {
            enabled: true,
            verified: false,
            reason: "verification_http_error",
            status: response.status,
            form: options.form,
            checkedAt
          }
        }
      };
    }

    const result = (await response.json()) as TurnstileSiteVerifyResponse;

    return {
      ok: result.success === true,
      required: true,
      metadata: {
        turnstile: {
          enabled: true,
          verified: result.success === true,
          reason: result.success === true ? undefined : "verification_failed",
          form: options.form,
          hostname: result.hostname,
          action: result.action,
          challengeTs: result.challenge_ts,
          errorCodes: result["error-codes"],
          checkedAt
        }
      }
    };
  } catch {
    return {
      ok: false,
      required: true,
      metadata: {
        turnstile: {
          enabled: true,
          verified: false,
          reason: "verification_network_error",
          form: options.form,
          checkedAt
        }
      }
    };
  }
}

export async function validateTurnstileFromFormData(formData: FormData, options: TurnstileVerificationOptions) {
  const verification = await verifyTurnstileToken(getToken(formData), options);

  if (verification.required && !verification.ok) {
    throw new TurnstileVerificationError();
  }

  return verification;
}
