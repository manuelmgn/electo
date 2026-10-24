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

  // Cargar unha predición gardada na nube no editor (?cargar=<id>).
  // Unha soa consulta: predición (título) e escaños co JOIN.
  if (cargar && user && dbConfigured()) {
    const id = Number(cargar);
    if (Number.isInteger(id)) {
      const rows = await sql`
        SELECT p.title, ps.party_id, ps.seats
        FROM predictions p
        LEFT JOIN prediction_seats ps ON ps.prediction_id = p.id
        WHERE p.id = ${id} AND p.user_id = ${user.id}
      `;
      if (rows.length > 0) {
        initialSeats = Object.fromEntries(
          rows
            .filter((r) => r.party_id !== null)
            .map((r) => [r.party_id as string, r.seats as number])
        );
        editingId = id;
        initialTitle = rows[0].title as string;
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
