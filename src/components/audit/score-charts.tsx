"use client";

import {
  Bar,
  BarChart,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RagStatus } from "@/lib/audit/auditTypes";

export interface ChartDimension {
  label: string;
  short: string;
  score: number;
  status: RagStatus;
}

const PRIMARY = "#6366f1";
const STATUS_COLOR: Record<RagStatus, string> = {
  green: "#16a34a",
  yellow: "#ca8a04",
  red: "#dc2626",
};

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ChartDimension }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-md">
      <p className="font-medium">{d.label}</p>
      <p className="text-muted-foreground">{d.score}/100</p>
    </div>
  );
}

/** Radar chart showing the 12-dimension "shape" of the product. */
export function DimensionRadarChart({ data }: { data: ChartDimension[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="hsl(240 6% 90%)" />
        <PolarAngleAxis
          dataKey="short"
          tick={{ fontSize: 11, fill: "hsl(240 4% 46%)" }}
        />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Radar
          dataKey="score"
          stroke={PRIMARY}
          fill={PRIMARY}
          fillOpacity={0.25}
          strokeWidth={2}
        />
        <Tooltip content={<ChartTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

/** Horizontal bar chart with each dimension coloured by its RAG status. */
export function DimensionBarChart({ data }: { data: ChartDimension[] }) {
  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 8, right: 16, top: 4, bottom: 4 }}
      >
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: "hsl(240 4% 46%)" }}
        />
        <YAxis
          type="category"
          dataKey="short"
          width={88}
          tick={{ fontSize: 11, fill: "hsl(222 47% 11%)" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(240 5% 96%)" }} />
        <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={16}>
          {data.map((d) => (
            <Cell key={d.label} fill={STATUS_COLOR[d.status]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
