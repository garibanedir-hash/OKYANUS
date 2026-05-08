import { getConversations, getMessagesByConversation } from "@/lib/data/adminRepository";
import { AdminConversationList } from "@/components/admin/AdminConversationList";
import { AdminMessagePanel } from "@/components/admin/AdminMessagePanel";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";

export default function CoordinatorMessagesPage() {
  const conversations = getConversations();
  const active = conversations[0];
  return <div className="grid gap-6"><AdminSectionHeader eyebrow="İç iletişim" title="Koordinatör Mesajları" description="Sadece koordinatörün dahil olduğu konuşmalar gösterilecek şekilde tasarlanmıştır." /><section className="grid gap-6 xl:grid-cols-[360px_1fr]"><AdminConversationList conversations={conversations} />{active ? <AdminMessagePanel conversation={active} messages={getMessagesByConversation(active.id)} /> : null}</section></div>;
}
