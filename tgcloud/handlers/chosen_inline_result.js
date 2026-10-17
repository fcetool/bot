import { api } from "sdk";
import { isValidUrl, SUPPORTED_TARGETS_SET } from "../lib/config.js";
import { extractFile } from "../lib/extract.js";

export default async function (chosen) {
  const inlineMessageId = chosen.inline_message_id;
  if (!inlineMessageId) {
    console.error("Inline result has no inline_message_id. Enable Inline Feedback in BotFather.");
    return;
  }

  const parts = (chosen.query || "").trim().split(/\s+/).filter(Boolean);
  const url = parts[0];
  const selectedTarget = (chosen.result_id || "").startsWith("extract:")
    ? chosen.result_id.slice("extract:".length)
    : parts[1];

  if (!isValidUrl(url) || !SUPPORTED_TARGETS_SET.has(selectedTarget)) {
    console.error("Inline result contained an invalid URL or unsupported target.");
    return;
  }

  let result;
  try {
    result = await extractFile(url, selectedTarget);
  } catch (error) {
    console.error("Unexpected extraction error:", error);
    result = { ok: false, error: "An unexpected error occurred while extracting this file." };
  }

  const replyMarkup = result.ok
    ? {
        inline_keyboard: [[{ text: "📥 Download file", url: result.download_url }]],
      }
    : {
        inline_keyboard: [[{
          text: "↻ Try again",
          switch_inline_query_current_chat: url + " " + selectedTarget,
        }]],
      };

  const messageText = result.ok
    ? "✅ *Extraction completed*\n" +
      "━━━━━━━━━━━━━━━━━━\n" +
      "📂 *File:* `" + selectedTarget + "`\n" +
      "⏱ *Time:* `" + result.duration_seconds + "s`\n\n" +
      "Your file is ready to download."
    : "❌ Extraction failed\n" +
      "━━━━━━━━━━━━━━━━━━\n" +
      result.error + "\n\n" +
      "Tap Try again to rerun it in inline mode.";

  try {
    await api.editMessageText({
      inline_message_id: inlineMessageId,
      text: messageText,
      ...(result.ok ? { parse_mode: "Markdown" } : {}),
      disable_web_page_preview: true,
      reply_markup: replyMarkup,
    });
  } catch (error) {
    console.error("Unable to update the selected inline result:", error);
  }
}
