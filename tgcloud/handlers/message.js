import { api } from "sdk";
import { SUPPORTED_TARGETS } from "../lib/config.js";

/** The bot performs extraction only through Telegram inline mode. */
export default async function (message) {
  const text = (message.text || "").trim();
  if (!/^\/(start|help)(?:@[A-Za-z0-9_]+)?(?:\s|$)/i.test(text)) return;

  const chatId = message.chat?.id;
  if (!chatId) return;

  const me = await api.getMe();
  await api.sendMessage({
    chat_id: chatId,
    text:
      "Use FCETool inline mode in any chat. Type:\n\n" +
      "@" + me.username + " <firmware ZIP URL> <partition>\n\n" +
      "Example:\n" +
      "@" + me.username + " https://example.com/firmware.zip boot.img\n\n" +
      "You can also type only the ZIP URL, then choose a popular partition from the inline results.\n\n" +
      "Supported partitions:\n" + SUPPORTED_TARGETS.join(", ") + "\n\n" +
      "Enable Inline Mode and Inline Feedback for this bot in BotFather.",
    disable_web_page_preview: true,
  });
}
