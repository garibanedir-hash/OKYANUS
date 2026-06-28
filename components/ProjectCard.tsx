import { Button } from "@/components/ui/Button";
import { getProjectRegionBySlug } from "@/data/projectRegions";
import { resolveDonationTarget } from "@/lib/donations/donationTarget";
import type { DonationPublicConfig } from "@/lib/donations/donationTarget";

export function ProjectCard({
  slug,
  title,
  category,
  description,
  visualTone,
  regionSlug,
  regionName,
  coverImageUrl,
  thumbnailUrl,
  status,
  compact = false,
  donationConfig
}: {
  slug?: string;
  title: string;
  category: string;
  description: string;
  goal: number;
  raised: number;
  visualTone: string;
  regionSlug?: string;
  regionName?: string;
  coverImageUrl?: string;
  thumbnailUrl?: string;
  status?: string;
  activityCount?: number;
  compact?: boolean;
  donationConfig?: DonationPublicConfig;
}) {
  const regionCoverImageUrl = getProjectRegionBySlug(regionSlug)?.coverImageUrl;
  const imageUrl = thumbnailUrl || coverImageUrl || regionCoverImageUrl;
  const onlineDonationHref = slug ? `/bagis-yap?proje=${slug}` : "/bagis-yap";
  const donationTarget = donationConfig
    ? resolveDonationTarget(donationConfig, { source: "project", projectTitle: title }, onlineDonationHref)
    : {
        href: onlineDonationHref,
        isExternal: false
      };

  return (
    <article className="overflow-hidden rounded-brand border border-border-soft bg-white shadow-card transition hover:-translate-y-1 hover:shadow-soft">
      <div className={`${compact ? "h-32" : "h-44"} relative overflow-hidden border-b border-[#D7E0E7] bg-[#EEF4F6]`}>
        {imageUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url("${imageUrl}")` }}
            aria-hidden
          />
        ) : (
          <>
            <div className={`absolute inset-0 bg-gradient-to-br ${visualTone} opacity-80`} />
            <div className="absolute left-5 top-5 flex h-12 w-12 items-center justify-center rounded-lg border border-white/55 bg-white/50 text-[#0F2547] backdrop-blur-sm">
              <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.8]">
                <path d="M4 19.5V8.8L12 4l8 4.8v10.7" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 20v-7h8v7M9 9.5h.01M15 9.5h.01" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </>
        )}
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,37,71,0.30)_0%,rgba(15,37,71,0.06)_46%,rgba(255,255,255,0.38)_100%)]" />
        <div className="absolute inset-x-5 bottom-5">
          <div className="h-px bg-white/70" />
          <p className="mt-3 text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-[#0F2547]/75">
            {regionName ? `${regionName} / ${category}` : category}
          </p>
        </div>
      </div>
      <div className="h-1 bg-[#1F8083]" />
      <div className={compact ? "p-4" : "p-6"}>
        <div className="mb-3 flex flex-wrap gap-2">
          {regionName ? (
            <span className="rounded-md bg-[#EEF4F6] px-2.5 py-1 text-[0.68rem] font-extrabold text-[#0F2547]">
              {regionName}
            </span>
          ) : null}
          {status ? (
            <span className="rounded-md border border-[#D7E0E7] bg-white px-2.5 py-1 text-[0.68rem] font-extrabold text-[#526574]">
              {status}
            </span>
          ) : null}
        </div>
        <h3 className="text-xl font-bold text-dark-navy">{title}</h3>
        <p className={`${compact ? "min-h-16" : "min-h-20"} mt-3 text-[0.95rem] leading-7 text-slate-600`}>{description}</p>
        <div className="mt-5 rounded-md border border-[#D7E0E7] bg-[#F8FBFA] px-3 py-3 text-[0.95rem] font-semibold leading-7 text-[#526574]">
          Faaliyet bilgileri doğrulanan içeriklerle güncellenecektir.
        </div>
        <Button href={slug ? `/projeler/${slug}` : "/projeler"} variant="ghost" className="mt-6 w-full rounded-md" showIcon>
          Projeyi İncele
        </Button>
        {compact ? null : (
          <Button
            href={donationTarget.href}
            target={donationTarget.isExternal ? "_blank" : undefined}
            rel={donationTarget.isExternal ? "noopener noreferrer" : undefined}
            className="mt-3 w-full rounded-md"
            showIcon
          >
            Projeye Destek Ol
          </Button>
        )}
      </div>
    </article>
  );
}
