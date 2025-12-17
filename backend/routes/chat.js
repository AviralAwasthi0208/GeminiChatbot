const express = require("express")
const router = express.Router()
const { createChat, getChat, updateChat, deleteChat } = require("../storage/chatStorage")
const { generateGeminiResponse } = require("../utils/gemini")

// Get specific chat
router.get("/:chatId", async (req, res) => {
  try {
    const chat = getChat(req.params.chatId)

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      })
    }

    res.json({
      success: true,
      chat,
    })
  } catch (error) {
    console.error("Get chat error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// Create new chat
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

// Send message
router.post("/:chatId/message", async (req, res) => {
  try {
    const { message, files } = req.body
    const chatId = req.params.chatId

    let chat = getChat(chatId)

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      })
    }

    // Process files: extract document text and store image as base64
    let documentText = chat.documentText || null
    let image = chat.image || null
    let imageMimeType = chat.imageMimeType || null

    // Prepare files for message (for display)
    const messageFiles = []

    if (files && files.length > 0) {
      // Extract document text from PDF/TXT files
      const documentFiles = files.filter((f) => f.type === "document" && f.extractedText)
      if (documentFiles.length > 0) {
        documentText = documentFiles.map((f) => f.extractedText).join("\n\n")
        // Add document files to message for display
        messageFiles.push(...documentFiles.map((f) => ({
          type: f.type,
          originalName: f.originalName,
          extractedText: f.extractedText,
        })))
      }

      // Store image as base64 (PNG/JPG)
      const imageFiles = files.filter((f) => f.type === "image" && f.base64)
      if (imageFiles.length > 0) {
        // Use the first image
        image = imageFiles[0].base64
        imageMimeType = imageFiles[0].mimeType || "image/png"
        // Add image file to message for display
        messageFiles.push({
          type: "image",
          originalName: imageFiles[0].originalName,
          base64: imageFiles[0].base64,
          mimeType: imageFiles[0].mimeType,
        })
      }
    }

    // Add user message
    const userMessage = {
      role: "user",
      content: message,
      files: messageFiles.length > 0 ? messageFiles : undefined,
      timestamp: new Date(),
    }

    chat.messages.push(userMessage)

    // Update chat with document text and image
    chat = updateChat(chatId, {
      messages: chat.messages,
      documentText,
      image,
      imageMimeType,
    })

    // Generate bot response using Gemini
    const botResponse = await generateGeminiResponse(chat, message, files)

    // Add bot message
    chat.messages.push({
      role: "assistant",
      content: botResponse,
      timestamp: new Date(),
    })

    // Update chat with bot response
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

// Delete chat
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
