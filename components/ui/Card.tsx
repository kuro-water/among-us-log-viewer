import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
  // Tailwind grid span classes such as 'lg:col-span-12' — helpful for layout
  span?: string;
}

export function Card({
  title,
  description,
  actions,
  footer,
  children,
  className,
  span,
}: CardProps) {
  const classes = [
    "rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur",
    "flex flex-col gap-4",
    span,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes} data-testid="card">
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            {title ? (
              <h3 className="text-base font-semibold text-slate-900">
                {title}
              </h3>
            ) : null}
            {description ? (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            ) : null}
          </div>
          {actions ? (
            <div className="text-sm text-slate-500">{actions}</div>
          ) : null}
        </header>
      )}

      <div className="min-h-[280px] flex-1">{children}</div>

      {footer ? (
        <footer className="border-t border-slate-100 pt-3 text-xs text-slate-500">
          {footer}
        </footer>
      ) : null}
    </section>
  );
}
