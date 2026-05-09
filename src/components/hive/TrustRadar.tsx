import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

export function TrustRadar({ data, size = 260 }: { data: { depth: number; originality: number; communication: number; execution: number; innovation: number }; size?: number }) {
  const rows = [
    { dim: "Depth", v: data.depth },
    { dim: "Originality", v: data.originality },
    { dim: "Communication", v: data.communication },
    { dim: "Execution", v: data.execution },
    { dim: "Innovation", v: data.innovation },
  ];
  return (
    <div style={{ width: "100%", height: size }}>
      <ResponsiveContainer>
        <RadarChart data={rows} outerRadius="78%">
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis dataKey="dim" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar dataKey="v" stroke="hsl(var(--neon-purple))" fill="hsl(var(--neon-purple))" fillOpacity={0.35} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
