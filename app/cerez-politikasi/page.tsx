import { permanentRedirect } from "next/navigation";
import { getLegalPagePath } from "@/data/legalPages";

export default function CookiePolicyRedirectPage() {
  permanentRedirect(getLegalPagePath("cerez-politikasi"));
}
