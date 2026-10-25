import { ogFallback, ogHemicycle } from "@/lib/og";
import { PARTIES } from "@/lib/parties";
import { sql, dbConfigured } from "@/lib/db";
import { viewSummary } from "@/lib/views";
import { isValidShareCode } from "@/lib/share";
import { jsonbObject } from "@/lib/jsonb";

export const dynamic = "force-dynamic";
export { ogSize as size, ogContentType as contentType } from "@/lib/og";

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!isValidShareCode(code) || !dbConfigured()) return ogFallback();
  try {
    const rows = await sql`
      SELECT title, seats FROM shared_predictions WHERE code = ${code}
    `;
    if (rows.length === 0) return ogFallback();
    const title = (rows[0].title as string) || "Predición compartida";
    // JSONB pode chegar coma string ou coma obxecto (según o driver).
    const seats = jsonbObject<Record<string, number>>(rows[0].seats);
    return ogHemicycle({
      title,
      summary: viewSummary(
        { slug: "", key: "", seats, government: {}, allies: {} },
        PARTIES
      ),
      seatMap: seats,
    });
  } catch {
    return ogFallback();
  }
}
