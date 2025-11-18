import { Card, CardBody, CardFooter, CardHeader } from "@heroui/react";
import type { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  description,
  actions,
  footer,
  children,
  className,
}: ChartCardProps) {
  return (
    <Card
      radius="lg"
      shadow="sm"
      className={[
        "border border-default-200 bg-white/95 backdrop-blur",
        "flex flex-col gap-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <CardHeader className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {description ? (
            <p className="mt-1 text-sm text-foreground-500">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="text-sm text-foreground-500">{actions}</div>
        ) : null}
      </CardHeader>
      <CardBody className="min-h-[280px] flex-1 p-0">{children}</CardBody>
      {footer ? (
        <CardFooter className="border-t border-default-100 pt-3 text-xs text-foreground-500">
          {footer}
        </CardFooter>
      ) : null}
    </Card>
  );
}
