"use client";

import { useState } from "react";
import { Sparkles, Loader2, ArrowRight, RotateCcw } from "lucide-react";
import type { SearchParams } from "@/types";

interface Suggestion {
  keyword: string;
  rationale: string;
}

interface QueryWizardProps {
  lastSearch: SearchParams | null;
  onApply: (keyword: string) => void;
  isLoading?: boolean;
}

export default function QueryWizard({ lastSearch, onApply, isLoading: searchLoading }: QueryWizardProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  async function generate() {
    if (!lastSearch) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: lastSearch.keyword,
          city: lastSearch.city,
          adType: lastSearch.adType,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error ?? "Something went wrong");
      } else {
        setSuggestions(data.suggestions ?? []);
        setHasGenerated(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-6 bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
          <Sparkles size={15} className="text-violet-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">AI Query Wizard</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {lastSearch
              ? <>Based on <span className="font-medium text-slate-700">"{lastSearch.keyword}"</span> in <span className="font-medium text-slate-700">{lastSearch.city}</span> — generate smarter search terms</>
              : "Run a search first, then let AI suggest better keyword variations"
            }
          </p>
        </div>
        {hasGenerated && (
          <button
            onClick={generate}
            disabled={isLoading}
            className="ml-auto flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw size={12} />
            Regenerate
          </button>
        )}
      </div>

      <div className="px-6 py-5">
        {/* Initial state */}
        {!hasGenerated && !isLoading && (
          <div className="flex items-center gap-4">
            <p className="text-sm text-slate-500 flex-1">
              {lastSearch
                ? "Claude will suggest keyword variations more likely to show Search / PMax ads."
                : "Run a search above first, then use the wizard to get AI-powered keyword suggestions."
              }
            </p>
            <button
              onClick={generate}
              disabled={!lastSearch || searchLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <Sparkles size={14} />
              Generate suggestions
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center gap-3 py-2">
            <Loader2 size={16} className="animate-spin text-violet-500" />
            <span className="text-sm text-slate-500">Claude is thinking...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Suggestions */}
        {hasGenerated && !isLoading && suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-slate-400 mb-3">Click a suggestion to search it</p>
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => onApply(s.keyword)}
                className="w-full flex items-center justify-between gap-4 px-4 py-3 rounded-lg border border-slate-200 hover:border-violet-300 hover:bg-violet-50 text-left transition-colors cursor-pointer group"
              >
                <div>
                  <span className="text-sm font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">
                    {s.keyword}
                  </span>
                  <span className="text-xs text-slate-400 ml-3">{s.rationale}</span>
                </div>
                <ArrowRight size={14} className="text-slate-300 group-hover:text-violet-500 shrink-0 transition-colors" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
