import { UsersRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function VolunteerCTA() {
  return (
    <section className="bg-soft-gray py-16">
      <Container>
        <div className="ocean-card relative grid items-center gap-8 overflow-hidden rounded-[1.75rem] p-7 shadow-card md:grid-cols-[auto_1fr_auto] md:p-9">
          <div className="wave-lines absolute inset-x-0 bottom-0 h-24 opacity-40" />
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-mint-green text-ocean-green">
            <UsersRound aria-hidden className="h-8 w-8" />
          </div>
          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ocean-green">Gönüllü Ol</p>
            <h2 className="mt-2 text-2xl font-bold text-dark-navy">İyilik yolculuğunda emeğine de yer var.</h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              Vaktin, emeğin, bilgin ve duaların da bu iyilik yolculuğunun bir parçası olabilir.
            </p>
          </div>
          <Button href="/gonullu-ol" className="relative" showIcon>
            Gönüllü Başvurusu Yap
          </Button>
        </div>
      </Container>
    </section>
  );
}
