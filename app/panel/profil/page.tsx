import { getCurrentPortalUser } from "@/lib/data/portalRepository";
import { Button } from "@/components/ui/Button";

function Field({ label, value }: { label: string; value: string }) {
  return <label className="text-sm font-bold text-dark-navy">{label}<input className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-3" defaultValue={value} /></label>;
}

export default function PortalProfilePage() {
  const user = getCurrentPortalUser();
  return (
    <div className="grid gap-6">
      <section className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ocean-green">Profil ve KVKK</p>
        <h1 className="mt-2 text-3xl font-extrabold text-dark-navy">Profilim</h1>
        <p className="mt-2 leading-7 text-ink-muted">Profil bilgileri resmi sistemde KVKK kapsamında işlenir. Veri silme, düzeltme ve erişim talepleri için iletişim kanalı kullanılmalıdır.</p>
      </section>
      <form className="grid gap-4 rounded-brand border border-border-soft bg-white p-6 shadow-card md:grid-cols-2">
        <Field label="Ad soyad" value={user.fullName} />
        <Field label="E-posta" value={user.email} />
        <Field label="Telefon" value={user.phone} />
        <Field label="Şehir" value={user.city} />
        <Field label="Hesap türü" value={user.accountType} />
        <Field label="Gönüllülük ilgi alanları" value="Saha, eğitim, lojistik" />
        <Field label="Bağış tercihleri" value="Gıda, eğitim, sponsorluk" />
        <Field label="İletişim izinleri" value="E-posta açık, SMS kapalı" />
        <Field label="Şifre değiştirme" value="Demo alan" />
        <Field label="Hesabı silme / veri talebi" value="Demo talep akışı" />
        <div className="md:col-span-2"><Button type="button">Demo Kaydet</Button></div>
      </form>
    </div>
  );
}
