# AI Clone - Fullstack Application

A fullstack AI Clone application built with a FastAPI backend (integrated with Google Gemini) and a modern React + Vite frontend.

---

## Project Structure

```text
AI_clone/
├── backend/            # FastAPI backend service
│   ├── main.py         # API endpoints & Gemini model integration
│   ├── requirements.txt
│   └── .env.example    # Environment variable template
├── frontend/           # React + Vite frontend application
│   ├── src/            # Components, styles, and assets
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Getting Started

### 1. Backend Setup

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create your `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Add your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

5. Start the backend server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

---

### 2. Frontend Setup

1. In a separate terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the displayed local URL (typically `http://localhost:5173`).
