"use client";

import { Download, ExternalLink, Star } from "lucide-react";
import type { Advertiser } from "@/types";

interface ResultsTableProps {
  advertisers: Advertiser[];
  query: string;
  location: string;
}

function exportToCsv(advertisers: Advertiser[], query: string) {
  const headers = ["Position", "Business Name", "Domain", "Headline", "Description", "Ad Type", "Price", "Rating", "Reviews"];
  const rows = advertisers.map((a) => [
    a.position,
    `"${a.businessName.replace(/"/g, '""')}"`,
    a.domain,
    `"${a.headline.replace(/"/g, '""')}"`,
    `"${a.description.replace(/"/g, '""')}"`,
    a.adType,
    a.price ?? "",
    a.rating ?? "",
    a.reviews ?? "",
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ppc-advertisers-${query.replace(/\s+/g, "-")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ResultsTable({ advertisers, query, location }: ResultsTableProps) {
  if (advertisers.length === 0) return null;

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            {advertisers.length} advertiser{advertisers.length !== 1 ? "s" : ""} found
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Query: <span className="font-medium text-slate-700">"{query}"</span> · <span className="font-medium text-slate-700">{location}</span>
          </p>
        </div>
        <button
          onClick={() => exportToCsv(advertisers, query)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-sm font-medium rounded-lg transition-colors cursor-pointer"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-10">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Business / Domain</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Ad Copy</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-24">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-16">Link</th>
              </tr>
            </thead>
            <tbody>
              {advertisers.map((ad, i) => (
                <tr
                  key={ad.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-3.5 text-slate-400 font-medium">{ad.position}</td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-900">{ad.businessName}</div>
                    <div className="text-slate-400 text-xs mt-0.5">{ad.domain}</div>
                    {ad.rating !== undefined && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={10} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs text-slate-500">{ad.rating} ({ad.reviews?.toLocaleString()})</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5 max-w-xs">
                    <div className="font-medium text-slate-800 line-clamp-1">{ad.headline}</div>
                    {ad.description && (
                      <div className="text-slate-500 text-xs mt-0.5 line-clamp-2">{ad.description}</div>
                    )}
                    {ad.price && (
                      <div className="text-sky-700 font-semibold text-xs mt-0.5">{ad.price}</div>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      ad.adType === "search"
                        ? "bg-sky-50 text-sky-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}>
                      {ad.adType}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {ad.displayUrl && (
                      <a
                        href={ad.displayUrl.startsWith("http") ? ad.displayUrl : `https://${ad.displayUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-sky-600 transition-colors cursor-pointer"
                        title="Open website"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
