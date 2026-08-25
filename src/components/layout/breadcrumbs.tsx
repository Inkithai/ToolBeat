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
            <li key={item.name} className="flex items-center gap-1">
              {item.href && !isLast ? (
                <Link href={item.href} className="text-ink-200 transition-colors hover:text-indigo-400">
                  {item.name}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className={isLast ? "font-medium text-white" : "text-ink-200"}>
                  {item.name}
                </span>
              )}
              {!isLast && <ChevronRight className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
