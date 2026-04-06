"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Loader2, MapPin } from "lucide-react";
import { US_CITIES } from "@/lib/cities";
import type { SearchParams, AdType } from "@/types";

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
  injectedKeyword?: string; // set by AI wizard — fills the keyword field
}

export default function SearchForm({ onSearch, isLoading, injectedKeyword }: SearchFormProps) {
  const [keyword, setKeyword] = useState("");
  const [city, setCity] = useState("");
  const [adType, setAdType] = useState<AdType>("search");
  const [cityOpen, setCityOpen] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);

  // When wizard injects a keyword, fill it in
  useEffect(() => {
    if (injectedKeyword) setKeyword(injectedKeyword);
  }, [injectedKeyword]);

  const filteredCities = city.length >= 2
    ? US_CITIES.filter((c) => c.toLowerCase().includes(city.toLowerCase())).slice(0, 8)
    : [];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setCityOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim() || !city.trim()) return;
    onSearch({ keyword: keyword.trim(), city: city.trim(), adType });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Keyword */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Vertical / Keyword
          </label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g. Roofing, Auto Dealer, Insurance..."
            required
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent transition-colors"
          />
        </div>

        {/* City */}
        <div className="relative" ref={cityRef}>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            City, State
          </label>
          <div className="relative">
            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={city}
              onChange={(e) => { setCity(e.target.value); setCityOpen(true); }}
              onFocus={() => setCityOpen(true)}
              placeholder="e.g. Chicago, IL"
              required
              autoComplete="off"
              className="w-full pl-8 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent transition-colors"
            />
          </div>
          {cityOpen && filteredCities.length > 0 && (
            <ul className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
              {filteredCities.map((c) => (
                <li
                  key={c}
                  onMouseDown={() => { setCity(c); setCityOpen(false); }}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <MapPin size={12} className="text-slate-400 shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          )}
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
                {type === "search" ? "Search / PMax" : "Shopping"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !keyword.trim() || !city.trim()}
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
