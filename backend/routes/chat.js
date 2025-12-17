const express = require("express")
const router = express.Router()
const {
  createChat,
  getChat,
  updateChat,
  deleteChat,
} = require("../storage/chatStorage")
const { generateGeminiResponse } = require("../utils/gemini")

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

    if (!message && (!files || files.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Message or file is required",
      })
    }

    let chat = getChat(chatId)

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      })
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
      // Documents (PDF / TXT)
      const documentFiles = files.filter(
        (f) => f.type === "document" && typeof f.extractedText === "string"
      )

      if (documentFiles.length > 0) {
        documentText = documentFiles
          .map((f) => f.extractedText)
          .join("\n\n")

        messageFiles.push(
          ...documentFiles.map((f) => ({
            type: "document",
            originalName: f.originalName,
          }))
        )
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

    // Save updated context
    chat = updateChat(chatId, {
      messages: chat.messages,
      documentText,
      image,
    })

    // -----------------------------
    // Generate Gemini response
    // -----------------------------
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
    res.status(500).json({
      success: false,
      message: "Error generating response",
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
