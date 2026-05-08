export function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded-2xl border border-border-soft bg-white p-5 shadow-card">
      <summary className="focus-ring cursor-pointer list-none rounded-lg text-base font-bold text-dark-navy">
        {question}
      </summary>
      <p className="mt-3 leading-7 text-ink-muted">{answer}</p>
    </details>
  );
}
