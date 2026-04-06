"use client";

import { useState } from "react";
import { Target } from "lucide-react";
import SearchForm from "@/components/SearchForm";
import ResultsTable from "@/components/ResultsTable";
import QueryWizard from "@/components/QueryWizard";
import type { Advertiser, SearchParams } from "@/types";

interface SearchState {
  advertisers: Advertiser[];
  query: string;
  location: string;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchState | null>(null);
  const [lastSearch, setLastSearch] = useState<SearchParams | null>(null);

  async function handleSearch(params: SearchParams) {
    setIsLoading(true);
    setError(null);
    setLastSearch(params);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: params.keyword, city: params.city, adType: params.adType }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setResults(null);
      } else {
        setResults({
          advertisers: data.data ?? [],
          query: data.query ?? params.keyword,
          location: data.location ?? params.city,
        });
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleWizardApply(keyword: string) {
    if (!lastSearch) return;
    const newParams = { ...lastSearch, keyword };
    handleSearch(newParams);
  }

  const showWizard =
    !isLoading &&
    !error &&
    results !== null &&
    results.advertisers.length === 0 &&
    lastSearch !== null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-sky-600 flex items-center justify-center">
            <Target size={14} className="text-white" />
          </div>
          <span className="text-white font-semibold text-sm">PPC Marketer Finder</span>
          <span className="ml-auto text-slate-500 text-xs">Powered by SerpAPI + Claude AI</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Find Businesses Running PPC Ads</h1>
          <p className="text-slate-500 mt-1.5 text-sm max-w-xl">
            Enter a vertical and city to discover who's spending money on Google ads in that area — build your outreach list in seconds.
          </p>
        </div>

        {/* Search card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Results with data */}
        {results && results.advertisers.length > 0 && !error && (
          <ResultsTable
            advertisers={results.advertisers}
            query={results.query}
            location={results.location}
          />
        )}

        {/* No results + AI wizard */}
        {showWizard && (
          <>
            <div className="mt-8 text-center py-10 bg-white rounded-xl border border-slate-200">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-slate-600 font-medium">No paid ads found</p>
              <p className="text-slate-400 text-sm mt-1">
                "{lastSearch!.keyword}" in {lastSearch!.city} didn't return text ads
              </p>
            </div>
            <QueryWizard lastSearch={lastSearch!} onApply={handleWizardApply} />
          </>
        )}

        {/* Empty state before any search */}
        {!results && !error && !isLoading && (
          <div className="mt-10 text-center py-16">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Target size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm">Fill in the form above to start finding advertisers</p>
          </div>
        )}
      </main>
    </div>
  );
}
