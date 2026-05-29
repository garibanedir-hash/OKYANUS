import type { ProjectActivityStatus, ProjectActivityVisibility } from "@/data/projectActivityMock";
import { projectActivityStatusLabels, projectActivityVisibilityLabels } from "@/data/projectActivityMock";
import { cn } from "@/lib/utils";

export function ProjectActivityStatusBadge({ status }: { status: ProjectActivityStatus }) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full px-2.5 py-1 text-[0.7rem] font-extrabold",
        status === "completed" && "bg-mint-green text-dark-navy",
        status === "in_progress" && "bg-soft-blue text-deep-blue",
        status === "planned" && "bg-primary-blue/10 text-deep-blue",
        status === "draft" && "bg-soft-gray text-ink-muted",
        status === "cancelled" && "bg-warm-accent/15 text-dark-navy",
        status === "archived" && "bg-border-soft text-ink-muted"
      )}
    >
      {projectActivityStatusLabels[status] ?? status}
    </span>
  );
}

export function ProjectActivityVisibilityBadge({ visibility }: { visibility: ProjectActivityVisibility }) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full px-2.5 py-1 text-[0.7rem] font-extrabold",
        visibility === "public" ? "bg-ocean-green/15 text-dark-navy" : "bg-soft-gray text-ink-muted"
      )}
    >
      {projectActivityVisibilityLabels[visibility] ?? visibility}
    </span>
  );
}
