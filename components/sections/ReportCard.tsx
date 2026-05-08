import { FileText } from "lucide-react";
import type { Report } from "@/data/reports";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function ReportCard({ report }: { report: Report }) {
  return (
    <article className="rounded-brand border border-border-soft bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-soft-blue text-deep-blue">
          <FileText aria-hidden className="h-6 w-6" />
        </span>
        <Badge variant={report.statusLabel === "Demo rapor" ? "green" : "blue"}>{report.statusLabel}</Badge>
      </div>
      <p className="mt-5 text-sm font-bold uppercase tracking-[0.14em] text-ocean-green">{report.period}</p>
      <h2 className="mt-2 text-2xl font-bold text-dark-navy">{report.title}</h2>
      <p className="mt-3 leading-7 text-ink-muted">{report.summary}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {report.metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl bg-soft-gray p-3">
            <p className="font-extrabold text-deep-blue">{metric.value}</p>
            <p className="text-xs font-bold text-ink-muted">{metric.label}</p>
          </div>
        ))}
      </div>
      <Button href={report.pdfUrl ?? "/faaliyet-raporlari"} variant="ghost" className="mt-6" showIcon>
        Raporu İncele
      </Button>
    </article>
  );
}
