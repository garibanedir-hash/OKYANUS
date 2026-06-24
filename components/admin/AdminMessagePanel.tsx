import type { MockConversation, MockInternalMessage } from "@/data/adminMock";

export function AdminMessagePanel({
  conversation,
  messages
}: {
  conversation: MockConversation;
  messages: MockInternalMessage[];
}) {
  return (
    <section className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ocean-green">{conversation.type}</p>
      <h2 className="mt-2 text-2xl font-bold text-dark-navy">{conversation.subject}</h2>
      <p className="mt-2 text-sm text-ink-muted">Katılımcılar: {conversation.participantNames.join(", ")}</p>
      <div className="mt-6 grid gap-4">
        {messages.map((message) => (
          <article key={message.id} className="rounded-2xl bg-soft-gray p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-bold text-dark-navy">{message.senderName}</p>
              <p className="text-xs font-semibold text-ink-muted">{message.createdAt}</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-ink-muted">{message.body}</p>
          </article>
        ))}
      </div>
      <label className="mt-6 block text-sm font-bold text-dark-navy">
        Mesaj kutusu
        <textarea className="focus-ring mt-2 min-h-24 w-full rounded-2xl border border-border-soft p-4" placeholder="Gerçek mesajlaşma backend'i sonraki aşamada bağlanacak." />
      </label>
    </section>
  );
}
