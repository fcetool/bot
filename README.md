# FCETool Bot — Telegram Serverless

Telegram bot that extracts specific files (like `boot.img`) from remote firmware/ROM ZIP archives using [FCETool](https://github.com/offici5l/fcetool).

Runs entirely on **Telegram Serverless** — no VPS required.

## Features

- `/extract <URL> <TARGET>` command
- Inline mode: `@YourBot <URL> <TARGET>`
- Calls the official FCETool API
- Clean success/error messages with download button

## Supported Targets

`boot.img`, `init_boot.img`, `recovery.img`, `vbmeta.img`, `vendor_boot.img`, and many more (see `tgcloud/lib/config.js`).

## Setup

### 1. Enable Serverless

In [@BotFather](https://t.me/BotFather):

1. Select your bot → **Serverless** → turn it on
2. Go to **CLI Access** → copy the Access Token

### 2. Install & Link

```bash
npm install
npx tgcloud login
```

Paste the Access Token when prompted.

### 3. Deploy

```bash
npx tgcloud push
```

### 4. Test

```
/extract https://example.com/rom.zip boot.img
```

Or use inline mode in any chat.

## Project Structure

```
tgcloud/
├── handlers/
│   ├── message.js                 # /start /help /extract
│   ├── inline_query.js            # Inline mode
│   └── chosen_inline_result.js    # After selecting inline result
├── lib/
│   ├── config.js                  # API URL + supported targets
│   └── extract.js                 # Call FCETool API
└── schema.js                      # (empty — no database used)
```

## Notes

- Extraction is performed by the external FCETool API (`offici5l-fcetool.hf.space`)
- No local database is used
- Requires Node.js 18+

## License

MIT
