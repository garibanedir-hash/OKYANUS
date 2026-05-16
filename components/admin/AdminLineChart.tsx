"use client";

import { useSyncExternalStore } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { DailyDonationPoint } from "@/data/adminAnalyticsMock";

export function AdminLineChart({ data }: { data: DailyDonationPoint[] }) {
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );

  if (!mounted) {
    return <div className="h-64 w-full rounded-lg bg-soft-gray" aria-hidden />;
  }

  return (
    <div className="h-64 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 12, top: 12, bottom: 0 }}>
          <defs>
            <linearGradient id="donationAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary-blue)" stopOpacity={0.32} />
              <stop offset="95%" stopColor="var(--color-primary-blue)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="donationCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-ocean-green)" stopOpacity={0.24} />
              <stop offset="95%" stopColor="var(--color-ocean-green)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--color-border-soft)" strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fill: "var(--color-ink-muted)", fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis yAxisId="amount" tick={{ fill: "var(--color-ink-muted)", fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis yAxisId="count" orientation="right" tick={{ fill: "var(--color-ink-muted)", fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: 16,
              borderColor: "var(--color-border-soft)",
              color: "var(--color-dark-navy)"
            }}
          />
          <Legend />
          <Area yAxisId="amount" type="monotone" dataKey="amount" name="Bağış tutarı" stroke="var(--color-primary-blue)" fill="url(#donationAmount)" strokeWidth={3} />
          <Area yAxisId="count" type="monotone" dataKey="count" name="Bağış adedi" stroke="var(--color-ocean-green)" fill="url(#donationCount)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
