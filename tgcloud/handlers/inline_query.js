import { api } from "sdk";
import { isValidUrl, SUPPORTED_TARGETS, SUPPORTED_TARGETS_SET } from "../lib/config.js";

const PAGE_SIZE = 50; // Telegram accepts at most 50 inline results per answer.

function extractionResult(target) {
  return {
    type: "article",
    id: "extract:" + target,
    title: "Extract " + target,
    description: "Select to extract this partition from the firmware archive",
    input_message_content: {
      message_text:
        "⚙️ *Preparing extraction…*\n" +
        "━━━━━━━━━━━━━━━━━━\n" +
        "🎯 *Target:* `" + target + "`\n" +
        "⏳ The result will update automatically.",
      parse_mode: "Markdown",
    },
    // Needed for Telegram to include inline_message_id in chosen_inline_result.
    reply_markup: {
      inline_keyboard: [[{ text: "⏳ Extracting…", callback_data: "processing" }]],
    },
  };
}

function noticeResult(id, title, description, messageText) {
  return {
    type: "article",
    id,
    title,
    description,
    input_message_content: { message_text: messageText },
  };
}

function targetPage(offset) {
  const start = Number.isInteger(offset) && offset >= 0 ? offset : 0;
  const targets = SUPPORTED_TARGETS.slice(start, start + PAGE_SIZE);
  return {
    results: targets.map(extractionResult),
    next_offset: start + targets.length < SUPPORTED_TARGETS.length
      ? String(start + targets.length)
      : undefined,
  };
}

export default async function (inlineQuery) {
  const query = (inlineQuery.query || "").trim();
  const parts = query.split(/\s+/).filter(Boolean);
  const offset = Number.parseInt(inlineQuery.offset || "0", 10) || 0;
  let answer;

  if (!query) {
    answer = {
      results: [noticeResult(
        "inline_help",
        "Extract a firmware partition",
        "Enter a firmware ZIP URL; add a target or choose from the full list",
        "Inline extraction usage:\nhttps://example.com/firmware.zip boot.img"
      )],
    };
  } else if (!isValidUrl(parts[0])) {
    answer = {
      results: [noticeResult(
        "invalid_url",
        "Enter a valid firmware URL",
        "Use a direct URL beginning with http:// or https://",
        "Please enter a valid HTTP or HTTPS firmware ZIP URL."
      )],
    };
  } else if (parts.length === 1) {
    // Show every supported target for a URL-only query, using Telegram offsets
    // to fetch page two because the Bot API caps each answer at 50 results.
    answer = targetPage(offset);
  } else if (parts.length === 2 && SUPPORTED_TARGETS_SET.has(parts[1])) {
    answer = { results: [extractionResult(parts[1])] };
  } else if (parts.length === 2) {
    answer = targetPage(offset);
  } else {
    answer = {
      results: [noticeResult(
        "inline_usage",
        "Use URL followed by one target",
        "Example: https://example.com/firmware.zip boot.img",
        "Enter a firmware ZIP URL followed by one partition name, for example:\nhttps://example.com/firmware.zip boot.img"
      )],
    };
  }

  await api.answerInlineQuery({
    inline_query_id: inlineQuery.id,
    results: answer.results,
    ...(answer.next_offset ? { next_offset: answer.next_offset } : {}),
    cache_time: 0,
    is_personal: true,
  });
}
