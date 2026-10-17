import { api } from "sdk";
import {
  isValidUrl,
  SUPPORTED_TARGETS_SET,
  getTargetsList,
  POPULAR_TARGETS,
  targetsKeyboard,
  mainMenuKeyboard,
} from "../lib/config.js";
import { extractFile } from "../lib/extract.js";
import { saveSession, getSession, clearSession } from "../lib/session.js";

export default async function (message) {
  const text = (message.text || "").trim();
  const chatId = message.chat.id;
  const userId = message.from?.id;
  if (!userId) return;

  // ── /start ──────────────────────────────────────────────
  if (text === "/start" || text.startsWith("/start ")) {
    const me = await api.getMe();
    await api.sendMessage({
      chat_id: chatId,
      text:
        "👋 *Welcome to FCETool Bot*\n\n" +
        "Extract any partition file from a remote firmware / ROM ZIP — without downloading the whole archive.\n\n" +
        "Choose an option below, or send a firmware URL to get started.",
      parse_mode: "Markdown",
      disable_web_page_preview: true,
      reply_markup: mainMenuKeyboard(me.username),
    });
    return;
  }

  // ── /help ───────────────────────────────────────────────
  if (text === "/help" || text.startsWith("/help ")) {
    const me = await api.getMe();
    await api.sendMessage({
      chat_id: chatId,
      text:
        "❓ *How to Use*\n\n" +
        "*Method 1 — Buttons (recommended)*\n" +
        "1. Tap *Extract File*\n" +
        "2. Send the firmware ZIP URL\n" +
        "3. Pick the target file from the buttons\n\n" +
        "*Method 2 — Command*\n" +
        "`/extract <URL> <TARGET>`\n" +
        "Example:\n" +
        "`/extract https://example.com/rom.zip boot.img`\n\n" +
        "*Method 3 — Inline*\n" +
        "In any chat type:\n" +
        "`@" + me.username + " <URL> <TARGET>`\n\n" +
        "*Method 4 — Web*\n" +
        "https://offici5l.github.io/fcetool",
      parse_mode: "Markdown",
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [
          [{ text: "📦 Extract File", callback_data: "menu:extract" }],
          [{ text: "« Main Menu", callback_data: "menu:home" }],
        ],
      },
    });
    return;
  }

  // ── /targets ────────────────────────────────────────────
  if (text === "/targets" || text.startsWith("/targets ")) {
    await api.sendMessage({
      chat_id: chatId,
      text:
        "📋 *Supported Target Files*\n\n" +
        "`" + getTargetsList() + "`\n\n" +
        "Send a firmware URL, then pick one of these.",
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "« Main Menu", callback_data: "menu:home" }]],
      },
    });
    return;
  }

  // ── /extract URL TARGET ─────────────────────────────────
  if (text.startsWith("/extract")) {
    const parts = text.split(/\s+/).filter(Boolean);

    if (parts.length < 3) {
      await api.sendMessage({
        chat_id: chatId,
        text:
          "⚠️ *Usage*\n\n" +
          "`/extract <URL> <TARGET>`\n\n" +
          "Or just send a URL and pick the target from the buttons.",
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "📦 Extract File", callback_data: "menu:extract" }],
            [{ text: "📋 Supported Targets", callback_data: "menu:targets" }],
          ],
        },
      });
      return;
    }

    const url = parts[1];
    const target = parts[2];
    await runExtraction(chatId, url, target);
    return;
  }

  // ── Plain URL → save session & show target buttons ──────
  if (isValidUrl(text) && text.split(/\s+/).length === 1) {
    await saveSession(userId, text);

    const keyboard = targetsKeyboard(POPULAR_TARGETS, "t:");
    keyboard.push([{ text: "📑 More Targets…", callback_data: "menu:alltargets" }]);
    keyboard.push([{ text: "❌ Cancel", callback_data: "menu:cancel" }]);

    await api.sendMessage({
      chat_id: chatId,
      text:
        "🔗 *URL received*\n\n" +
        "`" + text + "`\n\n" +
        "Select the file you want to extract:",
      parse_mode: "Markdown",
      disable_web_page_preview: true,
      reply_markup: { inline_keyboard: keyboard },
    });
    return;
  }

  // ── URL + target in one message ─────────────────────────
  {
    const parts = text.split(/\s+/).filter(Boolean);
    if (parts.length >= 2 && isValidUrl(parts[0])) {
      await runExtraction(chatId, parts[0], parts[1]);
      return;
    }
  }

  // ── Unknown text while waiting for URL ──────────────────
  const session = await getSession(userId);
  if (session) {
    await api.sendMessage({
      chat_id: chatId,
      text:
        "⚠️ Please send a valid firmware ZIP URL starting with `http://` or `https://`\n\n" +
        "Or tap Cancel.",
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "❌ Cancel", callback_data: "menu:cancel" }]],
      },
    });
    return;
  }

  // fallback
  await api.sendMessage({
    chat_id: chatId,
    text: "Send a firmware ZIP URL, or use the menu below.",
    reply_markup: mainMenuKeyboard(),
  });
}

/** Shared extraction logic used by /extract and plain messages */
async function runExtraction(chatId, url, target) {
  if (!isValidUrl(url)) {
    await api.sendMessage({
      chat_id: chatId,
      text: "❌ Invalid URL. It must start with `http://` or `https://`",
      parse_mode: "Markdown",
    });
    return;
  }

  if (!SUPPORTED_TARGETS_SET.has(target)) {
    await api.sendMessage({
      chat_id: chatId,
      text:
        "❌ *Unsupported target:* `" + target + "`\n\n" +
        "Use /targets to see the full list.",
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "📋 Supported Targets", callback_data: "menu:targets" }],
        ],
      },
    });
    return;
  }

  const statusMsg = await api.sendMessage({
    chat_id: chatId,
    text:
      "⚙️ *Processing…*\n" +
      "━━━━━━━━━━━━━━━━━━\n" +
      "🎯 *Target:* `" + target + "`\n" +
      "⏳ *Status:* Connecting to server…",
    parse_mode: "Markdown",
  });

  const result = await extractFile(url, target);

  if (result.ok) {
    await api.editMessageText({
      chat_id: chatId,
      message_id: statusMsg.message_id,
      text:
        "✅ *Extraction Completed*\n" +
        "━━━━━━━━━━━━━━━━━━\n" +
        "📂 *File:* `" + target + "`\n" +
        "⏱ *Time:* `" + result.duration_seconds + "s`\n" +
        "━━━━━━━━━━━━━━━━━━\n" +
        "Open source: [fcetool](https://github.com/offici5l/fcetool)\n" +
        "By: [offici5l](https://t.me/Offici5l_Channel)",
      parse_mode: "Markdown",
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [
          [{ text: "📥 Download File", url: result.download_url }],
          [
            { text: "🔄 Extract Another", callback_data: "menu:extract" },
            { text: "« Menu", callback_data: "menu:home" },
          ],
        ],
      },
    });
  } else {
    await api.editMessageText({
      chat_id: chatId,
      message_id: statusMsg.message_id,
      text:
        "❌ *Extraction Failed*\n" +
        "━━━━━━━━━━━━━━━━━━\n" +
        "⚠️ `" + result.error + "`\n\n" +
        "Try again or use the [Web Interface](https://offici5l.github.io/fcetool)",
      parse_mode: "Markdown",
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [
          [{ text: "🔄 Try Again", callback_data: "menu:extract" }],
          [{ text: "« Menu", callback_data: "menu:home" }],
        ],
      },
    });
  }
}
