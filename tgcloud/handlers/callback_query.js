import { api } from "sdk";

/** Acknowledge taps on the temporary inline extraction status button. */
export default async function (callbackQuery) {
  await api.answerCallbackQuery({
    callback_query_id: callbackQuery.id,
    text: callbackQuery.data === "processing"
      ? "Extraction is in progress. This message will update automatically."
      : "Use inline mode to start a new extraction.",
  });
}
