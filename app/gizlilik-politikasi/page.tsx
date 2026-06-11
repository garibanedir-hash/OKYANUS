import { permanentRedirect } from "next/navigation";
import { getLegalPagePath } from "@/data/legalPages";

export default function PrivacyPolicyRedirectPage() {
  permanentRedirect(getLegalPagePath("gizlilik-politikasi"));
}
