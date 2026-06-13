"use client";

import { useEffect, useRef } from "react";

export function FormProtectionFields() {
  const formStartedAtRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (formStartedAtRef.current) {
      formStartedAtRef.current.value = String(Date.now());
    }
  }, []);

  return (
    <>
      <input ref={formStartedAtRef} type="hidden" name="formStartedAt" />
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
