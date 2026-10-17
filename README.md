# FCETool Bot

Telegram bot for extracting partition files (`boot.img`, `recovery.img`, and more) from remote firmware ZIP archives. The bot uses **inline mode only** for extraction; the separate web interface is available at <https://fcetool.github.io>.

Runs on **Telegram Serverless**. No VPS required.

## Telegram experience

1. In any chat, type `@YourBot <firmware ZIP URL> <partition>`.
2. If you enter only a ZIP URL, choose any partition from the complete list of 60 targets. Telegram loads the final 10 on the next page as you scroll because one inline response can contain at most 50 results. You can also type a target after the URL to filter to one result.
3. Select the extraction result. The inline message updates with progress and then a **Download file** button.

`/start` and `/help` only explain inline usage. Direct URL messages, extraction commands, and menu-based flows are intentionally not supported.

## Setup

### 1. Configure the bot in BotFather

- Enable **Serverless** and copy the **CLI Access** token.
- Enable **Inline Mode**.
- Enable **Inline Feedback** so Telegram returns the inline message ID needed to update the selected result when extraction finishes.

### 2. Install and link

```bash
npm install
npx tgcloud login
```

### 3. Deploy

```bash
npx tgcloud push
npx tgcloud migrate
```

### 4. Use it

In any Telegram chat, type `@YourBot https://example.com/firmware.zip boot.img`, select the result, and wait for the download button to appear.

## Project structure

```
tgcloud/
├── handlers/
│   ├── message.js              # /start and /help instructions only
│   ├── callback_query.js       # Acknowledges the temporary inline status button
│   ├── inline_query.js         # Inline search and partition suggestions
│   └── chosen_inline_result.js # Runs and displays the extraction
├── lib/
│   ├── config.js               # API endpoint, supported targets, URL validation
│   └── extract.js              # FCETool API client with timeout and error handling
└── schema.js                   # Existing session schema retained for migration compatibility
```

## Notes

- Extraction is performed by the [FCETool API](https://github.com/fcetool/fcetool).
- Requires Node.js 18+.
- The legacy database schema remains in place but is no longer used by inline extraction.

## License

MIT
