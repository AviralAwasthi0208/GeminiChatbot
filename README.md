# Gemini Chatbot (In-Memory, No Auth)

A minimal full-stack chatbot powered by Google's Gemini API.  
**No database, no authentication, no persistence** – all chat state lives in memory and is lost when the server restarts.

## Features

- **Multi-modal AI Chat** – Text + optional image and document context
- **In-Memory Chat State** – Chats are stored in RAM only, keyed by `chatId`
- **Document Support** – Extract text from **PDF** and **TXT** files
- **Image Support** – Upload **PNG/JPG** images, passed to Gemini as base64
- **New Chat Flow** – Clears all context and generates a fresh `chatId`
- **Simple UI** – Single chat page built with React + Tailwind

## Architecture

```
gemini-chatbot/
├── backend/              # Node.js + Express API
│   ├── routes/           # API routes (chat, file)
│   ├── storage/          # In-memory chat storage (Map-based)
│   ├── utils/            # Gemini API + file processing (PDF/TXT)
│   └── server.js         # Express server entry point
└── frontend/             # React + Vite application
    ├── src/
    │   ├── components/   # Chat UI components
    │   ├── context/      # Chat context provider (chatId in state)
    │   ├── pages/        # Chat page only
    │   ├── utils/        # Axios API client (no auth)
    │   └── main.jsx      # React entry point
    └── index.html
```

## Quick Start

### Prerequisites

Before you begin, ensure you have:
- Node.js 18+ and npm installed
- Google Gemini API key

### Step 1: Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Gemini key and frontend URL (see below)
npm run dev
```

### Step 2: Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with backend URL
npm run dev
```

### Step 3: Open Application

Navigate to `http://localhost:3000` in your browser.

## Environment Variables

### Backend (.env)

```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# AI
GEMINI_API_KEY=your-gemini-api-key-from-makersuite
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

## How to Get API Keys

### Google Gemini API Key
1. Visit https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy and paste into `backend/.env`

## API Endpoints

### Chat
- `POST /api/chat` – Create a new in-memory chat and return its `chatId`
- `GET /api/chat/:chatId` – Get a specific chat (messages + context) by `chatId`
- `POST /api/chat/:chatId/message` – Send a message to a chat; passes messages + context to Gemini
- `DELETE /api/chat/:chatId` – Delete a chat from memory

### File Upload
- `POST /api/file/upload` – Upload a single file (PDF/TXT/PNG/JPG)`  
  - PDFs/TXT: returns `extractedText`  
  - Images (PNG/JPG): returns `base64` + `mimeType`

## Tech Stack

### Backend
- Node.js & Express
- In-memory storage with `Map` (no database)
- Google Generative AI (Gemini)
- `pdf-parse` for document processing
- `multer` for file uploads

### Frontend
- React 18
- Vite
- React Router v6
- Axios (no auth interceptors)
- Tailwind CSS
- Context API for chat state management

## Project Structure Details

### Backend Files

- `server.js` – Express server setup with CORS and routes (no DB, no auth)
- `storage/chatStorage.js` – In-memory chat store keyed by `chatId`
- `routes/chat.js` – Chat creation, messaging, and deletion using in-memory store
- `routes/file.js` – File upload, PDF/TXT text extraction, and PNG/JPG base64 handling
- `utils/gemini.js` – Gemini AI integration using chat messages + document/image context
- `utils/fileProcessor.js` – PDF and TXT text extraction helpers

### Frontend Files

- `App.jsx` – Main app with routing (single `/chat` route)
- `context/ChatContext.jsx` – Chat state management (holds `chatId`, messages, files)
- `pages/Chat.jsx` – Main chat interface with “New Chat” button
- `components/ChatMessages.jsx` – Message display, including image/document previews
- `components/ChatInput.jsx` – Message input with file upload (PDF/TXT/PNG/JPG)
- `utils/api.js` – Axios instance without auth headers

## Troubleshooting

### Backend won't start
- Ensure Node.js is installed
- Check that `GEMINI_API_KEY` is set in `backend/.env`
- Verify port 5000 is not in use

### Frontend can't connect
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in `frontend/.env`
- Clear browser cache and cookies

### File uploads failing
- Check file size limits (default 10MB)
- Ensure you're uploading supported types (PDF/TXT/PNG/JPG)

## Deployment

This project is designed primarily for local/demo use (no database, no auth, no persistence).  
You can still deploy it like a normal Node + React app:

### Backend
1. Set environment variables in your hosting platform (at least `GEMINI_API_KEY` and `FRONTEND_URL`)
2. Set `NODE_ENV=production`

### Frontend
1. Build: `npm run build`
2. Deploy the `dist` folder
3. Set `VITE_API_URL` to your backend URL



## Support

For issues and questions:
1. Review backend logs in terminal
2. Check browser console for frontend errors
3. Verify your Gemini API key is active and valid
4. Ensure you're not expecting persistence or auth features (this version is fully in-memory)


