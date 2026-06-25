import { getConversations, getInternalCommunicationSummary, getMessagesByConversation } from "@/lib/data/adminRepository";
import { AdminConversationList } from "@/components/admin/AdminConversationList";
import { AdminMessagePanel } from "@/components/admin/AdminMessagePanel";
import { AdminMiniStat } from "@/components/admin/AdminMiniStat";
import { AdminPanelNotice } from "@/components/admin/AdminPanelNotice";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";

export default function AdminMessagesPage() {
  const conversations = getConversations();
  const activeConversation = conversations[0];
  const messages = activeConversation ? getMessagesByConversation(activeConversation.id) : [];
  const summary = getInternalCommunicationSummary();

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="İç İletişim"
        title="Mesajlar"
        description="Personel mesajları, görev yorumları ve proje iç notları gerçek kayıtlar oluştuğunda burada izlenir."
        actionLabel="Yeni Konuşma"
      />
      <section className="grid gap-4 md:grid-cols-3">
        <AdminMiniStat label="Konuşma" value={summary.totalConversations} />
        <AdminMiniStat label="Okunmamış mesaj" value={summary.unreadTotal} />
        <AdminMiniStat label="Görev bağlantılı" value={summary.taskRelated} />
      </section>
      <AdminPanelNotice title="İletişim kayıtları">
        Konuşma katılımcısı kontrolü, kanal yetkileri ve mesaj audit izleri tamamlandığında gerçek kayıtlar bu alanda listelenecektir.
      </AdminPanelNotice>
      <section className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <div className="rounded-brand border border-border-soft bg-white p-5 shadow-card">
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.14em] text-ocean-green">Konuşmalar</p>
          <AdminConversationList conversations={conversations} />
        </div>
        {activeConversation ? <AdminMessagePanel conversation={activeConversation} messages={messages} /> : null}
      </section>
    </div>
  );
}
