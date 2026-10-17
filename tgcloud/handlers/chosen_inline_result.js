import { api } from "sdk";
import { isValidUrl, SUPPORTED_TARGETS } from "../lib/config.js";
import { extractFile } from "../lib/extract.js";

export default async function (chosen) {
  const inlineMessageId = chosen.inline_message_id;
  if (!inlineMessageId) return;

  const parts = (chosen.query || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return;

  const url = parts[0];
  const target = parts[1];

  if (!isValidUrl(url) || !SUPPORTED_TARGETS.has(target)) return;

  try {
    await api.editMessageText({
      inline_message_id: inlineMessageId,
      text:
        "⚙️ *Processing...*\n" +
        "━━━━━━━━━━━━━━━━━━\n" +
        "🎯 Target: `" + target + "`\n" +
        "⏳ Status: `Running extraction...`",
      parse_mode: "Markdown",
    });

    const result = await extractFile(url, target);

    if (result.ok) {
      await api.editMessageText({
        inline_message_id: inlineMessageId,
        text:
          "✅ *Extraction Completed*\n" +
          "━━━━━━━━━━━━━━━━━━\n" +
          "📂 *File:* `" + target + "`\n" +
          "🔗 *From:* " + url + "\n" +
          "⏱ *Time:* `" + result.duration_seconds + "s`\n" +
          "━━━━━━━━━━━━━━━━━━\n" +
          "Open source: [fcetool](https://github.com/offici5l/fcetool)\n" +
          "By: [offici5l](https://t.me/Offici5l_Channel)",
        parse_mode: "Markdown",
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [
            [{ text: "📥 Download File", url: result.download_url }],
          ],
        },
      });
    } else {
      await api.editMessageText({
        inline_message_id: inlineMessageId,
        text:
          "❌ *Failed*\n" +
          "━━━━━━━━━━━━━━━━━━\n" +
          "⚠️ Error: `" + result.error + "`",
        parse_mode: "Markdown",
      });
    }
  } catch (err) {
    try {
      await api.editMessageText({
        inline_message_id: inlineMessageId,
        text:
          "❌ *Error Occurred*\n" +
          "━━━━━━━━━━━━━━━━━━\n" +
          "⚠️ `" + (err.message || String(err)) + "`\n\n" +
          "🌐 *Alternative:*\n" +
          "Try the [Web Interface](https://offici5l.github.io/fcetool)",
        parse_mode: "Markdown",
        disable_web_page_preview: false,
      });
    } catch {
      // ignore edit errors
    }
  }
}
