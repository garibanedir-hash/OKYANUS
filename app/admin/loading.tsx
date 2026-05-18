import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function AdminLoading() {
  return <LoadingScreen variant="dark" message="Yönetim paneli yükleniyor..." description="Lütfen bekleyin." />;
}
