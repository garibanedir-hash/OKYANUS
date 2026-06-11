import { permanentRedirect } from "next/navigation";
import { getLegalPagePath } from "@/data/legalPages";

export default function DonationTermsRedirectPage() {
  permanentRedirect(getLegalPagePath("bagis-bilgilendirme-ve-sartlari"));
}
