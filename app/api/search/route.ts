import { NextRequest, NextResponse } from "next/server";
import type { Advertiser, SearchResponse } from "@/types";

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const SERPAPI_BASE = "https://serpapi.com/search";

function extractDomain(url: string): string {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url.split("/")[0].replace(/^www\./, "");
  }
}

function parseTextAds(results: Record<string, unknown>[]): Advertiser[] {
  return results.map((ad, index) => {
    const displayLink = String(ad.displayed_link ?? ad.link ?? "");
    const trackingLink = String(ad.tracking_link ?? ad.link ?? "");
    const title = String(ad.title ?? "");
    const description = String(
      (ad.description as string) ??
        ((ad.extensions as string[]) ?? [])[0] ??
        ""
    );

    return {
      id: `search-${index}`,
      businessName: title.split(" - ")[0] ?? title,
      domain: extractDomain(displayLink || trackingLink),
      displayUrl: displayLink || trackingLink,
      headline: title,
      description,
      adType: "search" as const,
      position: index + 1,
    };
  });
}


function parseShoppingAds(results: Record<string, unknown>[]): Advertiser[] {
  return results.map((item, index) => {
    const link = String(item.link ?? "");
    const source = String(item.source ?? "");
    const title = String(item.title ?? "");
    const price = String(item.price ?? "");
    const rating = Number(item.rating ?? 0);
    const reviews = Number(item.reviews ?? 0);

    return {
      id: `shopping-${index}`,
      businessName: source || extractDomain(link),
      domain: extractDomain(link),
      displayUrl: link,
      headline: title,
      description: "",
      adType: "shopping" as const,
      position: index + 1,
      price,
      rating: rating || undefined,
      reviews: reviews || undefined,
    };
  });
}

export async function POST(req: NextRequest): Promise<NextResponse<SearchResponse>> {
  if (!SERPAPI_KEY) {
    return NextResponse.json({ success: false, error: "SerpAPI key not configured" }, { status: 500 });
  }

  let body: { keyword?: string; zipCode?: string; adType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }

  const { keyword, zipCode, adType } = body;

  if (!keyword || !zipCode) {
    return NextResponse.json({ success: false, error: "keyword and zipCode are required" }, { status: 400 });
  }

  // Use keyword only in query — location handles the geo targeting
  // "best" prefix helps trigger more commercial ad results
  const query = `best ${keyword}`;
  const location = `${zipCode}, United States`;

  const params = new URLSearchParams({
    api_key: SERPAPI_KEY,
    q: query,
    location,
    hl: "en",
    gl: "us",
    num: "10",
  });

  if (adType === "shopping") {
    params.set("engine", "google_shopping");
  } else {
    params.set("engine", "google");
  }

  const url = `${SERPAPI_BASE}?${params.toString()}`;

  let serpData: Record<string, unknown>;
  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({ success: false, error: `SerpAPI error: ${errorText}` }, { status: 502 });
    }
    serpData = await res.json() as Record<string, unknown>;
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to fetch ads" },
      { status: 502 }
    );
  }

  let advertisers: Advertiser[] = [];

  if (adType === "shopping") {
    const items = (serpData.shopping_results as Record<string, unknown>[] | undefined) ?? [];
    advertisers = parseShoppingAds(items);
  } else {
    // Regular text ads only (LSAs excluded — not manageable via standard Google Ads)
    const textAds = (serpData.ads as Record<string, unknown>[] | undefined) ?? [];
    advertisers = parseTextAds(textAds);
  }

  return NextResponse.json({
    success: true,
    data: advertisers,
    query: `${keyword} near ${zipCode}`,
    location: zipCode,
    total: advertisers.length,
  });
}
