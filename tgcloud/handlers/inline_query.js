import { api } from "sdk";
import { isValidUrl, SUPPORTED_TARGETS, getTargetsList } from "../lib/config.js";

export default async function (inlineQuery) {
  const query = (inlineQuery.query || "").trim();
  const results = [];

  if (!query) {
    await api.answerInlineQuery({
      inline_query_id: inlineQuery.id,
      results: [],
      cache_time: 1,
    });
    return;
  }

  const parts = query.split(/\s+/).filter(Boolean);

  // Only URL provided
  if (parts.length === 1) {
    const url = parts[0];

    if (!isValidUrl(url)) {
      results.push({
        type: "article",
        id: "invalid_url",
        title: "❌ Invalid URL",
        description: "Please add http:// or https:// to the beginning",
        input_message_content: {
          message_text:
            "❌ *Invalid URL Format*\n" +
            "━━━━━━━━━━━━━━━━━━\n" +
            "⚠️ Please use format:\n" +
            "`https://example.com/file.zip target.img`\n\n" +
            "📝 Your input: `" + url + "`",
          parse_mode: "Markdown",
        },
      });
    } else {
      results.push({
        type: "article",
        id: "missing_target",
        title: "⚠️ Missing Target File",
        description: "Please specify target file (e.g., boot.img)",
        input_message_content: {
          message_text:
            "⚠️ *Missing Target File*\n" +
            "━━━━━━━━━━━━━━━━━━\n" +
            "📝 Usage: `URL target.img`\n\n" +
            "✅ Supported targets:\n" +
            "`" + getTargetsList() + "`",
          parse_mode: "Markdown",
        },
      });
    }

    await api.answerInlineQuery({
      inline_query_id: inlineQuery.id,
      results,
      cache_time: 1,
    });
    return;
  }

  // URL + Target
  const url = parts[0];
  const target = parts[1];

  if (!isValidUrl(url)) {
    results.push({
      type: "article",
      id: "invalid_url2",
      title: "❌ Invalid URL",
      description: "Please add http:// or https:// to the beginning",
      input_message_content: {
        message_text:
          "❌ *Invalid URL Format*\n" +
          "━━━━━━━━━━━━━━━━━━\n" +
          "⚠️ URL must start with http:// or https://\n\n" +
          "📝 Your input: `" + url + "`",
        parse_mode: "Markdown",
      },
    });
  } else if (!SUPPORTED_TARGETS.has(target)) {
    results.push({
      type: "article",
      id: "unsupported_target",
      title: "❌ Unsupported Target: " + target,
      description: "This target file is not supported",
      input_message_content: {
        message_text:
          "❌ *Unsupported Target*\n" +
          "━━━━━━━━━━━━━━━━━━\n" +
          "⚠️ `" + target + "` is not supported\n\n" +
          "✅ Supported targets:\n" +
          "`" + getTargetsList() + "`",
        parse_mode: "Markdown",
      },
    });
  } else {
    results.push({
      type: "article",
      id: "extract_" + target,
      title: "✅ Extract: " + target,
      description: "Click to start extraction",
      input_message_content: {
        message_text:
          "⚙️ *Initializing Extraction...*\n" +
          "━━━━━━━━━━━━━━━━━━\n" +
          "🎯 *Target:* `" + target + "`\n" +
          "⏳ *Status:* `Connecting to server...`",
        parse_mode: "Markdown",
      },
      reply_markup: {
        inline_keyboard: [
          [{ text: "⏳ Processing...", callback_data: "none" }],
        ],
      },
    });
  }

  await api.answerInlineQuery({
    inline_query_id: inlineQuery.id,
    results,
    cache_time: 1,
  });
}
