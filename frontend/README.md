# Gemini Chatbot Frontend (In-Memory, No Auth)

React-based frontend for the Gemini Chatbot application using **no authentication** and **no persistence**.  
All chat state is held in React state and is lost on page reload.

## Features

- Single-page chat interface (`/chat`)
- In-memory chat state managed by `ChatContext`:
  - `chatId` (from backend)
  - `messages` (user + assistant)
  - pending/uploading files
- “New Chat” button that:
  - clears messages and local file state
  - requests a new `chatId` from the backend
- File uploads:
  - PDF/TXT → text extracted on backend and used as context
  - PNG/JPG → converted to base64 and sent to Gemini
- Responsive design with Tailwind CSS

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file:

```bash
cp .env.example .env
```

3. Update `.env` with your backend API URL, for example:

```env
VITE_API_URL=http://localhost:5000/api
```

4. Start development server:

```bash
npm run dev
```

5. Build for production:

```bash
npm run build
```

## Tech Stack

- React 18
- React Router v6
- Axios for API calls (no auth headers)
- Tailwind CSS for styling
- Vite for build tooling

## Key Files

- `src/App.jsx` – App shell and routing (redirects to `/chat`)
- `src/context/ChatContext.jsx` – Manages `chatId`, messages, and file upload helpers
- `src/pages/Chat.jsx` – Main chat layout + “New Chat” button
- `src/components/ChatMessages.jsx` – Renders messages + image/document previews
- `src/components/ChatInput.jsx` – Message input, drag-drop/paste/upload for files
- `src/utils/api.js` – Axios instance pointing at the backend (no interceptors)

