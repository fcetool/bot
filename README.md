# FCETool Bot

Professional Telegram bot that extracts partition files (`boot.img`, `recovery.img`, …) from remote firmware / ROM ZIP archives — without downloading the full package.

Runs on **Telegram Serverless**. No VPS required.

## Features

- 📦 Interactive button-based extraction flow
- 🔗 Paste a URL → pick target from buttons
- ⚡ `/extract <URL> <TARGET>` command
- 🔍 Inline mode in any chat
- 📋 Full list of supported partition files
- 🌐 Link to the web interface

## How users interact

1. **/start** → main menu with buttons  
2. Tap **Extract File** → send firmware URL  
3. Choose target (`boot.img`, …) from the keyboard  
4. Get a download button when done  

Alternative: send a URL directly, or use `/extract`.

## Setup

### 1. Enable Serverless in BotFather

Bot → **Serverless** → ON → copy **CLI Access** token.

### 2. Install & link

```bash
npm install
npx tgcloud login
```

### 3. Deploy code + database schema

```bash
npx tgcloud push
npx tgcloud migrate
```

### 4. Test

Open the bot → `/start` → **Extract File**.

## Project structure

```
tgcloud/
├── handlers/
│   ├── message.js              # /start /help /extract + URL detection
│   ├── callback_query.js       # All inline button actions
│   ├── inline_query.js         # Inline mode
│   └── chosen_inline_result.js # Inline extraction
├── lib/
│   ├── config.js               # Targets, keyboards, helpers
│   ├── extract.js              # FCETool API client
│   └── session.js              # Pending URL sessions
└── schema.js                   # sessions table
```

## Notes

- Extraction is performed by the [FCETool API](https://github.com/offici5l/fcetool).
- A small SQLite session table stores the URL while the user picks a target.
- Requires Node.js 18+.

## License

MIT
