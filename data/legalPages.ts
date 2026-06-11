export type LegalSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

export type LegalPage = {
  slug: string;
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
};

export const LEGAL_LAST_UPDATED = "11 Haziran 2026";

export const legalPages: LegalPage[] = [
  {
    slug: "kvkk-aydinlatma-metni",
    title: "KVKK Aydınlatma Metni",
    description:
      "Okyanus İnsani Yardım Derneği tarafından yürütülen web sitesi, bağış, gönüllülük ve iletişim süreçlerinde kişisel verilerin işlenmesine ilişkin bilgilendirme.",
    lastUpdated: LEGAL_LAST_UPDATED,
    sections: [
      {
        title: "Veri Sorumlusu",
        paragraphs: [
          "Kişisel verileriniz, veri sorumlusu sıfatıyla Okyanus İnsani Yardım Derneği tarafından işlenebilir.",
          "Başvuru ve bilgi taleplerinizi dernek resmi iletişim kanalları üzerinden iletebilirsiniz."
        ]
      },
      {
        title: "İşlenen Kişisel Veri Kategorileri",
        paragraphs: [
          "Web sitesi ve dernek faaliyetleri kapsamında aşağıdaki kişisel veri kategorileri, ilgili sürecin niteliğiyle sınırlı olarak işlenebilir."
        ],
        items: [
          "Kimlik bilgileri: ad, soyad ve başvuru içeriğinde kullanıcı tarafından paylaşılan bilgiler.",
          "İletişim bilgileri: e-posta adresi, telefon numarası, şehir ve mesaj içeriği.",
          "Bağış ve başvuru bilgileri: bağış tutarı, destek alanı, proje tercihi, gönüllülük ilgi alanı, kurban/yetim hamiliği başvuru bilgileri.",
          "İşlem güvenliği bilgileri: form gönderim zamanı, teknik güvenlik kayıtları ve kötüye kullanımın önlenmesine yönelik sınırlı kayıtlar.",
          "Görsel/medya bilgileri: yalnızca ilgili kişinin ayrıca bilgilendirilmesi ve gerekli onayların alınması halinde faaliyet fotoğrafı, video veya benzeri medya kayıtları."
        ]
      },
      {
        title: "Kişisel Verilerin İşlenme Amaçları",
        items: [
          "Bağış, gönüllülük, yetim hamiliği, kurban ve iletişim taleplerinin alınması, değerlendirilmesi ve sonuçlandırılması.",
          "Dernek faaliyetlerinin planlanması, saha ve operasyon ekipleriyle koordinasyonun sağlanması.",
          "Bağışçılara, gönüllülere ve başvuru sahiplerine talep ettikleri konuda geri dönüş yapılması.",
          "Yasal yükümlülüklerin, kayıt, denetim, güvenlik ve raporlama süreçlerinin yerine getirilmesi.",
          "Ayrı iletişim izni verilmişse faaliyet ve bilgilendirme duyurularının iletilmesi."
        ]
      },
      {
        title: "Aktarılabilecek Kişi ve Kurumlar",
        paragraphs: [
          "Kişisel verileriniz, ilgili sürecin gerektirdiği ölçüde ve mevzuata uygun olarak aşağıdaki taraflarla paylaşılabilir."
        ],
        items: [
          "Yetkili kamu kurum ve kuruluşları ile kanunen bilgi talep etmeye yetkili merciler.",
          "Bağış ve ödeme süreçlerinde online ödeme altyapısı aktif olduğunda bankalar, ödeme hizmeti sağlayıcıları ve teknik işlem tarafları.",
          "Web sitesi barındırma, veri tabanı, güvenlik, iletişim ve teknik destek hizmeti sağlayan hizmet sağlayıcılar.",
          "Dernek bünyesindeki yetkili yönetim, saha, gönüllü koordinasyon ve bağışçı ilişkileri ekipleri.",
          "Faaliyetlerin yürütülmesi için zorunlu olduğu ölçüde iş birliği yapılan kişi ve kurumlar."
        ]
      },
      {
        title: "Kişisel Veri Toplama Yöntemi",
        paragraphs: [
          "Kişisel verileriniz web sitesi formları, WhatsApp veya diğer resmi iletişim kanalları, e-posta, telefon görüşmeleri, dernek etkinlikleri ve başvuru süreçlerinde sizin tarafınızdan iletilen bilgiler aracılığıyla toplanabilir.",
          "Teknik kayıtlar ise web sitesinin güvenli çalışması, kötüye kullanımın önlenmesi ve temel hizmetlerin sunulması amacıyla otomatik yollarla oluşabilir."
        ]
      },
      {
        title: "Hukuki Sebepler",
        paragraphs: [
          "Kişisel verileriniz, 6698 sayılı Kişisel Verilerin Korunması Kanunu'nda yer alan hukuki sebepler kapsamında işlenebilir."
        ],
        items: [
          "Bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması.",
          "Veri sorumlusunun hukuki yükümlülüğünü yerine getirmesi için zorunlu olması.",
          "Bir hakkın tesisi, kullanılması veya korunması için veri işlemenin zorunlu olması.",
          "İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla derneğin meşru menfaatleri için zorunlu olması.",
          "Kanunlarda açıkça öngörülmesi.",
          "Açık rıza gereken hallerde ilgili kişinin açık rızasının alınması."
        ]
      },
      {
        title: "İlgili Kişinin Hakları",
        paragraphs: [
          "KVKK kapsamında kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, işleme amacını öğrenme, aktarıldığı üçüncü kişileri bilme, eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme, ilgili şartlarda silinmesini veya yok edilmesini isteme, aktarılan üçüncü kişilere bildirim yapılmasını isteme, otomatik sistemler nedeniyle aleyhinize sonuç doğmasına itiraz etme ve kanuna aykırı işleme nedeniyle zararın giderilmesini talep etme haklarına sahipsiniz."
        ]
      },
      {
        title: "Başvuru ve İletişim Yöntemi",
        paragraphs: [
          "KVKK kapsamındaki taleplerinizi dernek resmi iletişim kanalları üzerinden Okyanus İnsani Yardım Derneği'ne iletebilirsiniz.",
          "Başvurunuzun sağlıklı değerlendirilebilmesi için kimliğinizi ve talebinizi belirlemeye yarayan bilgileri paylaşmanız istenebilir."
        ]
      },
      {
        title: "Saklama ve İmha Yaklaşımı",
        paragraphs: [
          "Kişisel verileriniz, işleme amacının gerektirdiği süre ve ilgili mevzuatta öngörülen saklama süreleri boyunca muhafaza edilir.",
          "Saklama süresinin sona ermesi veya işleme amacının ortadan kalkması halinde kişisel veriler silme, yok etme veya anonim hale getirme yöntemlerinden uygun olanı ile imha edilir."
        ]
      }
    ]
  },
  {
    slug: "acik-riza-metni",
    title: "Açık Rıza Metni",
    description:
      "Açık rıza gerektiren gönüllülük, duyuru, iletişim ve medya kullanımı süreçleri için ayrı bilgilendirme metni.",
    lastUpdated: LEGAL_LAST_UPDATED,
    sections: [
      {
        title: "Açık Rızanın Kapsamı",
        paragraphs: [
          "Bu metin, KVKK Aydınlatma Metni'nden ayrı olarak, açık rıza gerektirebilecek belirli veri işleme faaliyetleri hakkında bilgilendirme amacı taşır.",
          "Açık rızanız belirli bir konuya ilişkin, bilgilendirmeye dayalı ve özgür iradenizle verdiğiniz onaydır. Açık rızanızı dernek resmi iletişim kanalları üzerinden ileriye etkili olarak geri alabilirsiniz."
        ]
      },
      {
        title: "Gönüllü Başvuru Süreçleri",
        paragraphs: [
          "Gönüllü başvurusu kapsamında paylaştığınız bilgiler, uygun gönüllülük alanlarının değerlendirilmesi, ön görüşme planlanması ve gönüllü koordinasyonu amacıyla işlenebilir.",
          "Başvuru sürecinde zorunlu olmayan ek bilgiler, yalnızca sizin tarafınızdan paylaşılması ve ilgili amaçla sınırlı olması halinde değerlendirilir."
        ]
      },
      {
        title: "İletişim Talebi Sonrası Geri Dönüş",
        paragraphs: [
          "İletişim formu veya WhatsApp hattı üzerinden talep ilettiğinizde, paylaştığınız iletişim bilgileriniz talebinizin yanıtlanması ve gerektiğinde ek bilgi alınması amacıyla kullanılabilir."
        ]
      },
      {
        title: "Bağış Bilgilendirme Süreçleri",
        paragraphs: [
          "Bağış, kurban, yetim hamiliği veya proje destek talepleriniz sonrasında, bağış sürecinin açıklanması, yönlendirme yapılması ve destek alanıyla ilgili bilgi verilmesi amacıyla sizinle iletişim kurulabilir."
        ]
      },
      {
        title: "Etkinlik ve Faaliyet Duyuruları",
        paragraphs: [
          "Ayrıca izin vermeniz halinde dernek faaliyetleri, gönüllülük çağrıları, kampanya bilgilendirmeleri ve proje duyuruları tarafınıza iletilebilir.",
          "Bu izin, temel başvuru veya talep süreçlerinin yürütülmesi için zorunlu değildir."
        ]
      },
      {
        title: "Görsel ve Medya Kullanımı",
        paragraphs: [
          "Faaliyet fotoğrafı, video, röportaj veya benzeri medya içeriklerinin public kanallarda kullanımı gerekiyorsa, ilgili kişiler ayrıca bilgilendirilir ve gerekli durumlarda ayrı açık rıza alınır.",
          "Çocuklara ve hassas durumdaki kişilere ilişkin görsel kullanımlarında mahremiyet ilkesi ayrıca gözetilir."
        ]
      }
    ]
  },
  {
    slug: "gizlilik-politikasi",
    title: "Gizlilik Politikası",
    description:
      "Okyanus İnsani Yardım Derneği web sitesi ve iletişim kanallarında kişisel verilerin gizliliğine ilişkin genel politika.",
    lastUpdated: LEGAL_LAST_UPDATED,
    sections: [
      {
        title: "Hangi Veriler İşlenebilir?",
        paragraphs: [
          "Web sitesini ziyaret ettiğinizde, iletişim formu doldurduğunuzda, bağış veya gönüllülük talebi ilettiğinizde ad, soyad, e-posta, telefon, şehir, mesaj içeriği, başvuru tercihi, bağış alanı ve teknik güvenlik kayıtları gibi bilgiler işlenebilir."
        ]
      },
      {
        title: "Veriler Hangi Amaçlarla Kullanılır?",
        items: [
          "Talep ve başvurularınıza geri dönüş yapmak.",
          "Bağış, gönüllülük, kurban ve yetim hamiliği süreçlerini planlamak.",
          "Dernek faaliyetlerini yürütmek, güvenli kayıt ve raporlama süreçlerini desteklemek.",
          "Yetkili mercilerden gelen talepleri mevzuata uygun şekilde karşılamak.",
          "Ayrı izin verilmişse faaliyet ve bilgilendirme duyurularını iletmek."
        ]
      },
      {
        title: "Kimlerle Paylaşılabilir?",
        paragraphs: [
          "Verileriniz, yalnızca ilgili süreç için gerekli olduğu ölçüde dernek yetkili ekipleri, teknik hizmet sağlayıcılar, online ödeme altyapısı aktif olduğunda ödeme hizmeti sağlayıcıları ve yetkili kamu kurumlarıyla paylaşılabilir."
        ]
      },
      {
        title: "Güvenlik Tedbirleri",
        paragraphs: [
          "Dernek, kişisel verilerin yetkisiz erişime, kayba, kötüye kullanıma veya hukuka aykırı işlemeye karşı korunması için makul teknik ve idari tedbirleri uygular.",
          "Erişim yetkileri görev ihtiyacıyla sınırlı tutulur; hassas operasyon kayıtlarına public alandan erişim verilmez."
        ]
      },
      {
        title: "Üçüncü Taraf Bağlantılar",
        paragraphs: [
          "Web sitesi, WhatsApp veya farklı üçüncü taraf platformlara yönlendirme bağlantıları içerebilir. Bu platformların gizlilik uygulamaları kendi politika ve kullanım şartlarına tabidir."
        ]
      },
      {
        title: "WhatsApp Yönlendirmesi",
        paragraphs: [
          "WhatsApp üzerinden iletişime geçtiğinizde paylaşacağınız bilgiler, talebinizin yanıtlanması ve bağış ya da başvuru sürecinizin yönlendirilmesi amacıyla değerlendirilebilir."
        ]
      },
      {
        title: "Teknik Hizmet Sağlayıcılar",
        paragraphs: [
          "Web sitesinin barındırılması, veri tabanı, güvenlik, form işleme ve erişim yönetimi gibi teknik ihtiyaçlar için Supabase, Vercel veya benzeri hizmet sağlayıcı altyapılarından yararlanılabilir.",
          "Bu açıklama teknik hizmet türlerini kullanıcı dostu şekilde özetler; güvenlik anahtarları, ortam değişkenleri veya sistem sırları public alanda paylaşılmaz."
        ]
      },
      {
        title: "İletişim",
        paragraphs: [
          "Gizlilik ve kişisel veri talepleriniz için dernek resmi iletişim kanallarını kullanabilirsiniz."
        ]
      }
    ]
  },
  {
    slug: "cerez-politikasi",
    title: "Çerez Politikası",
    description:
      "Okyanus web sitesinde kullanılabilecek zorunlu, işlevsel, analitik ve pazarlama çerezlerine ilişkin bilgilendirme.",
    lastUpdated: LEGAL_LAST_UPDATED,
    sections: [
      {
        title: "Çerez Nedir?",
        paragraphs: [
          "Çerezler, web sitesini ziyaret ettiğinizde tarayıcınız veya cihazınız üzerinde saklanabilen küçük veri dosyalarıdır. Çerezler, sitenin güvenli ve düzgün çalışmasına, tercihlerin hatırlanmasına veya kullanımın anlaşılmasına yardımcı olabilir."
        ]
      },
      {
        title: "Zorunlu Çerezler",
        paragraphs: [
          "Zorunlu çerezler, web sitesinin temel işlevlerinin çalışması, güvenlik kontrollerinin yapılması, oturum yönetimi ve formların güvenli şekilde kullanılabilmesi için gerekli olabilir."
        ]
      },
      {
        title: "Performans ve Analitik Çerezleri",
        paragraphs: [
          "Performans ve analitik çerezleri, ziyaretçi deneyimini ve site performansını anlamak için kullanılabilir. Tanıtım aşamasında zorunlu teknik çerezler dışında kapsamlı bir pazarlama/analitik çerez kullanımı planlanmamaktadır.",
          "İleride analitik araçları eklenirse bu politika ve gerekiyorsa çerez tercih mekanizması güncellenir."
        ]
      },
      {
        title: "İşlevsel Çerezler",
        paragraphs: [
          "İşlevsel çerezler, dil, erişilebilirlik, tercih veya benzeri kullanıcı deneyimi ayarlarının hatırlanması için kullanılabilir."
        ]
      },
      {
        title: "Pazarlama Çerezleri",
        paragraphs: [
          "Pazarlama çerezleri, reklam veya yeniden hedefleme amacıyla kullanılabilir. Tanıtım aşamasında kapsamlı pazarlama çerezi kullanımı planlanmamaktadır.",
          "Bu tür bir kullanım eklenirse kullanıcılar açık şekilde bilgilendirilir ve gerekli tercih/onay mekanizmaları devreye alınır."
        ]
      },
      {
        title: "Çerezleri Nasıl Yönetebilirsiniz?",
        paragraphs: [
          "Site üzerindeki çerez tercih paneliyle zorunlu çerezler dışındaki kategorileri yönetebilirsiniz. Zorunlu çerezler sitenin güvenli ve düzgün çalışması için açık tutulur.",
          "Tarayıcı ayarlarınız üzerinden çerezleri silebilir, engelleyebilir veya belirli siteler için tercihlerinizi değiştirebilirsiniz. Zorunlu çerezlerin engellenmesi halinde sitenin bazı temel işlevleri beklenen şekilde çalışmayabilir."
        ]
      },
      {
        title: "Şu An Kullanılan Çerezler",
        paragraphs: [
          "Web sitesinde zorunlu teknik çerezler, güvenlik/oturum yönetimi kayıtları ve kullanıcının çerez tercihinin tarayıcıda hatırlanmasına yönelik sınırlı kayıtlar kullanılabilir.",
          "Çerez tercih kaydı, tercihlerinizi tekrar sormamak ve tercih sürümü değiştiğinde yeniden bilgilendirmek amacıyla saklanır.",
          "Analitik, pazarlama veya üçüncü taraf reklam çerezi kullanımı başlatılırsa bu bölüm güncellenir."
        ]
      }
    ]
  },
  {
    slug: "bagis-bilgilendirme-ve-sartlari",
    title: "Bağış Bilgilendirme ve Şartları",
    description:
      "Bağış, proje desteği, WhatsApp bilgilendirme hattı ve ileride aktif edilebilecek online ödeme süreci hakkında temel bilgilendirme.",
    lastUpdated: LEGAL_LAST_UPDATED,
    sections: [
      {
        title: "Bağış Sürecinin Genel Çerçevesi",
        paragraphs: [
          "Okyanus İnsani Yardım Derneği'ne yapılacak bağışlar, bağışçının kendi iradesiyle ve gönüllülük esasına göre gerçekleştirilir.",
          "Bağışlar genel destek havuzuna veya bağışçının tercih ettiği proje/faaliyet alanına yönlendirilebilir. Proje bazlı yönlendirme, dernek operasyon ihtiyaçları, saha gerçekliği ve ilgili bağış amacının gerektirdiği çerçevede değerlendirilir."
        ]
      },
      {
        title: "WhatsApp Bilgilendirme Hattı",
        paragraphs: [
          "Bağış süreci dönemsel olarak WhatsApp bilgilendirme hattı üzerinden yürütülebilir. Bu durumda bağışçı, destek olmak istediği alanı dernek ekibine iletir ve ekibin paylaştığı yönlendirme doğrultusunda süreç hakkında bilgi alır.",
          "WhatsApp üzerinden paylaşılan bilgiler, talebin yanıtlanması ve bağış sürecinin açıklanması amacıyla değerlendirilir."
        ]
      },
      {
        title: "Online Ödeme Altyapısı",
        paragraphs: [
          "Online ödeme altyapısı aktif olduğunda bağışçı, ödeme adımlarına geçmeden önce tutar, bağış alanı, iletişim bilgileri ve ödeme yönlendirmesi hakkında ayrıca bilgilendirilir.",
          "Online ödeme sistemi aktif edilmeden önce bu metin, güncel ödeme akışı ve hizmet sağlayıcı bilgileriyle yeniden gözden geçirilir."
        ]
      },
      {
        title: "Makbuz ve Teşekkür Süreçleri",
        paragraphs: [
          "Bağış sonrası makbuz, teşekkür veya bilgilendirme süreçleri dernek kayıtları ve ilgili mevzuat çerçevesinde yürütülür.",
          "Bağışçının iletişim bilgileri, yalnızca bağış ve bilgilendirme süreci için gerekli olduğu ölçüde kullanılır."
        ]
      },
      {
        title: "İptal, İade ve Değerlendirme Talepleri",
        paragraphs: [
          "Bağışa ilişkin iptal, iade veya düzeltme talepleri, bağışın niteliği, aktarım durumu, mevzuat ve dernek iç süreçleri dikkate alınarak değerlendirilir.",
          "Yanlış veya eksik bilgiyle işlem yapıldığını düşünüyorsanız dernek resmi iletişim kanalları üzerinden talebinizi iletebilirsiniz."
        ]
      }
    ]
  },
  {
    slug: "gonullu-basvuru-aydinlatma-metni",
    title: "Gönüllü Başvuru Aydınlatma Metni",
    description:
      "Gönüllü başvurusu sırasında paylaşılan kişisel verilerin hangi amaçlarla işlendiğine ilişkin bilgilendirme.",
    lastUpdated: LEGAL_LAST_UPDATED,
    sections: [
      {
        title: "İşlenen Veriler",
        paragraphs: [
          "Gönüllü başvuru formunda ad, soyad, e-posta, telefon, yaş, şehir, ilgi alanı, gönüllülük deneyimi ve mesaj alanında sizin tarafınızdan paylaşılan bilgiler işlenebilir."
        ]
      },
      {
        title: "İşleme Amaçları",
        items: [
          "Gönüllü başvurunuzu almak ve değerlendirmek.",
          "Sizinle ön görüşme veya bilgilendirme için iletişim kurmak.",
          "İlgi alanınıza ve uygunluk durumunuza göre gönüllülük alanlarını planlamak.",
          "Faaliyet güvenliği, ekip koordinasyonu ve kayıt süreçlerini yürütmek.",
          "Ayrı izin vermeniz halinde faaliyet ve gönüllülük duyurularını iletmek."
        ]
      },
      {
        title: "Hukuki Sebep ve Açık Rıza Ayrımı",
        paragraphs: [
          "Başvuru bilgileriniz, başvuru sürecinin yürütülmesi, bir hakkın tesisi veya kullanılması, derneğin meşru menfaati ve ilgili mevzuat kapsamındaki yükümlülükler çerçevesinde işlenebilir.",
          "Faaliyet duyuruları, gönüllü havuzu iletişimi veya görsel/medya kullanımı gibi açık rıza gerektirebilecek haller ayrıca onayınıza sunulur."
        ]
      },
      {
        title: "Aktarım ve Saklama",
        paragraphs: [
          "Verileriniz, yalnızca gönüllü koordinasyonu için yetkili dernek ekipleri ve gerekli teknik hizmet sağlayıcılarla sınırlı olarak paylaşılabilir.",
          "Başvuru bilgileriniz, gönüllülük ilişkisinin ve başvuru değerlendirmesinin gerektirdiği süre boyunca saklanır; sürenin sonunda uygun yöntemlerle silinir, yok edilir veya anonim hale getirilir."
        ]
      },
      {
        title: "Haklarınız",
        paragraphs: [
          "KVKK kapsamındaki haklarınızı kullanmak için dernek resmi iletişim kanalları üzerinden başvuru yapabilirsiniz."
        ]
      }
    ]
  },
  {
    slug: "iletisim-formu-aydinlatma-metni",
    title: "İletişim Formu Aydınlatma Metni",
    description:
      "İletişim formu aracılığıyla iletilen kişisel verilerin işlenmesine ilişkin bilgilendirme.",
    lastUpdated: LEGAL_LAST_UPDATED,
    sections: [
      {
        title: "İşlenen Veriler",
        paragraphs: [
          "İletişim formunda ad, soyad, e-posta adresi, konu, mesaj içeriği ve teknik güvenlik kayıtları işlenebilir."
        ]
      },
      {
        title: "İşleme Amaçları",
        items: [
          "Talebinizi almak, ilgili ekibe yönlendirmek ve yanıtlamak.",
          "Gerekirse ek bilgi almak için sizinle iletişime geçmek.",
          "Kötüye kullanım, spam veya güvenlik risklerini önlemek.",
          "Talebin niteliğine göre dernek kayıt ve takip süreçlerini yürütmek."
        ]
      },
      {
        title: "Hukuki Sebepler",
        paragraphs: [
          "İletişim formu verileri, talebinizin yanıtlanması, bir hakkın tesisi veya kullanılması, derneğin meşru menfaati ve ilgili mevzuat kapsamındaki yükümlülükler çerçevesinde işlenebilir.",
          "Faaliyet duyurusu veya genel bilgilendirme iletilmesi için ayrıca onayınız alınır."
        ]
      },
      {
        title: "Aktarım ve Saklama",
        paragraphs: [
          "Verileriniz, talebinizi yanıtlamakla görevli dernek ekipleri ve gerekli teknik hizmet sağlayıcılarla sınırlı şekilde paylaşılabilir.",
          "İletişim kayıtları, talebin gerektirdiği süre ve mevzuat kapsamındaki saklama süreleri boyunca muhafaza edilir."
        ]
      },
      {
        title: "Haklarınız",
        paragraphs: [
          "KVKK kapsamındaki haklarınızı kullanmak için dernek resmi iletişim kanalları üzerinden başvuru yapabilirsiniz."
        ]
      }
    ]
  },
  {
    slug: "kullanim-sartlari",
    title: "Kullanım Şartları",
    description:
      "Okyanus web sitesinin kullanımı, içeriklerin amacı ve kullanıcı sorumluluklarına ilişkin temel şartlar.",
    lastUpdated: LEGAL_LAST_UPDATED,
    sections: [
      {
        title: "Web Sitesinin Amacı",
        paragraphs: [
          "Bu web sitesi, Okyanus İnsani Yardım Derneği'nin faaliyetleri, projeleri, gönüllülük ve bağış bilgilendirme süreçleri hakkında kullanıcıları bilgilendirmek amacıyla sunulur."
        ]
      },
      {
        title: "İçeriklerin Kullanımı",
        paragraphs: [
          "Sitedeki metin, görsel ve içerikler bilgilendirme amaçlıdır. İçerikler, dernek izni olmadan yanıltıcı, ticari veya kurum itibarını zedeleyici şekilde kullanılamaz."
        ]
      },
      {
        title: "Kullanıcı Sorumluluğu",
        paragraphs: [
          "Formları kullanırken doğru, güncel ve size ait bilgileri paylaşmanız beklenir. Başkalarına ait kişisel verileri yetkisiz şekilde paylaşmamalısınız."
        ]
      },
      {
        title: "Üçüncü Taraf Bağlantılar",
        paragraphs: [
          "Sitede yer alan üçüncü taraf bağlantılar kendi kullanım ve gizlilik şartlarına tabidir. Bu platformların içerik ve uygulamalarından ilgili hizmet sağlayıcılar sorumludur."
        ]
      },
      {
        title: "Değişiklikler",
        paragraphs: [
          "Dernek, web sitesi içeriklerini, hukuki bilgilendirme metinlerini ve kullanım şartlarını ihtiyaç halinde güncelleyebilir. Güncel metinler bu sayfada yayımlanır."
        ]
      }
    ]
  },
  {
    slug: "mesafeli-bagis-online-odeme-bilgilendirmesi",
    title: "Mesafeli Bağış / Online Ödeme Bilgilendirmesi",
    description:
      "Online ödeme altyapısı aktif edildiğinde bağışçıların ödeme adımları, bilgilendirme ve güvenli işlem süreci hakkında temel açıklama.",
    lastUpdated: LEGAL_LAST_UPDATED,
    sections: [
      {
        title: "Genel Bilgilendirme",
        paragraphs: [
          "Bağış işlemi bir ürün veya hizmet satın alımı değil, dernek faaliyetlerine gönüllü destek niteliğindedir. Online ödeme altyapısı aktif olduğunda bağışçı, ödeme adımına geçmeden önce bağış tutarı, bağış amacı ve iletişim bilgileri hakkında bilgilendirilir."
        ]
      },
      {
        title: "Online Ödeme Altyapısı Aktif Olduğunda",
        items: [
          "Bağışçı, ödeme sayfasına yönlendirilmeden önce destek alanını ve tutarı kontrol eder.",
          "Ödeme işlemi, ilgili ödeme hizmeti sağlayıcısının güvenli altyapısı üzerinden yürütülür.",
          "Ödeme sonucu, bağış kaydı, teşekkür ve makbuz süreçlerinin yürütülmesi amacıyla dernek kayıtlarına işlenebilir.",
          "Ödeme sırasında ortaya çıkabilecek hata veya kesinti durumlarında bağışçı dernek iletişim kanalları üzerinden destek alabilir."
        ]
      },
      {
        title: "WhatsApp ve İletişim Kanalı ile Yönlendirme",
        paragraphs: [
          "Online ödeme altyapısı aktif değilken veya dönemsel olarak tercih edilmediğinde bağış süreci WhatsApp bilgilendirme hattı ya da dernek resmi iletişim kanalları üzerinden yönlendirilebilir."
        ]
      },
      {
        title: "İptal, İade ve Düzeltme Talepleri",
        paragraphs: [
          "Bağışa ilişkin iptal, iade veya düzeltme talepleri bağışın niteliği, aktarım durumu ve ilgili mevzuat dikkate alınarak değerlendirilir.",
          "Yanlış tutar, yanlış destek alanı veya iletişim bilgisi hatası olduğunu düşünüyorsanız dernek resmi iletişim kanalları üzerinden başvuru yapabilirsiniz."
        ]
      },
      {
        title: "Kişisel Veriler",
        paragraphs: [
          "Bağış ve ödeme sürecindeki kişisel verileriniz KVKK Aydınlatma Metni, Gizlilik Politikası ve Bağış Bilgilendirme ve Şartları kapsamında işlenir."
        ]
      }
    ]
  }
];

export function getLegalPageBySlug(slug: string) {
  return legalPages.find((page) => page.slug === slug);
}

export function getLegalPagePath(slug: string) {
  return `/hukuki/${slug}`;
}
