import {
  Apple,
  Baby,
  BookOpen,
  HeartPulse,
  PackageCheck,
  Snowflake
} from "lucide-react";

export const activities = [
  {
    title: "Acil Yardım",
    slug: "acil-yardim",
    icon: PackageCheck,
    description:
      "Afet, kriz ve ani ihtiyaç anlarında temel yaşam malzemelerini hızlı ve düzenli şekilde ulaştırıyoruz.",
    supportTypes: ["Temel ihtiyaç paketi", "Hijyen seti", "Acil saha lojistiği"]
  },
  {
    title: "Gıda ve Erzak Desteği",
    slug: "gida-erzak",
    icon: Apple,
    description:
      "Destek bekleyen ailelerin sofralarına bereket taşıyan gıda kolileri ve düzenli erzak destekleri hazırlıyoruz.",
    supportTypes: ["Gıda kolisi", "Market kartı", "Ramazan destekleri"]
  },
  {
    title: "Eğitim Desteği",
    slug: "egitim",
    icon: BookOpen,
    description:
      "Çocukların okul yolculuğunu güçlendirmek için kırtasiye, burs ve eğitim materyali desteği sağlıyoruz.",
    supportTypes: ["Kırtasiye seti", "Eğitim bursu", "Kitap ve materyal"]
  },
  {
    title: "Yetim ve Aile Destekleri",
    slug: "yetim-aile",
    icon: Baby,
    description:
      "Yetim çocuklar ve aileleri için düzenli takip edilen, mahremiyeti ve insan onurunu gözeten destekler sunuyoruz.",
    supportTypes: ["Aile takibi", "Eğitim desteği", "Sosyal destek"]
  },
  {
    title: "Sağlık Yardımları",
    slug: "saglik",
    icon: HeartPulse,
    description:
      "Tedavi, ilaç, medikal malzeme ve sağlık taraması ihtiyaçlarında dayanışma köprüleri kuruyoruz.",
    supportTypes: ["İlaç desteği", "Medikal malzeme", "Sağlık taraması"]
  },
  {
    title: "Kış Yardımları",
    slug: "kis-yardimi",
    icon: Snowflake,
    description:
      "Soğuk günlerde ailelere yakacak, mont, bot ve battaniye gibi temel kış destekleri ulaştırıyoruz.",
    supportTypes: ["Battaniye", "Mont ve bot", "Yakacak desteği"]
  }
];
