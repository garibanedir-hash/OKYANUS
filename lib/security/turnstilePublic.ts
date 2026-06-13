export type TurnstilePublicConfig = {
  enabled: boolean;
  siteKey: string;
  action: string;
};

export function getTurnstilePublicConfig(action: string): TurnstilePublicConfig {
  const enabled = process.env.TURNSTILE_ENABLED === "true";
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  return {
    enabled: enabled && Boolean(siteKey),
    siteKey: enabled ? siteKey : "",
    action
  };
}
