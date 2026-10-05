import Editor from "@/components/Editor";
import { getSessionUser } from "@/lib/auth";
import { sql, dbConfigured } from "@/lib/db";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ cargar?: string }>;
}) {
  const user = await getSessionUser();
  const { cargar } = await searchParams;

  let initialSeats: Record<string, number> | null = null;
  let editingId: number | null = null;
  let initialTitle: string | undefined;

  // Cargar unha predición gardada na nube no editor (?cargar=<id>)
  if (cargar && user && dbConfigured()) {
    const id = Number(cargar);
    if (Number.isInteger(id)) {
      const { rows: preds } =
        await sql`SELECT id, title FROM predictions WHERE id = ${id} AND user_id = ${user.id}`;
      if (preds.length > 0) {
        const { rows: seats } =
          await sql`SELECT party_id, seats FROM prediction_seats WHERE prediction_id = ${id}`;
        initialSeats = Object.fromEntries(
          seats.map((r) => [r.party_id as string, r.seats as number])
        );
        editingId = id;
        initialTitle = preds[0].title as string;
      }
    }
  }

  return (
    <Editor
      user={user ? { name: user.name } : null}
      initialSeats={initialSeats}
      editingId={editingId}
      initialTitle={initialTitle}
    />
  );
}
