import { api } from "sdk";
import { isValidUrl, SUPPORTED_TARGETS, getTargetsList } from "../lib/config.js";
import { extractFile } from "../lib/extract.js";

export default async function (message) {
  const text = (message.text || "").trim();
  const chatId = message.chat.id;

  // /start or /help
  if (
    text === "/start" ||
    text === "/help" ||
    text.startsWith("/start ") ||
    text.startsWith("/help ")
  ) {
    const me = await api.getMe();
    const botUsername = me.username;

    const welcome =
      "👋 *Welcome to Fcetool Bot!*\n\n" +
      "I can extract specific files (like `boot.img`) from firmware/ROM (`.zip`) URLs directly.\n\n" +
      "🛠 *How to use:*\n\n" +
      "1️⃣ *Direct Command:*\n" +
      "`/extract <URL> <TARGET>`\n\n" +
      "2️⃣ *Inline Mode:*\n" +
      "Type in any chat:\n" +
      "`@" + botUsername + " <URL> <TARGET>`\n\n" +
      "3️⃣ *Web Interface:*\n" +
      "[offici5l.github.io/fcetool](https://offici5l.github.io/fcetool)\n\n" +
      "✅ *Supported Targets:*\n" +
      "`" + getTargetsList() + "`\n\n" +
      "Open Source: [github](https://github.com/offici5l/fcetool)\n" +
      "By: [offici5l](https://t.me/Offici5l_Channel)";

    await api.sendMessage({
      chat_id: chatId,
      text: welcome,
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    });
    return;
  }

  // /extract
  if (text.startsWith("/extract")) {
    const parts = text.split(/\s+/).filter(Boolean);

    if (parts.length < 3) {
      await api.sendMessage({
        chat_id: chatId,
        text:
          "⚠️ *Usage:*\n" +
          "`/extract URL TARGET`\n\n" +
          "✅ *Supported targets:*\n" +
          "`" + getTargetsList() + "`",
        parse_mode: "Markdown",
      });
      return;
    }

    const url = parts[1];
    const target = parts[2];

    if (!isValidUrl(url)) {
      await api.sendMessage({
        chat_id: chatId,
        text: "❌ Invalid URL. Please start with `http://` or `https://`",
        parse_mode: "Markdown",
      });
      return;
    }

    if (!SUPPORTED_TARGETS.has(target)) {
      await api.sendMessage({
        chat_id: chatId,
        text:
          "❌ *Unsupported Target*\n" +
          "⚠️ `" + target + "` is not supported\n" +
          "✅ *Supported:* `" + getTargetsList() + "`",
        parse_mode: "Markdown",
      });
      return;
    }

    const statusMsg = await api.sendMessage({
      chat_id: chatId,
      text:
        "⚙️ *Processing...*\n" +
        "━━━━━━━━━━━━━━━━━━\n" +
        "🎯 *Target:* `" + target + "`\n" +
        "⏳ *Status:* `Connecting to server...`",
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
          ],
        },
      });
    } else {
      await api.editMessageText({
        chat_id: chatId,
        message_id: statusMsg.message_id,
        text:
          "❌ *Failed*\n" +
          "━━━━━━━━━━━━━━━━━━\n" +
          "⚠️ *Error:* `" + result.error + "`",
        parse_mode: "Markdown",
      });
    }
  }
}
