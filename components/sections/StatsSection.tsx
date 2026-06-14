import { Heart, HandHeart, MapPin, UsersRound } from "lucide-react";
import { stats } from "@/data/stats";
import { Container } from "@/components/ui/Container";
import { MotionReveal } from "@/components/MotionReveal";

const icons = [Heart, HandHeart, MapPin, UsersRound];

export function StatsSection() {
  return (
    <section className="bg-dark-navy py-12 sm:py-14">
      <Container>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = icons[index];
            return (
              <MotionReveal key={stat.label} delay={index * 0.07}>
                <div className="flex flex-col items-center gap-3 bg-dark-navy px-6 py-8 text-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ocean-green/15 ring-1 ring-ocean-green/25">
                    <Icon aria-hidden className="h-5 w-5 text-ocean-green" />
                  </span>
                  <p className="text-xl font-extrabold tracking-tight text-white">{stat.value}</p>
                  <p className="max-w-40 text-sm font-semibold leading-6 text-white/50">{stat.label}</p>
                </div>
              </MotionReveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
