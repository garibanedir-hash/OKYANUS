import { ClipboardCheck, FileText, HandCoins, MessageCircleHeart, Scale, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";

const trustItems = [
  { icon: HandCoins, title: "Kayıtlı Bağış", text: "Tutar, bağış türü ve bağışçı bilgisi ayrı tutulur." },
  { icon: ClipboardCheck, title: "Proje Bazlı Takip", text: "Destekler ilgili faaliyet veya proje başlığıyla eşleştirilir." },
  { icon: FileText, title: "Faaliyet Raporları", text: "Tamamlanan çalışmalar raporlanabilir ve paylaşılabilir yapıdadır." },
  { icon: MessageCircleHeart, title: "Düzenli Bilgilendirme", text: "Bağışçı ve gönüllüler süreç hakkında anlaşılır biçimde bilgilendirilir." },
  { icon: ShieldCheck, title: "İnsan Onuru", text: "Yardım dili, görsel yaklaşım ve saha süreçleri mahremiyeti gözetir." },
  { icon: Scale, title: "Hesap Verebilirlik", text: "Emanet bilinci, karar alma ve raporlama süreçlerinin merkezindedir." }
];

const trustMetrics = [
  ["Proje bazlı", "Bağış takibi"],
  ["Düzenli", "Faaliyet raporu"],
  ["Saygın", "Yardım dili"]
];

export function TrustSection() {
  return (
    <section className="bg-white py-20">
      <Container>
        <div className="ocean-card relative overflow-hidden rounded-[2rem] p-6 shadow-card sm:p-8 lg:p-10">
          <div className="wave-lines absolute inset-x-0 bottom-0 h-32 opacity-45" />
          <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <div className="relative">
              <SectionHeading
                eyebrow="Şeffaflık ve Güven"
                title="Emanetin Farkındayız"
                description="Her desteğin bir sorumluluk olduğuna inanıyoruz. Bu yüzden bağış, gönüllülük ve saha süreçlerini kayıt, takip ve bilgilendirme anlayışıyla tasarlıyoruz."
              />
              <div className="mt-7 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {["Kayıt", "Takip", "Raporlama"].map((item) => (
                  <div key={item} className="rounded-2xl bg-white p-4 shadow-sm">
                    <Badge variant="green">{item}</Badge>
                    <p className="mt-3 text-sm leading-6 text-slate-600">Desteklerin görünür ve anlaşılır bir süreç içinde ilerlemesini sağlar.</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative grid gap-4 sm:grid-cols-2">
              {trustItems.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-soft-blue text-deep-blue">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-bold text-dark-navy">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
            </div>
          </div>
          <div className="relative mt-8 grid gap-4 border-t border-border-soft pt-6 sm:grid-cols-3">
            {trustMetrics.map(([label, text]) => (
              <div key={label} className="rounded-2xl bg-white/78 p-5 shadow-sm ring-1 ring-white/70">
                <p className="text-2xl font-extrabold text-deep-blue">{label}</p>
                <p className="mt-1 text-sm font-bold text-ink-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
