const express = require("express")
const router = express.Router()
const {
  createChat,
  createChatWithId,
  getChat,
  updateChat,
  deleteChat,
  getAllChats,
} = require("../storage/chatStorage")
const { generateGeminiResponse } = require("../utils/gemini")
// -----------------------------------
// Get all chats (for sidebar)
// -----------------------------------
router.get("/", async (req, res) => {
  try {
    const chats = getAllChats()

    res.json({
      success: true,
      chats,
    })
  } catch (error) {
    console.error("Get chats error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch chats",
    })
  }
})


// -----------------------------------
// Get specific chat
// -----------------------------------
router.get("/:chatId", async (req, res) => {
  try {
    const chat = getChat(req.params.chatId)

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      })
    }

    res.json({ success: true, chat })
  } catch (error) {
    console.error("Get chat error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// -----------------------------------
// Create new chat
// -----------------------------------
router.post("/", async (req, res) => {
  try {
    const chat = createChat()

    res.status(201).json({
      success: true,
      chat,
    })
  } catch (error) {
    console.error("Create chat error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// -----------------------------------
// Send message (TEXT + FILES)
// -----------------------------------
router.post("/:chatId/message", async (req, res) => {
  try {
    const { message, files } = req.body
    const chatId = req.params.chatId

    console.log("Received message request for chatId:", chatId)
    console.log("Message:", message ? message.substring(0, 50) + "..." : "empty")
    console.log("Files:", files ? files.length : 0)

    if (!message && (!files || files.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Message or file is required",
      })
    }

    let chat = getChat(chatId)

    // Auto-create chat if it doesn't exist (handles server restarts)
    if (!chat) {
      console.log("Chat not found, creating new chat with ID:", chatId)
      if (chatId && chatId.startsWith("chat_")) {
        // Create chat with the requested ID
        chat = createChatWithId(chatId)
        console.log("Auto-created chat:", chatId)
      } else {
        // Invalid chatId format, return error
        return res.status(400).json({
          success: false,
          message: "Invalid chat ID format",
        })
      }
    }

    // -----------------------------
    // Existing context
    // -----------------------------
    let documentText = chat.documentText || null
    let image = chat.image || null

    const messageFiles = []

    // -----------------------------
    // Handle uploaded files
    // -----------------------------
    if (Array.isArray(files) && files.length > 0) {
      // Detailed logging for debugging
      files.forEach((f, idx) => {
        console.log(`File ${idx}:`, {
          type: f.type,
          hasExtractedText: !!f.extractedText,
          extractedTextType: typeof f.extractedText,
          extractedTextLength: f.extractedText ? f.extractedText.length : 0,
          extractedTextPreview: f.extractedText ? f.extractedText.substring(0, 100) : null,
          originalName: f.originalName
        })
      })

      // Documents (PDF / TXT)
      const documentFiles = files.filter((f) => {
        // Handle null/undefined/empty string cases
        // Note: typeof null === 'object' in JavaScript (language quirk), so check for null explicitly
        let textValue = f.extractedText
        
        // Check if null or undefined first (before typeof check)
        if (textValue === null || textValue === undefined) {
          textValue = ""
        } 
        // If it's actually an object (not null), try to convert
        else if (typeof textValue === "object" && textValue !== null) {
          console.warn("extractedText is an object (not null), attempting to convert:", textValue)
          textValue = String(textValue)
        }
        // If it's not a string, convert it
        else if (typeof textValue !== "string") {
          textValue = String(textValue)
        }
        
        // Trim and check length
        const trimmedText = textValue.trim()
        const isValid = f.type === "document" && trimmedText.length > 0
        
        if (f.type === "document") {
          if (!isValid) {
            console.log(`⚠️ Document file has no extractable text:`, {
              type: f.type,
              originalExtractedText: f.extractedText,
              originalExtractedTextType: typeof f.extractedText,
              isNull: f.extractedText === null,
              isUndefined: f.extractedText === undefined,
              normalizedText: textValue,
              trimmedLength: trimmedText.length,
              originalName: f.originalName
            })
          } else {
            console.log(`✅ Document file has extractable text:`, {
              type: f.type,
              trimmedLength: trimmedText.length,
              preview: trimmedText.substring(0, 100),
              originalName: f.originalName
            })
          }
        }
        
        // Update the file object with normalized text for later use
        if (isValid) {
          f.extractedText = trimmedText
        }
        
        return isValid
      })

      if (documentFiles.length > 0) {
        documentText = documentFiles
          .map((f) => {
            const text = typeof f.extractedText === "string" ? f.extractedText.trim() : String(f.extractedText || "").trim()
            return text
          })
          .filter(text => text.length > 0)
          .join("\n\n")
        
        console.log("✅ Document text extracted successfully, length:", documentText.length)
        if (documentText.length > 0) {
          console.log("Preview:", documentText.substring(0, 200))
        }

        messageFiles.push(
          ...documentFiles.map((f) => ({
            type: "document",
            originalName: f.originalName,
          }))
        )
      } else {
        console.log("❌ No valid document files found after filtering")
        console.log("Files received:", files.length)
        files.forEach((f, idx) => {
          if (f.type === "document") {
            console.log(`  File ${idx} (document):`, {
              type: f.type,
              extractedTextExists: f.hasOwnProperty("extractedText"),
              extractedTextValue: f.extractedText,
              extractedTextType: typeof f.extractedText,
              extractedTextLength: f.extractedText ? String(f.extractedText).length : 0
            })
          }
        })
        
        // If we have document files but no extractable text, inform the user
        const documentFilesWithoutText = files.filter(f => f.type === "document")
        if (documentFilesWithoutText.length > 0) {
          console.log("⚠️ Document files uploaded but contain no extractable text (might be image-only PDFs)")
        }
      }

      // Images (Gemini-ready inlineData)
      const imageFiles = files.filter(
        (f) => f.type === "image" && f.imagePart
      )

      if (imageFiles.length > 0) {
        image = imageFiles[0].imagePart // already Gemini formatted

        messageFiles.push({
          type: "image",
          originalName: imageFiles[0].originalName,
          base64: imageFiles[0].base64, // Include base64 for display
          mimeType: imageFiles[0].mimeType, // Include mimeType for display
        })
      }
    }

    // -----------------------------
    // Add user message
    // -----------------------------
    chat.messages.push({
      role: "user",
      content: message || "",
      files: messageFiles.length > 0 ? messageFiles : undefined,
      timestamp: new Date(),
    })
    // If chat has no title or default title, update it
if (!chat.title || chat.title === "New Chat") {
  let newTitle = "New Chat"

  // Priority 1: File name
  if (files && files.length > 0 && files[0].originalName) {
    newTitle = files[0].originalName
  }
  // Priority 2: First message text
  else if (message && message.trim()) {
    newTitle = message.substring(0, 30)
  }

  chat.title = newTitle
}


    // Save updated context
    chat = updateChat(chatId, {
      messages: chat.messages,
      documentText,
      image,
      title: chat.title,
    })
    
    console.log("Chat context updated - documentText length:", documentText ? documentText.length : 0, "image:", !!image)

    // -----------------------------
    // Generate Gemini response
    // -----------------------------
    // Ensure chat object is valid
    if (!chat || !Array.isArray(chat.messages)) {
      throw new Error("Invalid chat object structure")
    }

    // If user asked about PDF/document but we have no extractable text, 
    // still process the message so Gemini can inform the user
    const hasDocumentRequest = message && (
      message.toLowerCase().includes("pdf") || 
      message.toLowerCase().includes("document") ||
      message.toLowerCase().includes("summarize")
    )
    
    if (hasDocumentRequest && (!documentText || documentText.trim().length === 0) && files && files.length > 0) {
      console.log("⚠️ User requested document processing but no extractable text found")
      // Still proceed - Gemini will inform the user
    }

    const botResponse = await generateGeminiResponse(
      chat,
      message || ""
    )

    // -----------------------------
    // Add bot message
    // -----------------------------
    chat.messages.push({
      role: "assistant",
      content: botResponse,
      timestamp: new Date(),
    })

    chat = updateChat(chatId, {
      messages: chat.messages,
    })

    res.json({
      success: true,
      message: botResponse,
      chat,
    })
  } catch (error) {
     console.error("Send message error:", error)

  const statusCode = error.statusCode || 500

  let clientMessage = "Gemini API error"

  if (statusCode === 429) {
    clientMessage = "Gemini API quota exhausted"
  }

  res.status(statusCode).json({
    success: false,
    message: clientMessage,
  })
  }
})

// -----------------------------------
// Delete chat
// -----------------------------------
router.delete("/:chatId", async (req, res) => {
  try {
    const deleted = deleteChat(req.params.chatId)

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      })
    }

    res.json({
      success: true,
      message: "Chat deleted successfully",
    })
  } catch (error) {
    console.error("Delete chat error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

module.exports = router
