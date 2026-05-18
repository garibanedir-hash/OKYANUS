import { stats } from "@/data/stats";
import { Container } from "@/components/ui/Container";
import { MotionReveal } from "@/components/MotionReveal";

export function StatsSection() {
  return (
    <section className="bg-deep-blue py-14">
      <Container>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <MotionReveal key={stat.label} delay={index * 0.06}>
              <div className="rounded-brand border border-white/10 bg-white/10 p-6 text-center backdrop-blur-sm">
                <p className="text-3xl font-extrabold text-ocean-green">{stat.value}</p>
                <p className="mt-2 text-sm font-semibold text-white/70">{stat.label}</p>
              </div>
            </MotionReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
