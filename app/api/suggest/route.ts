import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface SuggestResponse {
  success: boolean;
  suggestions?: Array<{ keyword: string; rationale: string }>;
  error?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse<SuggestResponse>> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ success: false, error: "AI not configured" }, { status: 500 });
  }

  let body: { keyword?: string; city?: string; adType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }

  const { keyword = "", city = "", adType = "search" } = body;

  const prompt = `You are a Google Ads expert helping find businesses that run paid PPC campaigns.

The user searched for "${keyword}" in "${city}" but got 0 results for ${adType} ads.

Generate 5 alternative search keyword ideas that are MORE LIKELY to show paid Google ${adType} ads for businesses in that vertical and area.

Rules:
- Focus on commercial keywords businesses actually bid on
- Avoid hyper-local terms that trigger Google Maps/LSA pack instead of text ads
- Think about what a business owner would target: services, solutions, product names
- Vary the intent: some transactional ("hire X"), some informational ("X company"), some branded ("X services")
- Keep keywords short (2-5 words max)

Return ONLY a JSON array with exactly 5 objects. No explanation, no markdown, just raw JSON:
[
  { "keyword": "...", "rationale": "short reason why this gets text ads" },
  ...
]`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";

    // Extract JSON from response (handle potential wrapping)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ success: false, error: "AI returned unexpected format" }, { status: 500 });
    }

    const suggestions = JSON.parse(jsonMatch[0]) as Array<{ keyword: string; rationale: string }>;

    return NextResponse.json({ success: true, suggestions });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "AI request failed" },
      { status: 502 }
    );
  }
}
