import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { signInAdmin } from "@/app/admin/giris/actions";

export const metadata: Metadata = {
  title: "Yönetim Paneli Girişi",
  description: "Okyanus Yönetim Paneli yetkili kullanıcı girişi."
};

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams?: Promise<{ durum?: string; mesaj?: string }>;
}) {
  const params = await searchParams;
  const statusMessages: Record<string, string> = {
    "env-eksik": "Giriş işlemi şu anda tamamlanamıyor. Lütfen daha sonra tekrar deneyin.",
    hata: "Giriş bilgileri doğrulanamadı. Lütfen bilgilerinizi kontrol ederek tekrar deneyin.",
    yetkisiz: "Bu alana erişmek için yetkili hesabınızla giriş yapmanız gerekiyor.",
    "rol-dogrulanamadi": "Bu alana erişmek için yetkili hesabınızla giriş yapmanız gerekiyor."
  };
  const statusMessage = params?.durum ? statusMessages[params.durum] : null;

  return (
    <AuthShell
      mode="admin"
      title="Yönetim Paneli Girişi"
      description="Yetkili kullanıcılar, kendilerine tanımlanan bilgilerle sisteme giriş yapabilir."
    >
        {statusMessage ? (
          <div className="rounded-2xl bg-warm-accent/10 p-4 text-sm font-semibold leading-6 text-dark-navy">
            {statusMessage}
          </div>
        ) : null}

        <form action={signInAdmin} className="mt-6 grid gap-4">
          <label className="text-sm font-bold text-dark-navy">
            E-posta
            <input name="email" type="email" required className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" placeholder="E-posta adresiniz" />
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
        </div>
    </AuthShell>
  );
}
