import { api } from "sdk";

export default async function (message) {
  const text = (message.text || "").trim();
  if (!/^\/(start|help)(?:@[A-Za-z0-9_]+)?(?:\s|$)/i.test(text)) return;

  const chatId = message.chat?.id;
  if (!chatId) return;

  const me = await api.getMe();
  await api.sendMessage({
    chat_id: chatId,
    text:
      "Use FCETool in any chat. Type:\n\n" +
      "@" + me.username + " <ZIP URL> <partition>\n\n" +
      "Example:\n" +
      "@" + me.username + " https://example.com/firmware.zip boot.img",
    disable_web_page_preview: true,
  });
}
