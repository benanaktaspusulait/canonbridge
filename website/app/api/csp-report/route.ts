export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await request.json();
  } catch {
    await request.text().catch(() => undefined);
  }

  return new Response(null, { status: 204 });
}
