# 🤖 AnswerIt

> An AI assistant that detects questions on webpages and helps you answer them instantly.

AnswerIt is a Chrome Extension that automatically identifies questions on a webpage, sends them to the **Google Gemini API**, and highlights the correct answer directly in the browser — no copy-pasting, no tab-switching.

---

## ✨ Features

- 🔍 **Auto-detects questions** on supported pages using configurable DOM selectors
- 🤖 **AI-powered answers** via Google Gemini 2.0/3.0 Flash (with model waterfall fallback)
- ✅ **Highlights the correct answer** with a vivid green border directly on the page
- 🔄 **Supports multiple question formats**: Multiple Choice, True/False, Multi-select, Ordering, Free Text
- 🔑 **Secure API key storage** using `chrome.storage.local`
- ⚙️ **Customizable selectors** — configure any website's DOM structure via JSON

---

## 📁 Project Structure

```
responder/
├── docs/
│   └── SPECIFICATION.md      # Full technical specification
└── src/
    ├── manifest.json         # Chrome Extension Manifest V3
    ├── background.js         # Service worker — Gemini API integration
    ├── content.js            # Scrapes questions & highlights answers
    ├── popup.html            # Extension popup UI
    ├── popup.js              # Popup logic & settings management
    └── style.css             # Popup & highlight styles
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/reenanms/answerIt.git
cd answerIt
```

### 2. Get a Google AI Studio API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy it — you'll need it in the extension popup

### 3. Load the extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer Mode** (top-right toggle)
3. Click **"Load unpacked"**
4. Select the `src/` folder from this repository

### 4. Configure and use

1. Click the **AnswerIt** icon in your Chrome toolbar
2. Paste your **Google AI Studio API Key**
3. (Optional) Adjust the **DOM Selector Config** if you're using a different website
4. Click **💾 Save Settings**
5. Navigate to a supported page and click **⚡ Solve Question**

---

## ⚙️ Selector Configuration

AnswerIt uses a JSON config to know which DOM elements contain questions and answer options. The default config targets **McGraw-Hill** platforms:

```json
{
  "name": "McGraw-Hill Default",
  "selectors": {
    "question": ".question-content, .q-text",
    "options": ".answer-option, .choice-label",
    "container": ".question-wrapper"
  }
}
```

You can modify this directly in the popup to support any other website.

---

## 🤖 AI Model

The extension uses a **model waterfall** strategy — it tries each model in order until one succeeds, gracefully handling rate limits:

| Priority | Model |
|----------|-------|
| 1st | `gemini-3-flash-preview` |
| 2nd | `gemini-2.5-flash` |

> **Note:** Free-tier daily limits reset at midnight Pacific Time. You can [enable billing](https://console.cloud.google.com) on Google Cloud to remove limits.

---

## 🛡️ Permissions

| Permission | Reason |
|---|---|
| `storage` | Save your API key and selector config locally |
| `activeTab` | Access the current tab to find questions |
| `scripting` | Inject the content script to highlight answers |

**Host permissions** are limited to:
- `https://*.mheducation.com/*` (McGraw-Hill)
- `https://generativelanguage.googleapis.com/*` (Gemini API)

---

## 🔒 Privacy

- Your API key is stored **locally** in your browser only (`chrome.storage.local`)
- No data is sent to any third-party server — only directly to the **Google Gemini API**

---

## 🛠️ Tech Stack

- **Chrome Extension Manifest V3**
- **Vanilla JavaScript** (no dependencies)
- **Google Gemini API** (`gemini-2.5-flash`, `gemini-3-flash-preview`)

---

## 📄 License

MIT License — feel free to use, modify, and distribute.
