import type { Metadata } from "next";
import { existsSync } from "node:fs";
import path from "node:path";
import "./globals.css";
import { SiteChrome } from "@/components/SiteChrome";

const faviconPngExists = existsSync(path.join(process.cwd(), "public", "brand", "favicon.png"));
const markPngExists = existsSync(path.join(process.cwd(), "public", "brand", "mark.png"));
const faviconSvgExists = existsSync(path.join(process.cwd(), "public", "brand", "favicon.svg"));
const socialPreviewExists = existsSync(path.join(process.cwd(), "public", "brand", "social-preview.png"));
const faviconPath = faviconPngExists
  ? "/brand/favicon.png"
  : markPngExists
    ? "/brand/mark.png"
    : faviconSvgExists
      ? "/brand/favicon.svg"
      : undefined;

export const metadata: Metadata = {
  metadataBase: new URL("https://okyanusyardim.org"),
  title: {
    default: "Okyanus İnsani Yardım Derneği | İyilik Bir Damlayla Başlar",
    template: "%s | Okyanus İnsani Yardım Derneği"
  },
  description:
    "Okyanus İnsani Yardım Derneği; gıda, eğitim, sağlık, yetim ve acil yardım alanlarında ihtiyaç sahiplerine destek ulaştıran insani yardım kuruluşudur.",
  openGraph: {
    title: "Okyanus İnsani Yardım Derneği",
    description: "İyilik, bir damlayla başlar; okyanusa dönüşür.",
    locale: "tr_TR",
    type: "website",
    ...(socialPreviewExists ? { images: ["/brand/social-preview.png"] } : {})
  },
  ...(faviconPath ? { icons: { icon: faviconPath, shortcut: faviconPath, apple: faviconPath } } : {})
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="font-sans antialiased">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
