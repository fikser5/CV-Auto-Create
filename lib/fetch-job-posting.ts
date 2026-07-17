import "server-only";
import * as cheerio from "cheerio";

const FETCH_TIMEOUT_MS = 12000;
const MIN_EXTRACTED_LENGTH = 200;
const MAX_EXTRACTED_LENGTH = 20000;

// Blocks obviously-internal targets (loopback/private ranges/link-local) so a
// user-supplied URL can't be used to make the server probe its own network.
// Not exhaustive DNS-rebinding protection — acceptable for a single-user app
// making a best-effort fetch, not a hardened multi-tenant proxy.
function assertPublicHttpUrl(rawUrl: string): URL {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("Podany link jest nieprawidłowy.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Link musi zaczynać się od http:// lub https://.");
  }
  const hostname = url.hostname.toLowerCase();
  const isBlocked =
    hostname === "localhost" ||
    hostname === "0.0.0.0" ||
    hostname.endsWith(".local") ||
    /^127\./.test(hostname) ||
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^169\.254\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname) ||
    hostname === "::1";
  if (isBlocked) {
    throw new Error("Ten link nie jest obsługiwany.");
  }
  return url;
}

function extractReadableText(html: string): string {
  const $ = cheerio.load(html);
  $("script, style, noscript, svg, nav, header, footer, iframe, form, button").remove();

  const bodyText = $("body").text();
  return bodyText
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function fetchJobPostingText(rawUrl: string): Promise<string> {
  const url = assertPublicHttpUrl(rawUrl);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        // Many job boards block requests without a browser-like User-Agent.
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "pl-PL,pl;q=0.9,en;q=0.8",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Pobieranie treści oferty trwało zbyt długo. Wklej treść ręcznie.");
    }
    throw new Error("Nie udało się połączyć z podanym linkiem. Wklej treść ręcznie.");
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw new Error(
      `Podana strona zwróciła błąd (${response.status}). Sprawdź link albo wklej treść ręcznie.`,
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
    throw new Error("Podany link nie prowadzi do strony HTML. Wklej treść ręcznie.");
  }

  const html = await response.text();
  const text = extractReadableText(html).slice(0, MAX_EXTRACTED_LENGTH);

  if (text.length < MIN_EXTRACTED_LENGTH) {
    throw new Error(
      "Nie udało się pobrać wystarczającej treści oferty spod linku (strona może wymagać logowania lub ładować treść dynamicznie). Wklej treść ręcznie.",
    );
  }

  return text;
}
