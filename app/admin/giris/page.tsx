import Link from "next/link";
import type { Metadata } from "next";
import { adminHomePath, isAdminDemoMode } from "@/config/admin";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
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
  const statusMessages: Record<string, string> = {
    demo: "Demo mod aktif. Gerçek giriş yapılmaz; /admin route'u önizleme için açıktır.",
    "env-eksik": "Supabase env değişkenleri eksik. Giriş akışı başlatılamadı.",
    hata: "Giriş bilgileri doğrulanamadı.",
    yetkisiz: "Bu hesap yönetim paneline erişim yetkisine sahip değil.",
    "rol-dogrulanamadi": "Rol bilgisi doğrulanamadı. Lütfen yöneticiyle iletişime geçin."
  };
  const statusMessage = params?.durum ? statusMessages[params.durum] : null;

  return (
    <AuthShell
      mode="admin"
      title="Okyanus Yönetim Paneli"
      description="Yetkili kullanıcılar için güvenli yönetim erişimi."
    >
        <div className="rounded-2xl bg-soft-blue p-4 text-sm font-semibold leading-6 text-deep-blue">
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
          <AuthSubmitButton idleLabel="Yönetim Paneline Giriş Yap" pendingLabel="Giriş kontrol ediliyor..." />
        </form>

        <div className="mt-6 rounded-2xl bg-warm-accent/10 p-4 text-sm font-semibold leading-6 text-dark-navy">
          Bu alan yalnızca yetkili personel ve yöneticiler içindir.
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="focus-ring rounded-full bg-white px-4 py-2 text-center text-sm font-bold text-deep-blue ring-1 ring-border-soft">
            Siteye Dön
          </Link>
          {isAdminDemoMode ? <Link href={adminHomePath} className="focus-ring rounded-full bg-mint-green px-4 py-2 text-center text-sm font-bold text-ocean-green">
            Demo Paneli Aç
          </Link> : null}
        </div>
    </AuthShell>
  );
}
