import Link from "next/link";
import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { adminHomePath, isAdminDemoMode } from "@/config/admin";
import { isSupabaseConfigured } from "@/lib/auth/adminGuard";
import { signInAdmin } from "@/app/admin/giris/actions";

export const metadata: Metadata = {
  title: "Admin Girişi",
  description: "Okyanus Yönetim Paneli giriş taslağı."
};

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams?: Promise<{ durum?: string; mesaj?: string }>;
}) {
  const configured = isSupabaseConfigured();
  const params = await searchParams;
  const statusMessage =
    params?.durum === "demo"
      ? "Demo mod aktif. Gerçek giriş yapılmaz; /admin route'u önizleme için açıktır."
      : params?.durum === "env-eksik"
        ? "Supabase env değişkenleri eksik. Giriş akışı başlatılamadı."
        : params?.durum === "hata"
          ? "Giriş bilgileri doğrulanamadı."
          : params?.durum === "yetkisiz"
            ? "Bu hesap yönetim paneline erişim yetkisine sahip değil."
          : null;

  return (
    <main className="min-h-screen bg-soft-gray px-5 py-12">
      <div className="mx-auto max-w-md rounded-[1.75rem] border border-border-soft bg-white p-7 shadow-soft">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-soft-blue text-deep-blue">
          <ShieldCheck aria-hidden className="h-7 w-7" />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold text-dark-navy">Okyanus Yönetim Paneli Girişi</h1>
        <p className="mt-3 leading-7 text-ink-muted">
          Bu ekran Supabase Auth entegrasyonuna hazır giriş taslağıdır. Demo modda gerçek oturum açma işlemi yapılmaz.
        </p>

        <div className="mt-6 rounded-2xl bg-soft-blue p-4 text-sm font-semibold leading-6 text-deep-blue">
          {isAdminDemoMode
            ? "Demo mod aktif: /admin route'u önizleme için açıktır."
            : configured
              ? "Auth modu aktif: Supabase signInWithPassword akışı kullanılmaya hazır."
              : "Auth modu açık ancak Supabase env değişkenleri eksik."}
        </div>
        {statusMessage ? (
          <div className="mt-4 rounded-2xl bg-warm-accent/10 p-4 text-sm font-semibold leading-6 text-dark-navy">
            {statusMessage}
          </div>
        ) : null}

        <form action={signInAdmin} className="mt-6 grid gap-4">
          <label className="text-sm font-bold text-dark-navy">
            E-posta
            <input name="email" type="email" required className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" placeholder="admin@okyanus.org" />
          </label>
          <label className="text-sm font-bold text-dark-navy">
            Şifre
            <input name="password" type="password" required className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" placeholder="••••••••" />
          </label>
          <button type="submit" className="focus-ring rounded-full bg-deep-blue px-5 py-3 text-sm font-bold text-white shadow-card">
            Giriş Yap
          </button>
        </form>

        <div className="mt-6 rounded-2xl bg-warm-accent/10 p-4 text-sm font-semibold leading-6 text-dark-navy">
          Güvenlik notu: Gerçek kullanımda admin route&apos;ları oturum, rol, RLS ve audit log kontrolleriyle korunmalıdır.
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="focus-ring rounded-full bg-white px-4 py-2 text-center text-sm font-bold text-deep-blue ring-1 ring-border-soft">
            Siteye Dön
          </Link>
          <Link href={adminHomePath} className="focus-ring rounded-full bg-mint-green px-4 py-2 text-center text-sm font-bold text-ocean-green">
            Demo Paneli Aç
          </Link>
        </div>
      </div>
    </main>
  );
}
