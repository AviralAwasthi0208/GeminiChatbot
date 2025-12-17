// In-memory chat storage
// Chat state is stored in RAM and lost on server restart

const chats = new Map()

// Generate unique chat ID
function generateChatId() {
  return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Create a new chat
function createChat() {
  const chatId = generateChatId()
  const chat = {
    chatId,
    messages: [],
    documentText: null,
    image: null, // base64 string for PNG/JPG
    imageMimeType: null, // mimeType for the image (e.g., "image/png", "image/jpeg")
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  chats.set(chatId, chat)
  return chat
}

// Get chat by ID
function getChat(chatId) {
  return chats.get(chatId) || null
}

// Update chat
function updateChat(chatId, updates) {
  const chat = chats.get(chatId)
  if (!chat) return null
  
  Object.assign(chat, updates, { updatedAt: new Date() })
  return chat
}

// Delete chat
function deleteChat(chatId) {
  return chats.delete(chatId)
}

// Get all chats (for compatibility, returns empty array since we don't persist)
function getAllChats() {
  return Array.from(chats.values())
}

module.exports = {
  createChat,
  getChat,
  updateChat,
  deleteChat,
  getAllChats,
}

