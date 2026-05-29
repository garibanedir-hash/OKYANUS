import type { ProjectRegion } from "@/data/projectRegions";
import { cn } from "@/lib/utils";

type ProjectRegionMapProps = {
  regions: ProjectRegion[];
  activeRegionSlug: string;
  onSelect: (slug: ProjectRegion["slug"]) => void;
  compact?: boolean;
};

function Marker({
  region,
  active,
  onSelect
}: {
  region: ProjectRegion;
  active: boolean;
  onSelect: (slug: ProjectRegion["slug"]) => void;
}) {
  const x = (region.mapPosition.x / 100) * 720;
  const y = (region.mapPosition.y / 100) * 420;

  return (
    <g key={region.slug}>
      <line x1={x} y1={y - 24} x2={x} y2={y + 24} stroke={active ? "#0F2547" : "#7E9BA9"} strokeWidth="1" opacity={active ? 0.9 : 0.45} />
      <line x1={x - 24} y1={y} x2={x + 24} y2={y} stroke={active ? "#0F2547" : "#7E9BA9"} strokeWidth="1" opacity={active ? 0.9 : 0.45} />
      <circle cx={x} cy={y} r={active ? 15 : 12} fill="none" stroke={active ? "#1F8083" : "#9EB6C0"} strokeWidth={active ? 2.4 : 1.6} />
      <g
        role="button"
        tabIndex={0}
        aria-label={`${region.name} bölgesini seç`}
        className="cursor-pointer outline-none"
        onClick={() => onSelect(region.slug)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") onSelect(region.slug);
        }}
      >
        <circle cx={x} cy={y} r={active ? 5.8 : 4.8} fill={active ? "#0F2547" : "#1F8083"} />
        <circle cx={x} cy={y} r="23" fill="transparent" />
      </g>
      <text
        x={x + 18}
        y={y - 14}
        fill={active ? "#0F2547" : "#435A68"}
        fontSize={active ? 15 : 12.5}
        fontWeight={active ? 800 : 700}
        letterSpacing="0.2"
      >
        {region.name}
      </text>
      {active ? (
        <text x={x + 18} y={y + 4} fill="#1F8083" fontSize="10.5" fontWeight="700">
          aktif saha hattı
        </text>
      ) : null}
    </g>
  );
}

export function ProjectRegionMap({ regions, activeRegionSlug, onSelect, compact = false }: ProjectRegionMapProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#D7E0E7] bg-white shadow-card">
      <div className="flex flex-col gap-3 border-b border-[#D7E0E7] bg-[#F8FAFB] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-[#1F8083]">Operasyon Haritası</p>
          <h3 className="mt-1 text-lg font-extrabold text-[#0F2547]">Doğu Akdeniz ve Yakın Coğrafya</h3>
        </div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-1 text-xs font-bold text-[#64748B]">
          <span>Aktif bölge: {regions.length}</span>
          <span>Model: Public özet</span>
          <span>Veri: Proje eşleştirme</span>
          <span>Güncelleme: canlı içerik</span>
        </div>
      </div>

      <svg
        viewBox="0 0 720 420"
        role="img"
        aria-label="Gazze, Lübnan, Mısır ve Türkiye çalışma bölgelerini gösteren kurumsal harita"
        className={cn("w-full bg-[#EEF4F6]", compact ? "h-[18rem]" : "h-[26rem]")}
      >
        <defs>
          <pattern id="regionGrid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M48 0H0V48" fill="none" stroke="#D7E3E8" strokeWidth="0.7" />
          </pattern>
          <linearGradient id="landFill" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#FAFCFC" />
            <stop offset="100%" stopColor="#E5EDF1" />
          </linearGradient>
        </defs>

        <rect width="720" height="420" fill="#EEF4F6" />
        <rect width="720" height="420" fill="url(#regionGrid)" opacity="0.62" />

        <path d="M0 120 C84 96 162 101 238 132 C302 158 360 154 438 128 C548 91 636 105 720 145 L720 0 L0 0Z" fill="url(#landFill)" stroke="#B9CCD5" strokeWidth="1.5" />
        <path d="M228 118 C282 86 350 74 426 88 C498 102 552 135 604 151 C559 164 520 187 472 189 C419 192 372 170 326 151 C288 135 252 128 228 118Z" fill="#F7FAFA" stroke="#B9CCD5" strokeWidth="1.4" />
        <path d="M468 179 C515 160 568 170 610 205 C653 241 670 290 650 346 C612 322 568 309 515 316 C465 323 420 350 365 342 C378 286 407 204 468 179Z" fill="#F9FBFB" stroke="#B9CCD5" strokeWidth="1.4" />
        <path d="M350 203 C396 191 434 202 464 231 C431 258 410 298 392 344 C341 330 300 301 276 255 C290 229 315 210 350 203Z" fill="#F9FBFB" stroke="#B9CCD5" strokeWidth="1.4" />
        <path d="M260 154 C285 145 317 149 338 166 C315 184 287 187 257 176 C250 168 251 160 260 154Z" fill="#F9FBFB" stroke="#B9CCD5" strokeWidth="1.2" />

        <path d="M104 286 C184 250 272 246 368 282 C457 315 548 310 634 275" fill="none" stroke="#8CA9B5" strokeWidth="1.2" strokeDasharray="5 10" opacity="0.45" />
        <path d="M118 192 C206 172 294 178 372 210 C446 240 518 241 606 214" fill="none" stroke="#8CA9B5" strokeWidth="1" strokeDasharray="4 12" opacity="0.36" />
        <path d="M482 96 C529 89 579 95 628 119" fill="none" stroke="#6E8996" strokeWidth="1.2" strokeDasharray="6 9" opacity="0.48" />

        <text x="34" y="360" fill="#607887" fontSize="11" fontWeight="700">AKDENİZ OPERASYON HATTI</text>
        <text x="34" y="378" fill="#8AA0AB" fontSize="10" fontWeight="600">Bölge bazlı public proje görünümü</text>
        <text x="585" y="55" fill="#8AA0AB" fontSize="10" fontWeight="700">N</text>
        <path d="M589 70 L599 96 L589 90 L579 96Z" fill="#0F2547" opacity="0.72" />

        {regions.map((region) => (
          <Marker key={region.slug} region={region} active={region.slug === activeRegionSlug} onSelect={onSelect} />
        ))}
      </svg>

      <div className="border-t border-[#D7E0E7] bg-white px-5 py-3 text-xs font-semibold leading-5 text-[#64748B]">
        Harita, operasyon bölgelerini kurumsal bilgi mimarisi içinde göstermek için sadeleştirilmiş görsel temsildir.
      </div>
    </div>
  );
}
