"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import type { TurnstilePublicConfig } from "@/lib/security/turnstilePublic";

const TURNSTILE_RESPONSE_FIELD = "cf-turnstile-response";

type TurnstileRenderOptions = {
  sitekey: string;
  action?: string;
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
};

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: TurnstileRenderOptions) => string;
      remove?: (widgetId: string) => void;
    };
  }
}

type TurnstileFieldProps = {
  config?: TurnstilePublicConfig;
};

export function TurnstileField({ config }: TurnstileFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (!config?.enabled || !config.siteKey || !scriptReady || !containerRef.current || !window.turnstile) return;
    if (widgetIdRef.current) return;

    const hiddenInput = hiddenInputRef.current;
    const widgetId = window.turnstile.render(containerRef.current, {
      sitekey: config.siteKey,
      action: config.action,
      callback: (token) => {
        if (hiddenInput) hiddenInput.value = token;
      },
      "expired-callback": () => {
        if (hiddenInput) hiddenInput.value = "";
      },
      "error-callback": () => {
        if (hiddenInput) hiddenInput.value = "";
      }
    });
    widgetIdRef.current = widgetId;

    return () => {
      if (widgetId && window.turnstile?.remove) {
        window.turnstile.remove(widgetId);
      }
      widgetIdRef.current = null;
      if (hiddenInput) hiddenInput.value = "";
    };
  }, [config?.action, config?.enabled, config?.siteKey, scriptReady]);

  if (!config?.enabled || !config.siteKey) return null;

  return (
    <div className="mt-5">
      <Script
        id="cloudflare-turnstile"
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <input ref={hiddenInputRef} type="hidden" name={TURNSTILE_RESPONSE_FIELD} />
      <div ref={containerRef} />
    </div>
  );
}
