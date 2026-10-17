import { fetch } from "sdk";
import { API_URL, isValidUrl, SUPPORTED_TARGETS_SET } from "./config.js";

const REQUEST_TIMEOUT_MS = 45_000;
const TEMPORARY_ERROR = "The extraction service is temporarily unavailable. Please try again shortly.";

function normalizeDuration(value) {
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds >= 0 ? Number(seconds.toFixed(2)) : "N/A";
}

/**
 * Call FCETool API and return a safe, user-friendly result.
 * @returns {{ ok: true, download_url: string, duration_seconds: string|number } | { ok: false, error: string }}
 */
export async function extractFile(url, target) {
  if (!isValidUrl(url)) return { ok: false, error: "Please provide a valid HTTP or HTTPS URL." };
  if (!SUPPORTED_TARGETS_SET.has(target)) return { ok: false, error: "That partition file is not supported." };

  let controller;
  let timeout;
  try {
    // Some serverless runtimes do not expose AbortController. Keep extraction
    // functional there, and use a bounded request when abort support exists.
    if (typeof AbortController === "function") {
      controller = new AbortController();
      timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    }

    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, target }),
    };
    if (controller) options.signal = controller.signal;

    const res = await fetch(API_URL, options);
    const data = await res.json().catch(() => ({}));

    if (res.ok && isValidUrl(data?.download_url)) {
      return {
        ok: true,
        download_url: data.download_url,
        duration_seconds: normalizeDuration(data.duration_seconds ?? data.duration),
      };
    }

    if (res.status === 400 || res.status === 404 || res.status === 422) {
      return {
        ok: false,
        error: "The archive or requested partition could not be found. Check the URL and try again.",
      };
    }

    return { ok: false, error: TEMPORARY_ERROR };
  } catch (error) {
    if (error?.name === "AbortError") {
      return { ok: false, error: "This extraction took too long. Please try again." };
    }
    return { ok: false, error: TEMPORARY_ERROR };
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
