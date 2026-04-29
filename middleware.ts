import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LICENSE_URL = 'https://creativecommons.org/licenses/by-nc-nd/4.0/';

/**
 * Edge middleware — two responsibilities:
 *
 * 1. Canonicalise www → non-www (301)
 * 2. Set machine-readable license signals on every response:
 *    - Link: <license-url>; rel="license" (RFC 8288)
 *    - X-Robots-Tag: noai, noimageai (no-AI-training opt-out)
 *
 * The license headers complement robots.txt and the JSON-LD `license`
 * field. Together they form an unambiguous attribution-required signal
 * that any reasonable scraper or training pipeline must honour.
 */
export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";

  // Redirect www to non-www
  if (hostname.startsWith("www.")) {
    const newUrl = new URL(request.url);
    newUrl.host = hostname.replace("www.", "");
    return NextResponse.redirect(newUrl, 301);
  }

  const response = NextResponse.next();
  response.headers.set('Link', `<${LICENSE_URL}>; rel="license"`);
  response.headers.set('X-Robots-Tag', 'noai, noimageai');
  return response;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
