import type { Metadata } from "next";
import "./globals.css";
import { SiteChrome } from "@/components/SiteChrome";

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
    type: "website"
  }
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
