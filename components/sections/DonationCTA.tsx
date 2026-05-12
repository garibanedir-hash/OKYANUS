import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function DonationCTA() {
  return (
    <section className="relative overflow-hidden bg-deep-blue py-16 text-white">
      <div className="wave-lines absolute inset-x-0 bottom-0 h-36 opacity-30" />
      <Container>
        <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-mint-green">Bağış Çağrısı</p>
            <h2 className="mt-3 max-w-4xl text-3xl font-bold leading-tight sm:text-4xl">
              Bir iyilik, bazen bir ailenin sofrasına; bazen bir çocuğun defterine; bazen de soğuk bir gecede sıcak bir desteğe dönüşür.
            </h2>
            <p className="mt-4 text-sm font-semibold text-white/78">İyilik Paylaştıkça Okyanusa Dönüşür.</p>
          </div>
          <Button href="/bagis-yap" variant="light" showIcon>
            Şimdi Bağış Yap
          </Button>
        </div>
      </Container>
    </section>
  );
}
