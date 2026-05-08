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
      "Bağış türü, destek alanı ve proje bilgisi ayrı alanlarda tutulabilecek şekilde yapılandırılır. Gerçek entegrasyon aşamasında bu veriler ödeme, makbuz ve proje raporlarıyla eşleştirilebilir."
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
      "Raporlar dönemsel olarak hazırlanacak şekilde kurgulanır. Bu aşamada sayfa demo verilerle hazırlanmıştır; gerçek süreçte rapor tarihleri kurum takvimine göre belirlenir."
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
      "Kişisel verilerin yalnızca gerekli süreçlerde, sınırlı ve güvenli biçimde işlenmesi esastır. Resmi kullanım öncesinde KVKK ve gizlilik metinleri hukuki danışmanlıkla gözden geçirilmelidir."
  }
];
