import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
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
    <Container className="py-16">
      <div className="mx-auto grid max-w-5xl gap-8 rounded-brand border border-border-soft bg-white p-6 shadow-card lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
        <aside className="rounded-brand bg-soft-blue p-6">
          <ShieldCheck className="h-10 w-10 text-deep-blue" aria-hidden />
          <h1 className="mt-5 text-3xl font-extrabold text-dark-navy">Okyanus Hesabına Giriş Yap</h1>
          <p className="mt-4 leading-7 text-ink-muted">Gönüllüysen veya bağışçıysan hesabına buradan ulaşabilirsin. Bu demo ekran ileride Supabase Auth ile oturum açma akışına bağlanacaktır.</p>
          <p className="mt-5 rounded-2xl bg-white p-4 text-sm font-bold leading-6 text-deep-blue">Demo mod: Gerçek giriş yapılmaz, kişisel veri kaydedilmez.</p>
        </aside>
        <form action={signInPublic} className="grid gap-4">
          {statusMessage ? (
            <div className="rounded-2xl bg-soft-blue p-4 text-sm font-bold leading-6 text-deep-blue">
              {statusMessage}
            </div>
          ) : null}
          <label className="text-sm font-bold text-dark-navy">E-posta<input name="email" className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" type="email" placeholder="ornek@example.com" required /></label>
          <label className="text-sm font-bold text-dark-navy">Şifre<input name="password" className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" type="password" placeholder="••••••••" required /></label>
          <Button type="submit" className="w-full">Giriş Yap</Button>
          <p className="text-center text-sm text-ink-muted">Hesabın yok mu? <Link className="font-bold text-deep-blue" href="/kayit">Hesap oluştur</Link></p>
        </form>
      </div>
    </Container>
  );
}
