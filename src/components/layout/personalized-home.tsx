"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Clock, Heart, Wrench, ArrowRight } from "lucide-react";
import { TOOLS } from "@/lib/tools/registry";
import type { ToolDefinition } from "@/lib/tools/types";

/**
 * Personalized Homepage Component - Phase 4
 * 
 * Shows personalized content for returning users:
 * - My Toolbox (favorites)
 * - Recently Used tools
 * - Continue where you left off
 */

// Type for toolbox items (matches my-toolbox component)
interface ToolboxItem {
  slug: string;
  type: "favorite" | "recent";
  addedAt: number;
  lastUsedAt?: number;
}

const TOOLBOX_STORAGE_KEY = "toolbeat_toolbox_v1";

export default function PersonalizedHome() {
  const [toolboxItems, setToolboxItems] = useState<ToolboxItem[]>([]);
  const [hasVisitedBefore, setHasVisitedBefore] = useState(false);

  // Load toolbox from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(TOOLBOX_STORAGE_KEY);
    let loadedCount = 0;
    if (saved) {
      try {
        const items = JSON.parse(saved) as ToolboxItem[];
        setToolboxItems(items);
        loadedCount = items.length;
      } catch (e) {
        console.error("Failed to load toolbox:", e);
      }
    }
    
    // Also check for any previous visit
    const hasVisited = localStorage.getItem("toolbeat_visited");
    if (hasVisited || loadedCount > 0) {
      setHasVisitedBefore(true);
    }
  }, []);

  // Mark as visited
  useEffect(() => {
    localStorage.setItem("toolbeat_visited", "true");
  }, []);

  // Get tools from toolbox items
  const getToolsFromItems = (items: ToolboxItem[]): ToolDefinition[] => {
    return items
      .map(item => TOOLS.find(t => t.slug === item.slug))
      .filter((tool): tool is ToolDefinition => tool !== undefined);
  };

  // Separate favorites and recents
  const favorites = toolboxItems.filter(item => item.type === "favorite");
  const recents = toolboxItems.filter(item => item.type === "recent");

  // Get tool objects
  const favoriteTools = getToolsFromItems(favorites);
  const recentTools = getToolsFromItems(recents);

  // Don't show if no personalization data
  if (!hasVisitedBefore || (favoriteTools.length === 0 && recentTools.length === 0)) {
    return null;
  }

  return (
    <section className="relative border-t border-white/[0.05] px-4 py-16 sm:px-6 sm:py-20" aria-label="Welcome back">
      <div className="relative mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
            Welcome back
          </p>
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Continue where you left off
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-400">
            Your recently used tools and favorites are ready. Pick up right where you stopped.
          </p>
        </div>

        {/* Personalized Content Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* My Toolbox Card */}
          {(favoriteTools.length > 0 || recentTools.length > 0) && (
            <div className="surface-raised relative overflow-hidden rounded-2xl border border-white/[0.08] p-6">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] to-cyan-500/[0.03]" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <Wrench className="h-5 w-5 text-indigo-400" />
                  <h3 className="font-bold text-white">My Toolbox</h3>
                </div>
                
                {/* Favorites */}
                {favoriteTools.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Heart className="h-4 w-4 text-cyan-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                        Favorites ({favoriteTools.length})
                      </span>
                    </div>
                    <div className="space-y-2">
                      {favoriteTools.slice(0, 3).map(tool => (
                        <Link
                          key={tool.slug}
                          href={tool.href}
                          className="group flex items-center gap-2 rounded-lg p-2 text-sm hover:bg-indigo-500/10 transition-colors"
                        >
                          <span className="text-ink-400 group-hover:text-indigo-300">★</span>
                          <span className="text-ink-200 group-hover:text-white">{tool.name}</span>
                        </Link>
                      ))}
                      {favoriteTools.length > 3 && (
                        <Link
                          href="/tools"
                          className="text-xs text-indigo-300 hover:text-cyan-300"
                        >
                          +{favoriteTools.length - 3} more favorites
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {/* Recently Used */}
                {recentTools.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Clock className="h-4 w-4 text-indigo-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                        Recently Used ({recentTools.length})
                      </span>
                    </div>
                    <div className="space-y-2">
                      {recentTools.slice(0, 3).map(tool => (
                        <Link
                          key={tool.slug}
                          href={tool.href}
                          className="group flex items-center gap-2 rounded-lg p-2 text-sm hover:bg-indigo-500/10 transition-colors"
                        >
                          <span className="text-ink-600 group-hover:text-indigo-300">⏱</span>
                          <span className="text-ink-200 group-hover:text-white">{tool.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div className="mt-4 pt-4 border-t border-white/[0.08]">
                  <Link
                    href="/tools"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-300 hover:text-cyan-300 transition-colors"
                  >
                    View all tools
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Quick Access Cards */}
          <div className="surface relative overflow-hidden rounded-2xl border border-white/[0.08] p-6">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/[0.05] to-indigo-500/[0.03]" />
            <div className="relative">
              <h3 className="font-bold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Convert a file", href: "/conversion/png-to-jpg" },
                  { label: "Format JSON", href: "/tools/json-formatter" },
                  { label: "Count words", href: "/tools/word-counter" },
                  { label: "Generate password", href: "/tools/password-generator" },
                ].map((action, index) => (
                  <Link
                    key={index}
                    href={action.href}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-white/[0.03] px-3 py-2 text-xs font-semibold text-ink-200 hover:bg-indigo-500/10 hover:text-white transition-colors"
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="surface relative overflow-hidden rounded-2xl border border-white/[0.08] p-6">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] to-purple-500/[0.03]" />
            <div className="relative">
              <h3 className="font-bold text-white mb-4">Your Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-indigo-300">{favoriteTools.length}</p>
                  <p className="text-xs text-ink-500">Favorites</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-indigo-300">{recentTools.length}</p>
                  <p className="text-xs text-ink-500">Recents</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-indigo-300">{TOOLS.length}</p>
                  <p className="text-xs text-ink-500">Total Tools</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-indigo-300">100%</p>
                  <p className="text-xs text-ink-500">Browser-based</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Hook for tracking tool usage
export function useTrackToolUsage() {
  const trackUsage = (slug: string) => {
    const saved = localStorage.getItem(TOOLBOX_STORAGE_KEY);
    let items: ToolboxItem[] = saved ? JSON.parse(saved) : [];
    
    // Check if already exists
    const existingIndex = items.findIndex(item => item.slug === slug);
    
    if (existingIndex !== -1) {
      // Update existing - move to front and update timestamp
      items[existingIndex] = {
        ...items[existingIndex],
        type: items[existingIndex].type, // Keep existing type
        lastUsedAt: Date.now()
      };
      // Move to front
      const [updatedItem] = items.splice(existingIndex, 1);
      items.unshift(updatedItem);
    } else {
      // Add new recent item
      const newItem: ToolboxItem = {
        slug,
        type: "recent",
        addedAt: Date.now(),
        lastUsedAt: Date.now()
      };
      items.unshift(newItem);
    }

    // Limit recents to 5
    const recentItems = items.filter(item => item.type === "recent");
    if (recentItems.length > 5) {
      items = items.filter(item => 
        item.type !== "recent" || 
        recentItems.indexOf(item) < 5
      );
    }

    localStorage.setItem(TOOLBOX_STORAGE_KEY, JSON.stringify(items));
  };

  const addFavorite = (slug: string) => {
    const saved = localStorage.getItem(TOOLBOX_STORAGE_KEY);
    const items: ToolboxItem[] = saved ? JSON.parse(saved) : [];
    
    // Check if already exists
    const existingIndex = items.findIndex(item => item.slug === slug);
    
    if (existingIndex !== -1) {
      // Toggle type
      items[existingIndex] = {
        ...items[existingIndex],
        type: items[existingIndex].type === "favorite" ? "recent" : "favorite"
      };
    } else {
      // Add new favorite
      const newItem: ToolboxItem = {
        slug,
        type: "favorite",
        addedAt: Date.now(),
        lastUsedAt: Date.now()
      };
      items.push(newItem);
    }

    localStorage.setItem(TOOLBOX_STORAGE_KEY, JSON.stringify(items));
  };

  const isFavorite = (slug: string) => {
    const saved = localStorage.getItem(TOOLBOX_STORAGE_KEY);
    if (!saved) return false;
    try {
      const items: ToolboxItem[] = JSON.parse(saved);
      return items.some(item => item.slug === slug && item.type === "favorite");
    } catch {
      return false;
    }
  };

  return { trackUsage, addFavorite, isFavorite };
}
