import { fetch } from "sdk";
import { API_URL } from "./config.js";

/**
 * Call FCETool API and return result.
 * @returns {{ ok: true, download_url: string, duration_seconds: string|number } | { ok: false, error: string }}
 */
export async function extractFile(url, target) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, target }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 200 && data.download_url) {
      return {
        ok: true,
        download_url: data.download_url,
        duration_seconds: data.duration_seconds ?? data.duration ?? "N/A",
      };
    }

    return {
      ok: false,
      error: data.message || data.error || `API Error (${res.status})`,
    };
  } catch (err) {
    return {
      ok: false,
      error: err.message || String(err),
    };
  }
}
