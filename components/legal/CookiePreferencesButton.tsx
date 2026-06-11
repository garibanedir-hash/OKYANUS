"use client";

import { SlidersHorizontal } from "lucide-react";
import { openCookiePreferences } from "@/lib/legal/cookieConsent";

export function CookiePreferencesButton() {
  return (
    <button
      type="button"
      onClick={openCookiePreferences}
      className="focus-ring inline-flex items-center gap-2 rounded-full text-left transition hover:text-white"
    >
      <SlidersHorizontal aria-hidden className="h-4 w-4" />
      <span>Çerez Tercihlerimi Yönet</span>
    </button>
  );
}
