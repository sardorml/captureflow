"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const AXIS = { fill: "var(--cf-fg-subtle)", fontSize: 12 } as const;
const GRID = "var(--cf-line-strong)";
const ACCENT = "var(--cf-accent-bg)";
const SUCCESS = "var(--success)";

const TOOLTIP = {
  contentStyle: {
    background: "var(--cf-panel-2)",
    border: "1px solid var(--cf-line-strong)",
    borderRadius: 10,
    color: "var(--cf-fg)",
    fontSize: 12,
    boxShadow: "0 8px 24px rgb(0 0 0 / 0.35)",
  },
  labelStyle: {
    color: "var(--cf-fg-strong)",
    fontWeight: 600,
    marginBottom: 4,
  },
  cursor: { fill: "var(--cf-tint)" },
} as const;

const LEGEND = {
  iconType: "circle" as const,
  iconSize: 8,
  wrapperStyle: { fontSize: 12, color: "var(--cf-fg-muted)", paddingTop: 8 },
};

function AccentGradient({ id, color }: { id: string; color: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity={1} />
        <stop offset="100%" stopColor={color} stopOpacity={0.45} />
      </linearGradient>
    </defs>
  );
}

export function SignupsChart({
  data,
}: {
  data: { week: string; signups: number; total: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart
        data={data}
        margin={{ top: 8, right: 4, left: -16, bottom: 0 }}
      >
        <AccentGradient id="signups" color={ACCENT} />
        <CartesianGrid vertical={false} stroke={GRID} strokeDasharray="3 3" />
        <XAxis
          dataKey="week"
          tick={AXIS}
          tickLine={false}
          axisLine={false}
          interval={0}
        />
        <YAxis
          yAxisId="week"
          allowDecimals={false}
          tick={AXIS}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="total"
          orientation="right"
          allowDecimals={false}
          tick={AXIS}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip {...TOOLTIP} />
        <Legend {...LEGEND} />
        <Bar
          yAxisId="week"
          dataKey="signups"
          name="New signups"
          fill="url(#signups)"
          radius={[6, 6, 0, 0]}
          maxBarSize={44}
        />
        <Line
          yAxisId="total"
          dataKey="total"
          name="Total users"
          type="monotone"
          stroke={SUCCESS}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function UploadsChart({
  data,
}: {
  data: { week: string; recordings: number; screenshots: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
        <AccentGradient id="recordings" color={ACCENT} />
        <AccentGradient id="screenshots" color={SUCCESS} />
        <CartesianGrid vertical={false} stroke={GRID} strokeDasharray="3 3" />
        <XAxis
          dataKey="week"
          tick={AXIS}
          tickLine={false}
          axisLine={false}
          interval={0}
        />
        <YAxis
          allowDecimals={false}
          tick={AXIS}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip {...TOOLTIP} />
        <Legend {...LEGEND} />
        <Bar
          dataKey="recordings"
          name="Recordings"
          stackId="uploads"
          fill="url(#recordings)"
          radius={[3, 3, 0, 0]}
          maxBarSize={40}
        />
        <Bar
          dataKey="screenshots"
          name="Screenshots"
          stackId="uploads"
          fill="url(#screenshots)"
          radius={[3, 3, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
