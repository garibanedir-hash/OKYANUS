"use client";

import { useSyncExternalStore } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TopCampaign } from "@/data/adminAnalyticsMock";

export function AdminBarChart({ data }: { data: TopCampaign[] }) {
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );

  if (!mounted) {
    return <div className="h-72 w-full rounded-2xl bg-soft-gray" aria-hidden />;
  }

  return (
    <div className="h-72 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 24, right: 12, top: 8, bottom: 8 }}>
          <CartesianGrid stroke="var(--color-border-soft)" strokeDasharray="3 3" />
          <XAxis type="number" tick={{ fill: "var(--color-ink-muted)", fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis dataKey="name" type="category" width={118} tick={{ fill: "var(--color-ink-muted)", fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: 16,
              borderColor: "var(--color-border-soft)",
              color: "var(--color-dark-navy)"
            }}
          />
          <Bar dataKey="amount" name="Toplanan miktar" fill="var(--color-primary-blue)" radius={[0, 8, 8, 0]} />
          <Bar dataKey="supporters" name="Destekçi sayısı" fill="var(--color-ocean-green)" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
