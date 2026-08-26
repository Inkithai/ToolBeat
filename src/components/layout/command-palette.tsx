"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, X } from "lucide-react";
import { CATEGORIES } from "@/constants/app";
import { TOOLS, getToolBySlug } from "@/lib/tools/registry";
import { searchTools } from "@/lib/tools/search";
import { isConversionTool } from "@/lib/tools/types";
import { useRecentSlugs } from "@/lib/storage/tool-activity";
import {
  COMMAND_PALETTE_EVENT,
  type CommandPaletteDetail,
} from "@/lib/command-palette";

type PaletteItem = {
  id: string;
  href: string;
  title: string;
  subtitle: string;
  group: string;
};

const POPULAR_SLUGS = [
  "json-formatter",
  "word-counter",
  "uuid-generator",
  "base64-encoder",
  "percentage-calculator",
  "png-to-jpg",
];

function toolTitle(slug: string, fallback: string): string {
  const tool = getToolBySlug(slug);
  if (!tool) return fallback;
  return isConversionTool(tool)
    ? `${tool.conversion.fromFormat} → ${tool.conversion.toFormat}`
    : tool.name;
}

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [recentSlugs] = useRecentSlugs();

  const items = useMemo<PaletteItem[]>(() => {
    if (!query.trim()) {
      const recents: PaletteItem[] = recentSlugs.slice(0, 4).flatMap((slug) => {
        const tool = getToolBySlug(slug);
        if (!tool) return [];
        return [
          {
            id: `recent-${tool.slug}`,
            href: tool.href,
            title: toolTitle(tool.slug, tool.name),
            subtitle: tool.summary,
            group: "Recently used",
          },
        ];
      });

      const popular: PaletteItem[] = POPULAR_SLUGS.flatMap((slug) => {
        const tool = getToolBySlug(slug);
        if (!tool) return [];
        return [
          {
            id: `popular-${tool.slug}`,
            href: tool.href,
            title: toolTitle(tool.slug, tool.name),
            subtitle: tool.summary,
            group: "Popular",
          },
        ];
      });

      const categories: PaletteItem[] = CATEGORIES.map((category) => ({
        id: `cat-${category.key}`,
        href: `/tools?category=${category.key}`,
        title: category.label,
        subtitle: category.verbs,
        group: "Explore",
      }));

      return [...recents, ...popular, ...categories];
    }

    const matches = searchTools(TOOLS, query).slice(0, 10);
    return matches.map((tool) => ({
      id: tool.slug,
      href: tool.href,
      title: isConversionTool(tool)
        ? `${tool.conversion.fromFormat} → ${tool.conversion.toFormat}`
        : tool.name,
      subtitle: tool.summary,
      group: CATEGORIES.find((category) => category.key === tool.category)?.label ?? tool.category,
    }));
  }, [query, recentSlugs]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  const go = useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [close, router],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<CommandPaletteDetail>).detail;
      setQuery(detail?.query ?? "");
      setActive(0);
      setOpen(true);
    };
    window.addEventListener(COMMAND_PALETTE_EVENT, onOpen);
    return () => window.removeEventListener(COMMAND_PALETTE_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = previous;
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const node = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    node?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  if (!open) return null;

  const groups = items.reduce<Array<{ name: string; start: number; items: PaletteItem[] }>>(
    (acc, item, index) => {
      const last = acc[acc.length - 1];
      if (last && last.name === item.group) {
        last.items.push(item);
      } else {
        acc.push({ name: item.group, start: index, items: [item] });
      }
      return acc;
    },
    [],
  );

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center bg-navy-950/80 px-4 pt-[10vh] backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Search ConvertLab"
    >
      <button className="absolute inset-0 cursor-default" onClick={close} aria-label="Close search" />
      <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-white/12 bg-navy-900 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.85)]">
        <form
          className="flex items-center gap-3 border-b border-white/10 px-4"
          onSubmit={(event) => {
            event.preventDefault();
            const current = items[active];
            if (current) go(current.href);
            else if (query.trim()) go(`/tools?search=${encodeURIComponent(query)}`);
          }}
        >
          <Search className="h-5 w-5 text-indigo-300" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                close();
              } else if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive((index) => Math.min(items.length - 1, index + 1));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((index) => Math.max(0, index - 1));
              }
            }}
            placeholder="What do you need to get done?"
            className="h-14 flex-1 bg-transparent text-base text-white outline-none placeholder:text-ink-500"
            aria-label="Search tools"
            aria-autocomplete="list"
            aria-controls="command-palette-results"
            aria-activedescendant={items[active] ? `palette-${items[active].id}` : undefined}
            autoComplete="off"
          />
          <button
            type="button"
            onClick={close}
            className="rounded-md p-1.5 text-ink-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close command palette"
          >
            <X className="h-4 w-4" />
          </button>
        </form>

        <div id="command-palette-results" ref={listRef} className="max-h-[58vh] overflow-y-auto p-2" role="listbox">
          {items.length ? (
            groups.map((group) => (
              <div key={group.name} className="mb-1">
                <p className="meta px-3 pb-1 pt-2 text-ink-500">{group.name}</p>
                {group.items.map((item, offset) => {
                  const index = group.start + offset;
                  const selected = index === active;
                  return (
                    <button
                      key={item.id}
                      id={`palette-${item.id}`}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      data-index={index}
                      onMouseEnter={() => setActive(index)}
                      onClick={() => go(item.href)}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                        selected ? "bg-indigo-500/15" : "hover:bg-white/[0.04]"
                      }`}
                    >
                      <span>
                        <span className="block font-semibold text-white">{item.title}</span>
                        <span className="mt-0.5 block text-xs text-ink-500">{item.subtitle}</span>
                      </span>
                      <ArrowRight
                        className={`h-4 w-4 shrink-0 ${selected ? "text-indigo-300" : "text-ink-600"}`}
                        aria-hidden="true"
                      />
                    </button>
                  );
                })}
              </div>
            ))
          ) : (
            <p className="px-3 py-10 text-center text-sm text-ink-400">No matching tools</p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-white/10 px-4 py-2 text-[11px] text-ink-500">
          <span>
            <kbd className="text-ink-300">↵</kbd> open · <kbd className="text-ink-300">Esc</kbd> close
          </span>
          <span className="font-mono">{TOOLS.length} tools indexed</span>
        </div>
      </div>
    </div>
  );
}
