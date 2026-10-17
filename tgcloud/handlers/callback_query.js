import { api } from "sdk";
import {
  isValidUrl,
  SUPPORTED_TARGETS,
  SUPPORTED_TARGETS_SET,
  POPULAR_TARGETS,
  targetsKeyboard,
  mainMenuKeyboard,
  getTargetsList,
} from "../lib/config.js";
import { extractFile } from "../lib/extract.js";
import { getSession, clearSession, saveSession } from "../lib/session.js";

export default async function (cq) {
  const data = cq.data || "";
  const chatId = cq.message?.chat?.id;
  const messageId = cq.message?.message_id;
  const userId = cq.from?.id;

  if (!chatId || !userId) {
    await api.answerCallbackQuery({ callback_query_id: cq.id });
    return;
  }

  // Always answer the callback to remove the loading spinner
  await api.answerCallbackQuery({ callback_query_id: cq.id });

  // ── Main menu ───────────────────────────────────────────
  if (data === "menu:home") {
    const me = await api.getMe();
    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
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

  // ── Start extract flow ──────────────────────────────────
  if (data === "menu:extract") {
    await clearSession(userId);
    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text:
        "📦 *Extract File*\n\n" +
        "Send the direct download URL of the firmware ZIP.\n\n" +
        "Example:\n" +
        "`https://example.com/firmware.zip`",
      parse_mode: "Markdown",
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [[{ text: "« Cancel", callback_data: "menu:home" }]],
      },
    });
    // Mark that we are waiting for a URL (empty url placeholder)
    await saveSession(userId, "");
    return;
  }

  // ── Cancel ──────────────────────────────────────────────
  if (data === "menu:cancel") {
    await clearSession(userId);
    const me = await api.getMe();
    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text: "❌ Cancelled.\n\nBack to the main menu.",
      reply_markup: mainMenuKeyboard(me.username),
    });
    return;
  }

  // ── Help ────────────────────────────────────────────────
  if (data === "menu:help") {
    const me = await api.getMe();
    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text:
        "❓ *How to Use*\n\n" +
        "*Method 1 — Buttons (recommended)*\n" +
        "1. Tap *Extract File*\n" +
        "2. Send the firmware ZIP URL\n" +
        "3. Pick the target file from the buttons\n\n" +
        "*Method 2 — Command*\n" +
        "`/extract <URL> <TARGET>`\n\n" +
        "*Method 3 — Inline*\n" +
        "`@" + me.username + " <URL> <TARGET>`\n\n" +
        "*Method 4 — Just paste a URL*\n" +
        "Send any firmware link and the bot will ask which file to extract.",
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

  // ── Targets list (text) ─────────────────────────────────
  if (data === "menu:targets") {
    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text:
        "📋 *Supported Target Files*\n\n" +
        "`" + getTargetsList() + "`",
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "📦 Extract File", callback_data: "menu:extract" }],
          [{ text: "« Main Menu", callback_data: "menu:home" }],
        ],
      },
    });
    return;
  }

  // ── All targets as buttons ──────────────────────────────
  if (data === "menu:alltargets") {
    const session = await getSession(userId);
    if (!session || !session.url) {
      await api.editMessageText({
        chat_id: chatId,
        message_id: messageId,
        text: "⚠️ Session expired. Please send the firmware URL again.",
        reply_markup: {
          inline_keyboard: [[{ text: "📦 Extract File", callback_data: "menu:extract" }]],
        },
      });
      return;
    }

    const keyboard = targetsKeyboard(SUPPORTED_TARGETS, "t:");
    keyboard.push([{ text: "« Popular only", callback_data: "menu:popular" }]);
    keyboard.push([{ text: "❌ Cancel", callback_data: "menu:cancel" }]);

    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text:
        "📑 *All Supported Targets*\n\n" +
        "Select the file to extract:",
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: keyboard },
    });
    return;
  }

  // ── Back to popular targets ─────────────────────────────
  if (data === "menu:popular") {
    const session = await getSession(userId);
    if (!session || !session.url) {
      await api.editMessageText({
        chat_id: chatId,
        message_id: messageId,
        text: "⚠️ Session expired. Please send the firmware URL again.",
        reply_markup: {
          inline_keyboard: [[{ text: "📦 Extract File", callback_data: "menu:extract" }]],
        },
      });
      return;
    }

    const keyboard = targetsKeyboard(POPULAR_TARGETS, "t:");
    keyboard.push([{ text: "📑 More Targets…", callback_data: "menu:alltargets" }]);
    keyboard.push([{ text: "❌ Cancel", callback_data: "menu:cancel" }]);

    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text:
        "🔗 *URL ready*\n\n" +
        "Select the file you want to extract:",
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: keyboard },
    });
    return;
  }

  // ── Target selected (t:boot.img) ────────────────────────
  if (data.startsWith("t:")) {
    const target = data.slice(2);

    if (!SUPPORTED_TARGETS_SET.has(target)) {
      return;
    }

    const session = await getSession(userId);
    if (!session || !session.url || !isValidUrl(session.url)) {
      await api.editMessageText({
        chat_id: chatId,
        message_id: messageId,
        text: "⚠️ Session expired. Please send the firmware URL again.",
        reply_markup: {
          inline_keyboard: [[{ text: "📦 Extract File", callback_data: "menu:extract" }]],
        },
      });
      return;
    }

    const url = session.url;
    await clearSession(userId);

    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
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
        message_id: messageId,
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
        message_id: messageId,
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
}
