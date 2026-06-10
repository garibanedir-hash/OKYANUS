import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { signInPublic } from "@/app/giris/actions";

export const metadata: Metadata = {
  title: "Giriş Yap | Okyanus",
  description: "Okyanus bağışçı ve gönüllü hesap giriş sayfası."
};

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Promise<{ durum?: string }>;
}) {
  const params = await searchParams;
  const statusMessages: Record<string, string> = {
    demo: "Tanıtım döneminde hesap girişi sınırlıdır. Bilgi almak için iletişim kanallarımızı kullanabilirsiniz.",
    "env-eksik": "Supabase env değişkenleri eksik. Giriş akışı başlatılamadı.",
    eksik: "Lütfen e-posta ve şifre alanlarını doldurun.",
    hata: "Giriş bilgileri doğrulanamadı.",
    yetkisiz: "Bu alana erişmek için yetkili hesabınızla giriş yapmanız gerekiyor.",
    "kayit-basarili": "Kayıt başvurunuz alındı. E-posta doğrulaması sonrası giriş yapabilirsiniz."
  };
  const statusMessage = params?.durum ? statusMessages[params.durum] : null;

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
        <AuthSubmitButton idleLabel="Giriş Yap" pendingLabel="Giriş yapılıyor..." />
        <div className="grid gap-2 text-center text-sm text-ink-muted">
          <p>Hesabınız yok mu? <Link className="font-bold text-deep-blue" href="/kayit">Kayıt olun</Link></p>
          <p><span className="font-semibold">Şifremi unuttum</span> <span className="text-xs">bağlantısı yakında aktif olacaktır.</span></p>
          <p className="pt-2 text-xs">Yönetim paneli girişi için <Link className="font-bold text-deep-blue" href="/admin/giris">buraya tıklayın</Link>.</p>
        </div>
      </form>
    </AuthShell>
  );
}
