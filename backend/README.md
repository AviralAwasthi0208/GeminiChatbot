# Gemini Chatbot Backend (In-Memory, No Auth)

Backend API for the Gemini Chatbot application using **in-memory chat storage**, **no database**, and **no authentication**.

## Features

- In-memory chat storage using a `Map` (no MongoDB, no persistence)
- Chat context includes:
  - `messages` (user + assistant)
  - `documentText` extracted from uploaded PDF/TXT
  - `image` stored as base64 (PNG/JPG) + mime type
- Gemini API integration (text + optional document/image context)
- File upload endpoint for PDF/TXT/PNG/JPG with basic text extraction
- Simple, minimal API surface

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file:

```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
   - `PORT` – API port (default `5000`)
   - `FRONTEND_URL` – allowed origin for CORS (e.g. `http://localhost:3000`)
   - `GEMINI_API_KEY` – from https://makersuite.google.com/app/apikey

4. Start the server:

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Chat

- `POST /api/chat`  
  Create a new in-memory chat and return its `chatId`.

- `GET /api/chat/:chatId`  
  Get a specific chat (messages + context) by `chatId`.

- `POST /api/chat/:chatId/message`  
  Send a message to a chat. The backend:
  - appends the user message to the in-memory chat
  - sends recent messages + `documentText` + `image` to Gemini
  - appends the assistant response and returns the updated chat

- `DELETE /api/chat/:chatId`  
  Delete a chat from memory.

### Files

- `POST /api/file/upload`  
  Upload a single file:
  - **PDF/TXT** → returns `{ type: "document", originalName, extractedText }`
  - **PNG/JPG** → returns `{ type: "image", originalName, base64, mimeType }`

> Note: Files are **not** persisted; the frontend passes the returned metadata along with messages.

## Implementation Notes

- All chat data is stored in-memory in `storage/chatStorage.js` and is **lost on server restart**.
- There is **no** authentication, authorization, database, email, or Cloudinary integration.
- Gemini integration is implemented in `utils/gemini.js` and uses the in-memory chat context only.

