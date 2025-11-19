import { KpiCard } from "@/components/dashboard/KpiCard";

interface KpiData {
  label: string;
  value: string;
  helper: string;
}

interface KpiSectionProps {
  kpiCards: KpiData[];
}

export function KpiSection({ kpiCards }: KpiSectionProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpiCards.map((kpi) => (
        <KpiCard
          key={kpi.label}
          label={kpi.label}
          value={kpi.value}
          helper={kpi.helper}
        />
      ))}
    </section>
  );
}
