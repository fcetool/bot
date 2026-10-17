import { api } from "sdk";
import {
  isValidUrl,
  SUPPORTED_TARGETS_SET,
  getTargetsList,
} from "../lib/config.js";

export default async function (inlineQuery) {
  const query = (inlineQuery.query || "").trim();
  const results = [];

  if (!query) {
    await api.answerInlineQuery({
      inline_query_id: inlineQuery.id,
      results: [],
      cache_time: 1,
      is_personal: true,
    });
    return;
  }

  const parts = query.split(/\s+/).filter(Boolean);

  // Only URL
  if (parts.length === 1) {
    const url = parts[0];
    if (!isValidUrl(url)) {
      results.push({
        type: "article",
        id: "invalid_url",
        title: "❌ Invalid URL",
        description: "Must start with http:// or https://",
        input_message_content: {
          message_text:
            "❌ *Invalid URL*\n\nUse: `https://example.com/rom.zip boot.img`",
          parse_mode: "Markdown",
        },
      });
    } else {
      results.push({
        type: "article",
        id: "missing_target",
        title: "⚠️ Missing target file",
        description: "Add a target, e.g. boot.img",
        input_message_content: {
          message_text:
            "⚠️ *Missing Target*\n\n" +
            "Usage: `URL target.img`\n\n" +
            "Supported: `" + getTargetsList() + "`",
          parse_mode: "Markdown",
        },
      });
    }
  } else {
    // URL + target
    const url = parts[0];
    const target = parts[1];

    if (!isValidUrl(url)) {
      results.push({
        type: "article",
        id: "bad_url",
        title: "❌ Invalid URL",
        description: "Must start with http:// or https://",
        input_message_content: {
          message_text: "❌ Invalid URL format.",
          parse_mode: "Markdown",
        },
      });
    } else if (!SUPPORTED_TARGETS_SET.has(target)) {
      results.push({
        type: "article",
        id: "bad_target",
        title: "❌ Unsupported: " + target,
        description: "This file is not in the supported list",
        input_message_content: {
          message_text:
            "❌ *Unsupported target:* `" + target + "`\n\n" +
            "Supported: `" + getTargetsList() + "`",
          parse_mode: "Markdown",
        },
      });
    } else {
      results.push({
        type: "article",
        id: "ok_" + target,
        title: "✅ Extract " + target,
        description: "Tap to start extraction",
        input_message_content: {
          message_text:
            "⚙️ *Initializing…*\n" +
            "━━━━━━━━━━━━━━━━━━\n" +
            "🎯 *Target:* `" + target + "`\n" +
            "⏳ Connecting…",
          parse_mode: "Markdown",
        },
        reply_markup: {
          inline_keyboard: [
            [{ text: "⏳ Processing…", callback_data: "none" }],
          ],
        },
      });
    }
  }

  await api.answerInlineQuery({
    inline_query_id: inlineQuery.id,
    results,
    cache_time: 1,
    is_personal: true,
  });
}
