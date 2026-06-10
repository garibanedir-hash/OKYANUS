export type TransparencyFaq = {
  id: string;
  question: string;
  answer: string;
};

export const transparencyFaqs: TransparencyFaq[] = [
  {
    id: "faq-donation-tracking",
    question: "Bağışlar nasıl takip edilir?",
    answer:
      "Bağış türü, destek alanı ve proje bilgisi ayrı başlıklarla ele alınır; süreçler faaliyet raporları ve bilgilendirme notlarıyla görünür hale getirilir."
  },
  {
    id: "faq-donation-area",
    question: "Destek olmak istediğim alanı seçebilir miyim?",
    answer:
      "Evet. Bağış formunda genel bağışın yanında gıda, eğitim, yetim ve aile destekleri, acil yardım ve kış yardımları gibi alanlar seçilebilir."
  },
  {
    id: "faq-reports",
    question: "Faaliyet raporları ne zaman yayınlanır?",
    answer:
      "Raporlar kurum takvimine ve saha çalışmalarının tamamlanma durumuna göre dönemsel olarak yayınlanır."
  },
  {
    id: "faq-volunteer",
    question: "Gönüllü başvuruları nasıl değerlendirilir?",
    answer:
      "Başvurular ilgi alanı, şehir, zaman uygunluğu ve ekip ihtiyacına göre ön değerlendirmeye alınır. Ardından uygun ekip yönlendirmesi yapılır."
  },
  {
    id: "faq-privacy",
    question: "Yardım faaliyetlerinde kişisel veriler nasıl korunur?",
    answer:
      "Kişisel verilerin yalnızca gerekli süreçlerde, sınırlı ve güvenli biçimde işlenmesi esastır; çocuk ve aile mahremiyeti ayrıca korunur."
  }
];
