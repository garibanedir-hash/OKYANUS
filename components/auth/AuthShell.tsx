import Link from "next/link";
import { OfficialLogo } from "@/components/brand/OfficialLogo";
import { cn } from "@/lib/utils";

export function AuthShell({
  title,
  description,
  children,
  mode = "public"
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  mode?: "public" | "admin";
}) {
  const adminMode = mode === "admin";

  return (
    <main className={cn("min-h-screen px-5 py-8", adminMode ? "bg-deep-blue" : "bg-warm-white")}>
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1fr]">
        <aside className={cn("rounded-[1.5rem] border p-7 sm:p-9", adminMode ? "border-white/10 bg-white/8 text-white" : "border-border-soft bg-white text-dark-navy")}>
          <div className="flex justify-center lg:justify-start">
            <OfficialLogo variant={adminMode ? "white" : "color"} context="auth" className="-ml-3 max-w-[280px] sm:max-w-[320px]" />
          </div>
          <p className={cn("mt-8 max-w-sm text-lg font-bold leading-8", adminMode ? "text-white" : "text-deep-blue")}>
            İyilik Paylaştıkça Okyanusa Dönüşür.
          </p>
          <div className={cn("mt-8 grid max-w-sm gap-3 text-sm font-semibold leading-6", adminMode ? "text-white/78" : "text-ink-muted")}>
            <p>Güvenli erişim</p>
            <p>{adminMode ? "Yetkili yönetim paneli" : "Bağışçı ve gönüllü hesap yönetimi"}</p>
          </div>
          <Link className={cn("focus-ring mt-10 inline-flex rounded-full px-4 py-2 text-sm font-bold", adminMode ? "bg-white text-deep-blue" : "bg-soft-blue text-deep-blue")} href="/">
            Siteye Dön
          </Link>
        </aside>

        <section className="mx-auto w-full max-w-xl rounded-[1.5rem] border border-border-soft bg-white p-6 shadow-[0_18px_50px_rgba(15,37,71,0.08)] sm:p-8">
          <div className="mb-7">
            <h1 className="text-3xl font-extrabold text-dark-navy">{title}</h1>
            <p className="mt-2 leading-7 text-ink-muted">{description}</p>
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
