import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Kayıt Ol | Okyanus",
  description: "Okyanus bağışçı ve gönüllü hesap kayıt demo sayfası."
};

export default function RegisterPage() {
  return (
    <Container className="py-16">
      <div className="mx-auto max-w-4xl rounded-brand border border-border-soft bg-white p-6 shadow-card lg:p-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ocean-green">Demo kayıt akışı</p>
        <h1 className="mt-2 text-3xl font-extrabold text-dark-navy">Okyanus’a Katıl</h1>
        <p className="mt-3 leading-7 text-ink-muted">Bu ekran demo modda çalışmaktadır. Gerçek üyelik Supabase Auth entegrasyonundan sonra aktif olacaktır.</p>
        <form className="mt-8 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-bold text-dark-navy">Hesap türü<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3"><option>Bağışçı</option><option>Gönüllü</option><option>Hem bağışçı hem gönüllü</option></select></label>
          <label className="text-sm font-bold text-dark-navy">Ad soyad<input className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" /></label>
          <label className="text-sm font-bold text-dark-navy">E-posta<input className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" type="email" /></label>
          <label className="text-sm font-bold text-dark-navy">Telefon<input className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" /></label>
          <label className="text-sm font-bold text-dark-navy">Şehir<input className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" /></label>
          <label className="text-sm font-bold text-dark-navy">Şifre<input className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" type="password" /></label>
          <label className="text-sm font-bold text-dark-navy">Şifre tekrar<input className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" type="password" /></label>
          <div className="grid gap-3 md:col-span-2">
            <label className="flex gap-3 text-sm font-semibold leading-6 text-ink-muted"><input className="mt-1 h-4 w-4" type="checkbox" />KVKK aydınlatma metnini okudum ve demo kayıt akışını anladım.</label>
            <label className="flex gap-3 text-sm font-semibold leading-6 text-ink-muted"><input className="mt-1 h-4 w-4" type="checkbox" />İletişim izni vermek istiyorum.</label>
          </div>
          <Button type="button" className="md:col-span-2">Hesap Oluştur</Button>
          <p className="text-sm text-ink-muted md:col-span-2">Zaten hesabın var mı? <Link className="font-bold text-deep-blue" href="/giris">Giriş yap</Link></p>
        </form>
      </div>
    </Container>
  );
}
