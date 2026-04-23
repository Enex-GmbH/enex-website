import { neon } from "@neondatabase/serverless";

type Row = { maintenance_enabled: boolean };

let cache: { value: boolean; at: number } | null = null;
const TTL_MS = 8000;

/**
 * Edge-safe maintenance flag read (no Pool). Used by middleware only.
 * Short TTL to avoid stale reads after admin toggles.
 */
export async function getMaintenanceEnabledEdge(): Promise<boolean> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return false;
  }

  const now = Date.now();
  if (cache && now - cache.at < TTL_MS) {
    return cache.value;
  }

  try {
    const sql = neon(url);
    const rows = (await sql`
      SELECT maintenance_enabled
      FROM app_settings
      WHERE id = 1
      LIMIT 1
    `) as Row[];

    const value = Boolean(rows[0]?.maintenance_enabled);
    cache = { value, at: now };
    return value;
  } catch {
    return false;
  }
}
