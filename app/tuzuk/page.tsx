import type { Metadata } from "next";
import { ChevronDown, FileText } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/sections/PageHero";

export const metadata: Metadata = {
  title: "Dernek Tüzüğü",
  description:
    "Okyanus İnsani Yardım Derneği'nin kuruluş amacı, organları, üyelik esasları, gelir kaynakları ve işleyişine ilişkin tüzük özeti.",
  alternates: {
    canonical: "/tuzuk"
  }
};

const bylawSections = [
  {
    title: "Derneğin Adı ve Merkezi",
    paragraphs: [
      "Derneğin adı Okyanus İnsani Yardım Derneği'dir. Derneğin merkezi İstanbul'dadır.",
      "Dernek, mevzuatın öngördüğü usul ve izinler çerçevesinde şube veya temsilcilik açabilir."
    ]
  },
  {
    title: "Derneğin Amacı",
    paragraphs: [
      "Dernek; doğal afet, savaş, kriz, yoksulluk, göç ve benzeri sebeplerle mağduriyet yaşayan kişilere ayrım gözetmeden insani yardım ulaştırmayı amaçlar.",
      "İnsan onurunu, temel hakları, mağduriyetlerin giderilmesini ve sosyal dayanışmayı merkeze alan çalışmalar yürütür."
    ]
  },
  {
    title: "Çalışma Konuları ve Faaliyet Alanı",
    items: [
      "Gıda, giyim, sağlık, eğitim, barınma, yakacak, kira ve temel ihtiyaç alanlarında ayni veya nakdi destekler sağlamak.",
      "Afet, savaş, göç ve kriz durumlarında ihtiyaç sahiplerine sosyal yardım ve insani destek ulaştırmak.",
      "Sağlık hizmetlerine erişim, tedavi, ilaç, medikal malzeme ve sağlık bilinci alanlarında çalışmalar yapmak.",
      "Eğitim desteği, burs, kırtasiye, kurs, kütüphane ve mesleki gelişim alanlarında destekleyici faaliyetler yürütmek.",
      "Kültürel miras, doğal çevre, ekolojik denge, hak temelli farkındalık ve sosyal uyum alanlarında mevzuata uygun çalışmalar yapmak.",
      "Mülteci, göçmen, yerinden edilmiş kişi ve mağdur toplulukların sosyal, ekonomik, kültürel, eğitim ve sağlık ihtiyaçlarına yönelik projeler geliştirmek."
    ]
  },
  {
    title: "Üyelik İşlemleri",
    paragraphs: [
      "Derneğin amaç ve ilkelerini benimseyen, mevzuatın aradığı şartları taşıyan gerçek ve tüzel kişiler derneğe üyelik başvurusunda bulunabilir.",
      "Üyelik başvurusu yönetim kurulunca değerlendirilir ve sonuç başvuru sahibine bildirilir. Üyelikten ayrılma yazılı bildirimle mümkündür.",
      "Tüzüğe aykırı davranış, verilen görevlerden sürekli kaçınma, aidat yükümlülüğünü yerine getirmeme, dernek organ kararlarına uymama veya üyelik şartlarını kaybetme gibi hallerde üyelik yönetim kurulu kararıyla sona erdirilebilir."
    ]
  },
  {
    title: "Dernek Organları",
    paragraphs: [
      "Derneğin organları Genel Kurul, Yönetim Kurulu ve Denetim Kurulu'dur.",
      "Bu organlar dernek tüzüğü, Dernekler Kanunu, Türk Medeni Kanunu ve ilgili mevzuat çerçevesinde görev yapar."
    ]
  },
  {
    title: "Genel Kurul",
    paragraphs: [
      "Genel Kurul, derneğin en yetkili karar organıdır ve derneğe kayıtlı üyelerden oluşur.",
      "Olağan genel kurul toplantısı tüzükte belirtilen dönemlerde yapılır; gerekli hallerde yönetim kurulu, denetim kurulu veya üyelerin mevzuata uygun başvurusu üzerine olağanüstü toplantı yapılabilir."
    ],
    items: [
      "Dernek organlarının seçilmesi.",
      "Tüzük değişikliği ve fesih kararlarının görüşülmesi.",
      "Yönetim ve denetim kurulu raporlarının değerlendirilmesi.",
      "Bütçe, taşınmaz işlemleri, federasyon veya uluslararası faaliyet kararlarının ele alınması.",
      "Mevzuatın Genel Kurula verdiği diğer görevlerin yerine getirilmesi."
    ]
  },
  {
    title: "Yönetim Kurulu",
    paragraphs: [
      "Yönetim Kurulu, Genel Kurul tarafından seçilir ve seçimden sonraki ilk toplantısında görev bölüşümü yapar.",
      "Derneği temsil etmek, gelir ve gider işlemlerini yürütmek, bütçeyi hazırlamak, genel kurul kararlarını uygulamak ve derneğin amaçlarını gerçekleştirmek için gerekli kararları almak Yönetim Kurulunun temel görevleri arasındadır."
    ]
  },
  {
    title: "Denetim Kurulu",
    paragraphs: [
      "Denetim Kurulu, dernek faaliyetlerinin tüzükte belirtilen amaçlar doğrultusunda yürütülüp yürütülmediğini ve kayıtların mevzuata uygun tutulup tutulmadığını denetler.",
      "Denetim sonuçları raporlanarak Yönetim Kuruluna ve toplandığında Genel Kurula sunulur."
    ]
  },
  {
    title: "Gelir Kaynakları",
    items: [
      "Üye aidatları.",
      "Gerçek ve tüzel kişilerin kendi isteğiyle yaptığı bağış ve yardımlar.",
      "Dernek faaliyetlerinden, mal varlığından ve mevzuata uygun yardım toplama çalışmalarından elde edilen gelirler.",
      "Derneğin amacını gerçekleştirmek için mevzuata uygun biçimde yürütebileceği faaliyet gelirleri.",
      "Diğer yasal gelir kaynakları."
    ]
  },
  {
    title: "İç Denetim, Borçlanma ve Tüzük Değişikliği",
    paragraphs: [
      "Dernekte Genel Kurul, Yönetim Kurulu veya Denetim Kurulu tarafından iç denetim yapılabilir; gerekli görülmesi halinde bağımsız denetim kuruluşlarından destek alınabilir.",
      "Dernek, amacını gerçekleştirmek ve faaliyetlerini yürütebilmek için ihtiyaç halinde yönetim kurulu kararıyla borçlanabilir; ancak derneği ödeme güçlüğüne düşürecek nitelikte borçlanma yapılamaz.",
      "Tüzük değişikliği Genel Kurul kararıyla ve mevzuatta öngörülen toplantı ve karar yeter sayıları çerçevesinde yapılır."
    ]
  },
  {
    title: "Fesih ve Tasfiye",
    paragraphs: [
      "Genel Kurul, mevzuatta öngörülen toplantı ve karar yeter sayılarıyla derneğin feshine karar verebilir.",
      "Fesih halinde derneğin para, mal ve haklarının tasfiyesi, son Yönetim Kurulu üyelerinden oluşan tasfiye kurulunca mevzuata uygun şekilde yürütülür.",
      "Borçların ödenmesi ve alacakların tahsil edilmesinden sonra kalan varlıkların devri, Genel Kurul kararı ve ilgili mevzuat hükümleri doğrultusunda gerçekleştirilir."
    ]
  },
  {
    title: "Hüküm Eksikliği",
    paragraphs: [
      "Tüzükte hüküm bulunmayan hallerde Dernekler Kanunu, Türk Medeni Kanunu, Dernekler Yönetmeliği ve ilgili diğer mevzuat hükümleri uygulanır."
    ]
  }
];

export default function BylawPage() {
  return (
    <>
      <PageHero
        eyebrow="Kurumsal"
        title="Dernek Tüzüğü"
        description="Okyanus İnsani Yardım Derneği'nin kuruluş amacı, organları, çalışma alanları ve işleyiş esaslarına ilişkin tüzük metni."
      />

      <section className="bg-warm-white py-16 sm:py-20">
        <Container>
          <div className="mx-auto grid max-w-5xl gap-3">
            {bylawSections.map((section, index) => (
              <details
                key={section.title}
                open={index < 2}
                className="group rounded-2xl border border-border-soft bg-white p-5 shadow-sm"
              >
                <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl text-left [&::-webkit-details-marker]:hidden">
                  <span className="flex min-w-0 items-center gap-3">
                    <FileText aria-hidden className="h-5 w-5 shrink-0 text-ocean-green" />
                    <span className="font-extrabold text-dark-navy">{section.title}</span>
                  </span>
                  <ChevronDown aria-hidden className="h-5 w-5 shrink-0 text-ink-muted transition group-open:rotate-180" />
                </summary>
                <div className="mt-4 space-y-3 border-t border-border-soft pt-4">
                  {section.paragraphs?.map((paragraph) => (
                    <p key={paragraph} className="text-sm leading-7 text-ink-muted">
                      {paragraph}
                    </p>
                  ))}
                  {section.items ? (
                    <ul className="grid gap-2">
                      {section.items.map((item) => (
                        <li key={item} className="flex gap-3 text-sm leading-7 text-ink-muted">
                          <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-ocean-green" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </details>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
