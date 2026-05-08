import { stats } from "@/data/stats";
import { Container } from "@/components/ui/Container";
import { MotionReveal } from "@/components/MotionReveal";

export function StatsSection() {
  return (
    <section className="bg-white py-14">
      <Container>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <MotionReveal key={stat.label} delay={index * 0.04}>
              <div className="rounded-brand border border-slate-200/80 bg-warm-white p-6 text-center shadow-card">
                <p className="text-3xl font-extrabold text-deep-blue">{stat.value}</p>
                <p className="mt-2 text-sm font-semibold text-slate-600">{stat.label}</p>
              </div>
            </MotionReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
