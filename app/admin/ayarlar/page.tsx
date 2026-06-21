import { legalPages } from "@/data/legalPages";
import { projects } from "@/data/projects";
import { news } from "@/data/news";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block text-sm font-bold text-dark-navy">
      {label}
      <input defaultValue={value} className="focus-ring mt-2 w-full rounded-2xl border border-border-soft bg-white px-4 py-3 text-ink-muted" />
    </label>
  );
}

function SettingsPanel({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-dark-navy">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-ink-muted">{description}</p>
        </div>
        <AdminStatusBadge status="Demo" />
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

const tabs = [
  "Genel Ayarlar",
  "Kurumsal Bilgiler",
  "İletişim Bilgileri",
  "Bağış Ayarları",
  "Gönüllülük Ayarları",
  "Kullanıcı Ayarları",
  "Panel Ayarları",
  "Yetki ve Roller",
  "Bildirim Ayarları",
  "Yasal Sayfalar",
  "Güvenlik",
  "Sistem"
];

export default function AdminSettingsPage() {
  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Sistem Ayarları"
        title="Ayarlar"
        description="Sekmeli yapı gerçek kayıt yapmaz; ileride site_settings, legal_pages ve CMS ayarlarına bağlanacak frontend önizlemesidir."
      />

      <div className="flex gap-2 overflow-x-auto rounded-brand border border-border-soft bg-white p-3 shadow-card">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            type="button"
            className={`focus-ring shrink-0 rounded-full px-4 py-2 text-sm font-bold ${index === 0 ? "bg-deep-blue text-white" : "bg-soft-gray text-ink-muted"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <SettingsPanel title="Genel Ayarlar" description="Platformun demo/public/auth davranışını yöneten ana ayarlar.">
        <Field label="Public kayıt" value="Açık / demo" />
        <Field label="Yeni kullanıcı admin onayı" value="Gerekli" />
        <Field label="Demo mode uyarıları" value="Göster" />
        <Field label="Profil tamamlama zorunluluğu" value="Önerilir / demo" />
      </SettingsPanel>

      <SettingsPanel title="Kurumsal Bilgiler" description="Marka adı, kısa açıklama ve kurumsal özet alanları.">
        <Field label="Dernek adı" value="Okyanus İnsani Yardım Derneği" />
        <Field label="Kısa açıklama" value="Emanet bilinciyle izlenebilir iyilik." />
      </SettingsPanel>

      <SettingsPanel title="İletişim Bilgileri" description="Public sitede görünecek iletişim ve sosyal medya alanları.">
        <Field label="Telefon" value="0530 069 89 76" />
        <Field label="E-posta" value="info@okyanus.org.tr" />
        <Field label="Adres" value="İstanbul, Türkiye" />
        <Field label="Sosyal medya bağlantıları" value="Bağlantılar netleştikçe merkezi sosyal link datasına eklenecek" />
      </SettingsPanel>

      <SettingsPanel title="Bağış Ayarları" description="Bağış formu ve ödeme entegrasyonu öncesi demo yapılandırma.">
        <Field label="Varsayılan bağış tutarları" value="100, 250, 500, 1000" />
        <Field label="Bağış türleri" value="Genel, Gıda, Eğitim, Yetim ve Aile, Acil Yardım, Kış" />
        <Field label="Demo ödeme sağlayıcı alanı" value="Ödeme sağlayıcı seçimi ileride eklenecek" />
        <Field label="Makbuz modu" value="Demo / manuel kontrol" />
        <Field label="Bağışçı paneli aktif/pasif" value="Aktif / demo" />
        <Field label="Bağış makbuzu gösterimi" value="Aktif / demo" />
      </SettingsPanel>

      <SettingsPanel title="Gönüllülük Ayarları" description="Gönüllü paneli, etkinlik başvuruları ve saha koordinasyonu.">
        <Field label="Gönüllü paneli aktif/pasif" value="Aktif / demo" />
        <Field label="Gönüllü etkinlik başvuruları" value="Aktif / demo" />
        <Field label="Etkinlik kontenjan uyarıları" value="Göster" />
        <Field label="Koordinatör onayı" value="Gerekli" />
      </SettingsPanel>

      <SettingsPanel title="Kullanıcı Ayarları" description="Bağışçı, gönüllü, koordinatör ve personel hesap davranışları.">
        <Field label="Public kayıt açık/kapalı" value="Açık / admin onayı gerekli" />
        <Field label="Hesap türleri" value="Bağışçı, Gönüllü, Bağışçı + Gönüllü" />
        <Field label="Şifre sıfırlama" value="Supabase Auth sonrası aktif" />
        <Field label="KVKK veri talebi" value="Demo talep akışı" />
      </SettingsPanel>

      <SettingsPanel title="Panel Ayarları" description="Kullanıcı, gönüllü ve sponsorluk panellerinin görünürlük ayarları.">
        <Field label="Bağışçı paneli" value="Aktif" />
        <Field label="Gönüllü paneli" value="Aktif" />
        <Field label="Yetim sponsorluk modülü" value="Aktif / mahremiyet modu" />
        <Field label="Bildirimler" value="Aktif / demo" />
        <Field label="Profil tamamlama zorunluluğu" value="Yüzde 80 önerilir" />
        <Field label="Demo mode uyarıları" value="Göster" />
      </SettingsPanel>

      <SettingsPanel title="İçerik Ayarları" description="Ana sayfa öne çıkan içerik seçimleri.">
        <Field label="Ana sayfa öne çıkan projeler" value={projects.slice(0, 3).map((project) => project.title).join(", ")} />
        <Field label="Ana sayfa öne çıkan haberler" value={news.slice(0, 3).map((item) => item.title).join(", ")} />
        <Field label="Footer açıklama metni" value="İhtiyaç sahiplerine umut, güven ve destek ulaştırmak için çalışıyoruz." />
      </SettingsPanel>

      <SettingsPanel title="Yasal Sayfalar" description="Yasal metinler taslak durumdadır ve resmi kullanım öncesi kontrol edilmelidir.">
        {legalPages.map((page) => (
          <Field key={page.slug} label={page.title} value={`/${page.slug}`} />
        ))}
      </SettingsPanel>

      <SettingsPanel title="Yetki ve Roller" description="Rol bazlı erişim, panel yönlendirme ve işlem yetkileri demo ayarları.">
        <Field label="Super Admin" value="Tüm modüller" />
        <Field label="Koordinatör" value="Kendi ekip/faaliyet alanı" />
        <Field label="Personel" value="Kendi görev ve mesajları" />
        <Field label="Bağışçı / Gönüllü" value="Kendi kayıtları" />
      </SettingsPanel>

      <SettingsPanel title="Bildirim Ayarları" description="Panel, e-posta ve sistem bildirimlerinin gelecekteki yönetim alanı.">
        <Field label="Bağış makbuzu bildirimi" value="Aktif / demo" />
        <Field label="Proje güncellemesi" value="Aktif / demo" />
        <Field label="Gönüllü etkinliği" value="Aktif / demo" />
        <Field label="Görev atama bildirimi" value="Aktif / demo" />
      </SettingsPanel>

      <SettingsPanel title="Güvenlik" description="Auth, RBAC, RLS ve audit log için production öncesi kontrol alanları.">
        <Field label="Panel erişimleri" value="Server-side doğrulanacak" />
        <Field label="Yetki değişiklikleri" value="Audit log zorunlu" />
        <Field label="Çocuk/sponsorluk verisi" value="Katı erişim ve maskeleme" />
        <Field label="Rate limit" value="Login/kayıt formları için planlandı" />
      </SettingsPanel>

      <SettingsPanel title="Sistem Ayarları" description="Backend, auth ve audit log entegrasyonu sonrası aktif olacak alanlar.">
        <Field label="Auth modu" value="Demo / Supabase Auth planlandı" />
        <Field label="Audit log" value="Dokümante / entegrasyon bekliyor" />
        <Field label="RLS politikası" value="Taslak SQL hazır" />
        <Field label="Son güncelleme" value="Demo veri" />
      </SettingsPanel>

      <div>
        <AdminActionButton variant="primary">Ayarları Kaydet</AdminActionButton>
      </div>
    </div>
  );
}
