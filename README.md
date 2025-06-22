# AqlMind 🧠

AqlMind is an AI-powered web application that allows you to chat intelligently about the content of any website. It leverages the power of [Scrapling](https://github.com/D4Vinci/Scrapling) for web scraping and Google's Gemini AI for natural language understanding and conversation.

## Features ✨

- **💬 Website Content Chat**: Load any public website and ask questions about its content.
- **🎨 Modern Web UI**: Beautiful, responsive interface built with HTML, CSS, and JavaScript.
- **⚡ Streamlit Demo**: Alternative interface for local testing and prototyping.
- **🗂️ Session Management**: Each chat is session-based, keeping your context and history.
- **🔒 API Key Security**: Your Gemini API key is only used server-side and never exposed to the client.
- **🩺 Health Check Endpoint**: Easily monitor the API status.

## Project Structure 🗂️

```
.
├── index.html           # Main web app HTML
├── static/
│   ├── style.css        # App styling
│   └── script.js        # Frontend logic
├── web_app.py           # FastAPI backend (main API)
├── streamlit_app.py     # Streamlit demo app
├── pyproject.toml       # Python project metadata and dependencies
├── requirements.txt     # Python dependencies
├── scrapling/           # Scrapling library (web scraping engine)
└── README.md            # This file
```

## Getting Started 🚀

### Prerequisites

- 🐍 Python 3.10+
- [Playwright](https://playwright.dev/python/) dependencies (for headless browsing)
- 🔑 A [Google Gemini API key](https://aistudio.google.com/app/apikey)

### Installation 🛠️

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ahmedhassan456/AqlMind.git
   cd aqlmind
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   # Using python -m venv
   python -m venv .venv

   # or Using uv
   uv venv

   # Activate on Windows
   .venv\Scripts\activate

   # Activate on macOS/Linux
   source .venv/bin/activate
   ```

3. **Install dependencies:**
   - Using **pip**:
     ```bash
     pip install -r requirements.txt
     ```
   - Using **uv** (fast, modern Python package installer):
     ```bash
     pip install uv  # if you don't have it
     uv add -r requirements.txt
     ```


4. **Install Playwright browsers (required for Scrapling):**
   ```bash
   playwright install chromium
   playwright install-deps chromium firefox
   camoufox fetch --browserforge
   ```

### Running the Web App 🌐

Start the FastAPI server:

```bash
python web_app.py
```

- Open your browser and go to [http://localhost:8000](http://localhost:8000)
- Enter your Gemini API key and the website URL you want to analyze.
- Start chatting!

### Running the Streamlit Demo 🧪

For a quick local demo:

```bash
streamlit run streamlit_app.py
```

## API Endpoints 📡

- `POST /api/load-url`  
  Load and process a website.  
  **Body:** `{ "api_key": "...", "url": "https://..." }`

- `POST /api/chat`  
  Send a chat message.  
  **Body:** `{ "session_id": "...", "message": "..." }`

- `DELETE /api/session/{session_id}`  
  Clear a session.

- `GET /api/health`  
  Health check.

## Security Note 🔐

- Your Gemini API key is **never** sent to the client. It is only used server-side for LLM requests.
- Do **not** share your API key publicly.

## Customization 🛠️

- **Frontend**: Edit `index.html`, `static/style.css`, and `static/script.js` for UI changes.
- **Backend**: Modify `web_app.py` for API logic or to add new endpoints.
- **Scraping Engine**: The `scrapling/` directory contains the web scraping logic.

## Credits 🙏

- Developed by **Ahmed Saqr**
- Powered by [Scrapling](https://github.com/D4Vinci/Scrapling) and [Gemini AI](https://aistudio.google.com/app/apikey)

## License 📄

[MIT License](LICENSE)

