import Image from "next/image";
import { getActiveSupporters } from "@/data/supporters";
import { Container } from "@/components/ui/Container";
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

  const marqueeCopies = Array.from({ length: 6 }, (_, copyIndex) => ({ copyIndex, supporters: activeSupporters }));

  return (
    <section className="border-t border-border-soft bg-warm-white py-8 sm:py-10">
      <Container>
        <MotionReveal>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] lg:items-center">
            <div className="max-w-xl">
              <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-dark-navy sm:text-base">Destekçilerimiz</h2>
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                İyilik yolculuğumuzda yanımızda olan kurum ve paydaşlarımıza teşekkür ederiz.
              </p>
            </div>

            <div className="relative min-w-0 overflow-hidden py-3 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
              <div className="supporters-marquee-track flex w-max items-center gap-12 motion-reduce:w-auto motion-reduce:flex-wrap motion-reduce:justify-center">
                {marqueeCopies.map(({ copyIndex, supporters }) =>
                  supporters.map((supporter) => {
                    const isDuplicate = copyIndex > 0;
                    const logo = (
                      <Image
                        src={supporter.logoSrc}
                        alt={`${supporter.name} logosu`}
                        width={220}
                        height={110}
                        className="h-16 w-auto max-w-[12rem] object-contain opacity-70 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0 group-focus-visible:opacity-100 group-focus-visible:grayscale-0 sm:h-20 sm:max-w-[14rem]"
                        loading="lazy"
                      />
                    );
                    const className =
                      "group focus-ring inline-flex min-h-20 min-w-36 shrink-0 items-center justify-center rounded-lg px-3 py-2 transition hover:-translate-y-0.5 motion-reduce:min-w-0 sm:min-w-44";

                    if (isValidExternalUrl(supporter.website)) {
                      return (
                        <a
                          key={`${supporter.name}-${copyIndex}`}
                          href={supporter.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${supporter.name} web sitesini aç`}
                          aria-hidden={isDuplicate ? true : undefined}
                          tabIndex={isDuplicate ? -1 : undefined}
                          className={`${className} ${isDuplicate ? "motion-reduce:hidden" : ""}`}
                        >
                          {logo}
                        </a>
                      );
                    }

                    return (
                      <div
                        key={`${supporter.name}-${copyIndex}`}
                        aria-label={supporter.name}
                        aria-hidden={isDuplicate ? true : undefined}
                        className={`${className} ${isDuplicate ? "motion-reduce:hidden" : ""}`}
                      >
                        {logo}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </MotionReveal>
      </Container>

      <style>{`
        @keyframes supporters-marquee {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(-50%, 0, 0);
          }
        }

        .supporters-marquee-track {
          animation: supporters-marquee 42s linear infinite;
        }

        .supporters-marquee-track:hover,
        .supporters-marquee-track:focus-within {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .supporters-marquee-track {
            animation: none;
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}
