import { JWT } from "google-auth-library";

/* Shared Google Sheets plumbing for the RSVP and guestbook functions.
   Lives outside netlify/functions so Netlify doesn't publish it as an endpoint. */

export type SheetsContext = {
  sheetId: string;
  headers: Record<string, string>;
};

/** Returns null when the Google env vars aren't set, so callers can no-op quietly. */
export async function getSheetsContext(): Promise<SheetsContext | null> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!sheetId || !serviceAccountEmail || !privateKey) return null;

  const auth = new JWT({
    email: serviceAccountEmail,
    key: privateKey.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const { token } = await auth.getAccessToken();

  return {
    sheetId,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  };
}

const api = (sheetId: string, path: string) =>
  `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}${path}`;

async function createTab({ sheetId, headers }: SheetsContext, tab: string) {
  const res = await fetch(api(sheetId, ":batchUpdate"), {
    method: "POST",
    headers,
    body: JSON.stringify({ requests: [{ addSheet: { properties: { title: tab } } }] }),
  });
  if (!res.ok) throw new Error(`Sheets tab creation failed: ${res.status} ${await res.text()}`);
}

/**
 * Reads column A of a tab, creating the tab first if it doesn't exist yet.
 * A fresh spreadsheet only has "Sheet1", so without this the very first write
 * would fail and the response would be silently lost.
 */
export async function readColumnA(ctx: SheetsContext, tab: string): Promise<string[][]> {
  const url = api(ctx.sheetId, `/values/${encodeURIComponent(tab)}!A:A`);
  let res = await fetch(url, { headers: ctx.headers });

  if (res.status === 400) {
    await createTab(ctx, tab);
    res = await fetch(url, { headers: ctx.headers });
  }
  if (!res.ok) throw new Error(`Sheets read failed: ${res.status} ${await res.text()}`);

  const { values }: { values?: string[][] } = await res.json();
  return values ?? [];
}

/** Writes a header row, but only when the tab is still completely empty. */
export async function writeHeaderIfEmpty(
  ctx: SheetsContext, tab: string, existingRows: string[][], header: string[],
) {
  if (existingRows.length > 0) return;
  const lastCol = colLetter(header.length);
  const res = await fetch(
    api(ctx.sheetId, `/values/${encodeURIComponent(tab)}!A1:${lastCol}1?valueInputOption=USER_ENTERED`),
    { method: "PUT", headers: ctx.headers, body: JSON.stringify({ values: [header] }) },
  );
  if (!res.ok) throw new Error(`Sheets header write failed: ${res.status} ${await res.text()}`);
}

export async function appendRow(ctx: SheetsContext, tab: string, values: (string | number)[]) {
  const lastCol = colLetter(values.length);
  const res = await fetch(
    api(ctx.sheetId, `/values/${encodeURIComponent(tab)}!A:${lastCol}:append?valueInputOption=USER_ENTERED`),
    { method: "POST", headers: ctx.headers, body: JSON.stringify({ values: [values] }) },
  );
  if (!res.ok) throw new Error(`Sheets append failed: ${res.status} ${await res.text()}`);
}

export async function updateRow(
  ctx: SheetsContext, tab: string, rowNumber: number, values: (string | number)[],
) {
  const lastCol = colLetter(values.length);
  const res = await fetch(
    api(ctx.sheetId, `/values/${encodeURIComponent(tab)}!A${rowNumber}:${lastCol}${rowNumber}?valueInputOption=USER_ENTERED`),
    { method: "PUT", headers: ctx.headers, body: JSON.stringify({ values: [values] }) },
  );
  if (!res.ok) throw new Error(`Sheets update failed: ${res.status} ${await res.text()}`);
}

/** 1 -> "A", 10 -> "J". Column counts here stay well inside a single letter. */
function colLetter(count: number): string {
  return String.fromCharCode(64 + count);
}
