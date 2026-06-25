import Image from "next/image";
import { getActiveSupporters } from "@/data/supporters";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MotionReveal } from "@/components/MotionReveal";

function isValidExternalUrl(url?: string) {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function SupportersStrip() {
  const activeSupporters = getActiveSupporters();

  if (!activeSupporters.length) {
    return null;
  }

  return (
    <section className="bg-warm-white py-14 sm:py-16">
      <Container>
        <MotionReveal>
          <SectionHeading
            eyebrow="Destekçilerimiz"
            title="İyilik yolculuğumuzda yanımızda olan kurumlar"
            description="İyilik yolculuğumuzda yanımızda olan kurum ve paydaşlarımıza teşekkür ederiz."
            align="center"
          />
        </MotionReveal>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {activeSupporters.map((supporter) => {
            const logo = (
              <Image
                src={supporter.logoSrc}
                alt={`${supporter.name} logosu`}
                width={160}
                height={64}
                className="h-12 max-w-[9rem] object-contain grayscale transition duration-200 group-hover:grayscale-0 group-focus-visible:grayscale-0"
                loading="lazy"
              />
            );
            const className =
              "group focus-ring flex min-h-24 items-center justify-center rounded-lg border border-border-soft bg-white px-4 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-card";

            if (isValidExternalUrl(supporter.website)) {
              return (
                <a key={supporter.name} href={supporter.website} target="_blank" rel="noopener noreferrer" className={className}>
                  {logo}
                </a>
              );
            }

            return (
              <div key={supporter.name} className={className}>
                {logo}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
