"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Heart, Clock, Wrench } from "lucide-react";
import { TOOLS } from "@/lib/tools/registry";
import type { ToolDefinition } from "@/lib/tools/types";

/**
 * My Toolbox Feature - Phase 3
 * 
 * Combines favorites, recently used, and frequently used tools into one feature.
 * Uses localStorage for persistence (no account required).
 * 
 * This replaces the simple "Favorites" concept with a more meaningful "Toolbox" metaphor.
 */

// Type for toolbox items
interface ToolboxItem {
  slug: string;
  type: "favorite" | "recent";
  addedAt: number;
  lastUsedAt?: number;
}

// Storage keys
const TOOLBOX_STORAGE_KEY = "toolbeat_toolbox_v1";
const MAX_RECENTS = 5;
const MAX_FAVORITES = 20;

export default function MyToolbox() {
  const [toolboxItems, setToolboxItems] = useState<ToolboxItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load toolbox from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(TOOLBOX_STORAGE_KEY);
    if (saved) {
      try {
        setToolboxItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load toolbox:", e);
      }
    }
  }, []);

  // Save toolbox to localStorage
  useEffect(() => {
    if (toolboxItems.length > 0) {
      localStorage.setItem(TOOLBOX_STORAGE_KEY, JSON.stringify(toolboxItems));
    }
  }, [toolboxItems]);

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

  // Add a tool to toolbox
  const addToToolbox = (slug: string, type: "favorite" | "recent" = "recent") => {
    setToolboxItems(prev => {
      // Check if already in toolbox
      const existingIndex = prev.findIndex(item => item.slug === slug);
      
      if (existingIndex !== -1) {
        // Update existing item
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          type: type === "favorite" ? "favorite" : updated[existingIndex].type,
          lastUsedAt: Date.now()
        };
        return updated;
      }

      // Add new item
      const newItem: ToolboxItem = {
        slug,
        type,
        addedAt: Date.now(),
        lastUsedAt: Date.now()
      };

      // Enforce limits
      let newItems = [...prev, newItem];
      
      // Limit favorites
      const favoriteItems = newItems.filter(item => item.type === "favorite");
      if (favoriteItems.length > MAX_FAVORITES) {
        newItems = newItems.filter(item => 
          item.type !== "favorite" || 
          favoriteItems.findIndex(f => f.slug === item.slug) >= favoriteItems.length - MAX_FAVORITES
        );
      }

      // Limit recents
      const recentItems = newItems.filter(item => item.type === "recent");
      if (recentItems.length > MAX_RECENTS) {
        newItems = newItems.filter(item => 
          item.type !== "recent" || 
          recentItems.findIndex(r => r.slug === item.slug) >= recentItems.length - MAX_RECENTS
        );
      }

      return newItems;
    });
  };

  // Remove from toolbox
  const removeFromToolbox = (slug: string) => {
    setToolboxItems(prev => prev.filter(item => item.slug !== slug));
  };

  // Toggle favorite
  const toggleFavorite = (slug: string) => {
    const existing = toolboxItems.find(item => item.slug === slug);
    if (existing && existing.type === "favorite") {
      removeFromToolbox(slug);
    } else {
      addToToolbox(slug, "favorite");
    }
  };

  // Check if tool is favorite
  const isFavorite = (slug: string) => {
    return toolboxItems.some(item => item.slug === slug && item.type === "favorite");
  };

  // Total count
  const totalCount = toolboxItems.length;

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="hidden items-center gap-2 rounded-lg border border-indigo-400/25 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 transition-colors hover:border-indigo-400/40 hover:bg-indigo-500/15 hover:text-white sm:inline-flex"
        aria-label="Open My Toolbox"
      >
        <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
        My Toolbox
        {totalCount > 0 && (
          <span className="ml-1 rounded-full bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300">
            {totalCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="hidden items-center gap-2 rounded-lg border border-indigo-400/25 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 transition-colors hover:border-indigo-400/40 hover:bg-indigo-500/15 hover:text-white sm:inline-flex"
        aria-label="Open My Toolbox"
      >
        <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
        My Toolbox
        {totalCount > 0 && (
          <span className="ml-1 rounded-full bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300">
            {totalCount}
          </span>
        )}
      </button>

      {/* Toolbox Dropdown */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-navy-950/80 px-4 pt-[15vh] backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="My Toolbox">
          <button className="absolute inset-0 cursor-default" onClick={() => setIsOpen(false)} aria-label="Close My Toolbox" />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-indigo-400/25 bg-navy-900 shadow-2xl shadow-indigo-950/60">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-indigo-300" aria-hidden="true" />
                <h2 className="font-bold text-white">My Toolbox</h2>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className="rounded-md p-1.5 text-ink-400 hover:bg-white/10 hover:text-white" aria-label="Close My Toolbox">
                <span className="text-xl" aria-hidden="true">×</span>
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {/* Favorites */}
              {favoriteTools.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-1.5 px-3 py-2">
                    <Heart className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-ink-500">Favorites</span>
                    <span className="text-xs text-ink-600">({favoriteTools.length})</span>
                  </div>
                  <div className="grid gap-1">
                    {favoriteTools.map(tool => (
                      <Link
                        key={tool.slug}
                        href={tool.href}
                        onClick={() => {
                          addToToolbox(tool.slug, "recent");
                          setIsOpen(false);
                        }}
                        className="group flex items-center justify-between rounded-xl px-3 py-2 hover:bg-indigo-500/10 focus-visible:bg-indigo-500/10"
                      >
                        <div>
                          <span className="block font-semibold text-white">{tool.name}</span>
                          <span className="mt-0.5 block text-xs text-ink-500">{tool.summary}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(tool.slug);
                          }}
                          className="rounded-md p-1.5 text-ink-400 hover:bg-white/10 hover:text-cyan-400 transition-colors"
                          aria-label={isFavorite(tool.slug) ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Heart className={`h-4 w-4 ${isFavorite(tool.slug) ? "fill-cyan-400 text-cyan-400" : "text-ink-400"}`} />
                        </button>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Recently Used */}
              {recentTools.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-1.5 px-3 py-2">
                    <Clock className="h-4 w-4 text-indigo-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-ink-500">Recently Used</span>
                    <span className="text-xs text-ink-600">({recentTools.length})</span>
                  </div>
                  <div className="grid gap-1">
                    {recentTools.map(tool => (
                      <Link
                        key={tool.slug}
                        href={tool.href}
                        onClick={() => {
                          addToToolbox(tool.slug, "recent");
                          setIsOpen(false);
                        }}
                        className="group flex items-center justify-between rounded-xl px-3 py-2 hover:bg-indigo-500/10 focus-visible:bg-indigo-500/10"
                      >
                        <div>
                          <span className="block font-semibold text-white">{tool.name}</span>
                          <span className="mt-0.5 block text-xs text-ink-500">{tool.summary}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(tool.slug);
                          }}
                          className="rounded-md p-1.5 text-ink-400 hover:bg-white/10 hover:text-cyan-400 transition-colors"
                          aria-label={isFavorite(tool.slug) ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Heart className={`h-4 w-4 ${isFavorite(tool.slug) ? "fill-cyan-400 text-cyan-400" : "text-ink-400"}`} />
                        </button>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {favoriteTools.length === 0 && recentTools.length === 0 && (
                <div className="px-3 py-8 text-center">
                  <Wrench className="mx-auto h-12 w-12 text-ink-600" aria-hidden="true" />
                  <p className="mt-4 text-sm text-ink-400">
                    Your Toolbox is empty.
                  </p>
                  <p className="mt-2 text-xs text-ink-500">
                    Start using tools to add them here automatically,
                    or click the heart icon to favorite a tool.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 px-4 py-2">
              <Link
                href="/tools"
                onClick={() => setIsOpen(false)}
                className="text-xs text-indigo-300 hover:text-white"
              >
                Browse all {TOOLS.length} tools →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Utility functions for external use
export const useMyToolbox = () => {
  const [toolboxItems, setToolboxItems] = useState<ToolboxItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(TOOLBOX_STORAGE_KEY);
    if (saved) {
      try {
        setToolboxItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load toolbox:", e);
      }
    }
  }, []);

  const addToToolbox = (slug: string, type: "favorite" | "recent" = "recent") => {
    const saved = localStorage.getItem(TOOLBOX_STORAGE_KEY);
    let items: ToolboxItem[] = saved ? JSON.parse(saved) : [];
    
    const existingIndex = items.findIndex(item => item.slug === slug);
    
    if (existingIndex !== -1) {
      items[existingIndex] = {
        ...items[existingIndex],
        type: type === "favorite" ? "favorite" : items[existingIndex].type,
        lastUsedAt: Date.now()
      };
    } else {
      items.push({
        slug,
        type,
        addedAt: Date.now(),
        lastUsedAt: Date.now()
      });
    }

    // Enforce limits
    if (type === "favorite") {
      const favoriteItems = items.filter(item => item.type === "favorite");
      if (favoriteItems.length > MAX_FAVORITES) {
        items = items.filter(item => 
          item.type !== "favorite" || 
          favoriteItems.findIndex(f => f.slug === item.slug) >= favoriteItems.length - MAX_FAVORITES
        );
      }
    }

    if (type === "recent") {
      const recentItems = items.filter(item => item.type === "recent");
      if (recentItems.length > MAX_RECENTS) {
        items = items.filter(item => 
          item.type !== "recent" || 
          recentItems.findIndex(r => r.slug === item.slug) >= recentItems.length - MAX_RECENTS
        );
      }
    }

    localStorage.setItem(TOOLBOX_STORAGE_KEY, JSON.stringify(items));
    setToolboxItems(items);
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

  return { toolboxItems, addToToolbox, isFavorite };
};
