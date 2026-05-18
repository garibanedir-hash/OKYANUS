import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { registerPublicAccount } from "@/app/kayit/actions";

export const metadata: Metadata = {
  title: "Kayıt Ol | Okyanus",
  description: "Okyanus bağışçı ve gönüllü hesap kayıt demo sayfası."
};

export default async function RegisterPage({
  searchParams
}: {
  searchParams?: Promise<{ durum?: string }>;
}) {
  const params = await searchParams;
  const statusMessage =
    params?.durum === "demo"
      ? "Demo mod aktif. Gerçek üyelik oluşturulmaz; kişisel veri kaydedilmez."
      : params?.durum === "env-eksik"
        ? "Supabase env değişkenleri eksik. Kayıt akışı başlatılamadı."
        : params?.durum === "kvkk"
          ? "Hesap oluşturmak için KVKK onayını işaretlemelisiniz."
          : params?.durum === "eksik"
            ? "Lütfen zorunlu alanları doldurun ve şifreleri aynı girin."
            : params?.durum === "hata"
              ? "Kayıt işlemi tamamlanamadı. Lütfen bilgileri kontrol edin."
              : null;

  return (
    <AuthShell title="Okyanus’a Katıl" description="Bağışçı veya gönüllü hesabınızı oluşturun.">
        <form action={registerPublicAccount} className="mt-8 grid gap-4 md:grid-cols-2">
          {statusMessage ? (
            <div className="rounded-2xl bg-soft-blue p-4 text-sm font-bold leading-6 text-deep-blue md:col-span-2">
              {statusMessage}
            </div>
          ) : null}
          <label className="text-sm font-bold text-dark-navy">Hesap türü<select name="accountType" className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3"><option>Bağışçı</option><option>Gönüllü</option><option>Bağışçı + Gönüllü</option></select></label>
          <label className="text-sm font-bold text-dark-navy">Ad soyad<input name="fullName" className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" required /></label>
          <label className="text-sm font-bold text-dark-navy">E-posta<input name="email" className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" type="email" required /></label>
          <label className="text-sm font-bold text-dark-navy">Telefon<input name="phone" className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" /></label>
          <label className="text-sm font-bold text-dark-navy">Şehir<input name="city" className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" /></label>
          <label className="text-sm font-bold text-dark-navy">Şifre<input name="password" className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" type="password" required /></label>
          <label className="text-sm font-bold text-dark-navy">Şifre tekrar<input name="passwordConfirm" className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" type="password" required /></label>
          <div className="grid gap-3 md:col-span-2">
            <label className="flex gap-3 text-sm font-semibold leading-6 text-ink-muted"><input name="kvkkAccepted" className="mt-1 h-4 w-4" type="checkbox" required />KVKK aydınlatma metnini okudum ve demo kayıt akışını anladım.</label>
            <label className="flex gap-3 text-sm font-semibold leading-6 text-ink-muted"><input name="communicationPermission" className="mt-1 h-4 w-4" type="checkbox" />İletişim izni vermek istiyorum.</label>
          </div>
          <AuthSubmitButton idleLabel="Hesap Oluştur" pendingLabel="Kayıt oluşturuluyor..." className="md:col-span-2" />
          <p className="text-sm text-ink-muted md:col-span-2">Zaten hesabın var mı? <Link className="font-bold text-deep-blue" href="/giris">Giriş yap</Link></p>
        </form>
    </AuthShell>
  );
}
