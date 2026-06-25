export function StaffMessagePanel({ messages }: { messages: string[] }) {
  return (
    <section className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
      <h2 className="text-xl font-bold text-dark-navy">Mesajlarım</h2>
      <div className="mt-4 grid gap-3">
        {messages.length ? (
          messages.map((message) => (
            <article key={message} className="rounded-2xl bg-soft-gray p-4 text-sm font-semibold leading-6 text-ink-muted">{message}</article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border-soft bg-soft-gray p-4 text-sm font-semibold leading-6 text-ink-muted">
            Henüz mesaj bulunmuyor.
          </div>
        )}
      </div>
    </section>
  );
}
