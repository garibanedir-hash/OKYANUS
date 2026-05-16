import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AuthShell } from "@/components/auth/AuthShell";
import { signInPublic } from "@/app/giris/actions";

export const metadata: Metadata = {
  title: "Giriş Yap | Okyanus",
  description: "Okyanus bağışçı ve gönüllü hesap girişi demo sayfası."
};

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Promise<{ durum?: string }>;
}) {
  const params = await searchParams;
  const statusMessage =
    params?.durum === "demo"
      ? "Demo mod aktif. Gerçek giriş yapılmaz; paneller önizleme için açıktır."
      : params?.durum === "env-eksik"
        ? "Supabase env değişkenleri eksik. Giriş akışı başlatılamadı."
        : params?.durum === "eksik"
          ? "Lütfen e-posta ve şifre alanlarını doldurun."
          : params?.durum === "hata"
            ? "Giriş bilgileri doğrulanamadı."
            : params?.durum === "yetkisiz"
              ? "Bu panele erişim için gerekli rol bulunamadı."
              : params?.durum === "kayit-basarili"
                ? "Kayıt başvurunuz alındı. E-posta doğrulaması sonrası giriş yapabilirsiniz."
                : null;

  return (
    <AuthShell title="Okyanus Portalı" description="Bağışçı ve gönüllü hesaplarınıza güvenli şekilde erişin.">
        <form action={signInPublic} className="grid gap-4">
          {statusMessage ? (
            <div className="rounded-2xl bg-soft-blue p-4 text-sm font-bold leading-6 text-deep-blue">
              {statusMessage}
            </div>
          ) : null}
          <label className="text-sm font-bold text-dark-navy">E-posta<input name="email" className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" type="email" placeholder="ornek@example.com" required /></label>
          <label className="text-sm font-bold text-dark-navy">Şifre<input name="password" className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" type="password" placeholder="••••••••" required /></label>
          <Button type="submit" className="w-full">Giriş Yap</Button>
          <div className="grid gap-2 text-center text-sm text-ink-muted">
            <p>Hesabınız yok mu? <Link className="font-bold text-deep-blue" href="/kayit">Kayıt olun</Link></p>
            <p><span className="font-semibold">Şifremi unuttum</span> <span className="text-xs">(demo)</span></p>
            <p className="pt-2 text-xs">Yönetim paneli girişi için <Link className="font-bold text-deep-blue" href="/admin/giris">buraya tıklayın</Link>.</p>
          </div>
        </form>
    </AuthShell>
  );
}
