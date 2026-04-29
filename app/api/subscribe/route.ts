import { NextResponse } from 'next/server';

/**
 * Stub newsletter subscription endpoint.
 *
 * Logs the email server-side so nothing is lost during launch. Replace
 * with a real ESP call (Resend / Buttondown / ConvertKit) once the
 * funnel work begins.
 */
export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const email = (payload as { email?: unknown })?.email;
  if (typeof email !== 'string') {
    return NextResponse.json({ error: 'missing_email' }, { status: 400 });
  }

  const trimmed = email.trim().toLowerCase();
  if (trimmed.length < 5 || trimmed.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }

  console.log('[newsletter] subscribe', { email: trimmed, ts: new Date().toISOString() });

  return NextResponse.json({ ok: true });
}
