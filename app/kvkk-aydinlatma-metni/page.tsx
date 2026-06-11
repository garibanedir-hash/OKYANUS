import { permanentRedirect } from "next/navigation";
import { getLegalPagePath } from "@/data/legalPages";

export default function KvkkRedirectPage() {
  permanentRedirect(getLegalPagePath("kvkk-aydinlatma-metni"));
}
