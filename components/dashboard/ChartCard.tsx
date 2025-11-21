import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

interface ChartCardProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  span?: string;
}

export function ChartCard({
  title,
  description,
  actions,
  footer,
  children,
  className,
  span,
}: ChartCardProps) {
  return (
    <Card
      title={title}
      description={description}
      actions={actions}
      footer={footer}
      className={["relative", className].filter(Boolean).join(" ")}
      span={span}
    >
      {children}
    </Card>
  );
}
