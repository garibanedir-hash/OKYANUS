"use client";

import { useEffect, useRef } from "react";
import { TurnstileField } from "@/components/forms/TurnstileField";
import type { TurnstilePublicConfig } from "@/lib/security/turnstilePublic";

type FormProtectionFieldsProps = {
  turnstile?: TurnstilePublicConfig;
};

export function FormProtectionFields({ turnstile }: FormProtectionFieldsProps) {
  const formStartedAtRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (formStartedAtRef.current) {
      formStartedAtRef.current.value = String(Date.now());
    }
  }, []);

  return (
    <>
      <input ref={formStartedAtRef} type="hidden" name="formStartedAt" />
      <TurnstileField config={turnstile} />
      <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
        <label>
          Company website
          <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
    </>
  );
}
