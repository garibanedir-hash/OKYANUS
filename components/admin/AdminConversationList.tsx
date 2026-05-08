import type { MockConversation } from "@/data/adminMock";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";

export function AdminConversationList({ conversations }: { conversations: MockConversation[] }) {
  return (
    <div className="grid gap-3">
      {conversations.map((conversation, index) => (
        <article key={conversation.id} className={`rounded-2xl border p-4 ${index === 0 ? "border-primary-blue bg-soft-blue" : "border-border-soft bg-white"}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-dark-navy">{conversation.subject}</p>
              <p className="mt-1 text-xs font-semibold text-ink-muted">{conversation.participantNames.join(", ")}</p>
            </div>
            <AdminStatusBadge status={conversation.unreadCount ? "Okunmadı" : "Okundu"} />
          </div>
          <p className="mt-3 text-xs font-bold text-ocean-green">{conversation.type} / {conversation.lastMessageAt}</p>
        </article>
      ))}
    </div>
  );
}
