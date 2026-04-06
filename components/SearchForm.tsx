"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import type { SearchParams, AdType } from "@/types";

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
}

const VERTICAL_SUGGESTIONS = [
  "Plumber",
  "Electrician",
  "HVAC",
  "Roofing",
  "Dentist",
  "Lawyer",
  "Real Estate Agent",
  "Landscaping",
  "Pest Control",
  "Auto Repair",
  "Locksmith",
  "Moving Company",
  "Cleaning Service",
  "Insurance Agent",
  "Financial Advisor",
];

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [keyword, setKeyword] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [adType, setAdType] = useState<AdType>("search");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filtered = keyword.length > 0
    ? VERTICAL_SUGGESTIONS.filter((s) =>
        s.toLowerCase().includes(keyword.toLowerCase())
      )
    : VERTICAL_SUGGESTIONS;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim() || !zipCode.trim()) return;
    onSearch({ keyword: keyword.trim(), zipCode: zipCode.trim(), adType });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Keyword / Vertical */}
        <div className="relative">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Vertical / Keyword
          </label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="e.g. Plumber, Dentist..."
            required
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent transition-colors"
          />
          {showSuggestions && filtered.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
              {filtered.slice(0, 8).map((s) => (
                <li
                  key={s}
                  onMouseDown={() => {
                    setKeyword(s);
                    setShowSuggestions(false);
                  }}
                  className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Zip Code */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            ZIP Code
          </label>
          <input
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
            placeholder="e.g. 90210"
            maxLength={5}
            required
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent transition-colors"
          />
        </div>

        {/* Ad Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Ad Type
          </label>
          <div className="flex rounded-lg border border-slate-300 overflow-hidden">
            {(["search", "shopping"] as AdType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setAdType(type)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                  adType === type
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {type === "search" ? "Search" : "Shopping"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !keyword.trim() || !zipCode.trim()}
        className="flex items-center gap-2 px-6 py-2.5 bg-sky-700 hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
      >
        {isLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Search size={16} />
        )}
        {isLoading ? "Searching..." : "Find PPC Advertisers"}
      </button>
    </form>
  );
}
