import { hasSession } from "@/lib/auth/server";
import { EXPORTS } from "@/lib/csv/exports";
import { db } from "@/lib/db";
import { loadAll } from "@/lib/db/load";
import { todayISO } from "@/lib/time";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ table: string }> }) {
  if (!(await hasSession())) return new Response("Log in first.", { status: 401 });
  const { table } = await ctx.params;
  const exp = EXPORTS[table];
  if (!exp) return new Response("No such table.", { status: 404 });
  const csv = exp.build(await loadAll(db));
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="dream-planner-${table}-${todayISO()}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
