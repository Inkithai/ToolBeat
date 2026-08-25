import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = { name: string; href?: string };

/**
 * Visible breadcrumb trail. The last item is the current page; earlier items
 * are links. Paired with `breadcrumbJsonLd` on the pages that render it, so
 * what crawlers see matches what users see. `Crumb` matches the schema
 * builder's `BreadcrumbItem` on purpose: one shape, shared.
 */
export default function Breadcrumbs({
  items,
  className,
}: {
  items: readonly Crumb[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.name}-${index}`} className="flex items-center gap-1">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="rounded-md px-1.5 py-0.5 text-ink-400 transition-colors hover:bg-white/5 hover:text-indigo-300"
                >
                  {item.name}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={
                    isLast
                      ? "rounded-md bg-white/[0.04] px-1.5 py-0.5 font-medium text-white"
                      : "px-1.5 py-0.5 text-ink-400"
                  }
                >
                  {item.name}
                </span>
              )}
              {!isLast && (
                <ChevronRight className="h-3.5 w-3.5 text-ink-600" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
