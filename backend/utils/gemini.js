

const { GoogleGenerativeAI } = require("@google/generative-ai")

// Check if API key is set
if (!process.env.GEMINI_API_KEY) {
  console.error("ERROR: GEMINI_API_KEY is not set in environment variables!")
}

const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null

async function generateGeminiResponse(chat, userMessage) {
  try {
    // Validate API key
    if (!genAI || !process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured. Please set GEMINI_API_KEY in your environment variables.")
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    })

    // Build conversation history (excluding current user message)
    // Filter out empty messages and the current user message
    const history = chat.messages
      .filter((msg) => {
        // Exclude current user message
        if (msg.role === "user" && msg.content === userMessage) {
          return false
        }
        // Only include messages with content
        return msg.content && msg.content.trim().length > 0
      })
      .map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content.trim() }],
      }))

    // Build message parts for current request
    const messageParts = []

    // 1️⃣ Add image if available (must be first if present)
    if (chat.image) {
      messageParts.push(chat.image)
    }

    // 2️⃣ Build prompt with document context
    let prompt = userMessage || ""
    
    if (chat.documentText && chat.documentText.trim().length > 0) {
      prompt = `Document content:\n\n${chat.documentText}\n\nUser request: ${userMessage || "Please analyze the document."}`
      console.log("✅ Including document text in prompt, length:", chat.documentText.length)
    } else {
      console.log("⚠️ No document text available in chat context")
      // If user asked about a PDF but we have no text, provide helpful message
      if (userMessage && (userMessage.toLowerCase().includes("pdf") || userMessage.toLowerCase().includes("document"))) {
        prompt = `${userMessage}\n\nNote: A PDF file was uploaded, but it contains no extractable text. This might be an image-only PDF (scanned document). Please inform the user that the PDF could not be processed because it contains no extractable text, and suggest they either: 1) Use a PDF with selectable text, 2) Provide the text content directly, or 3) Use OCR if the PDF is scanned.`
      }
    }

    // 3️⃣ Add text prompt (ensure we always have at least one text part)
    if (prompt.trim().length > 0) {
      messageParts.push({ text: prompt })
    } else if (messageParts.length === 0) {
      // If no text and no image, add a default message
      messageParts.push({ text: "Hello" })
    }

    // Start chat session with history (can be empty array)
    const chatSession = model.startChat({
      history: history.length > 0 ? history : [],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    })

    // Send message
    const result = await chatSession.sendMessage(messageParts)
    const responseText = result.response.text()
    
    if (!responseText) {
      throw new Error("Empty response from Gemini API")
    }
    
    return responseText
  } catch (error) {
    console.error("Gemini API error:", error)
    console.error("Error details:", error.message)
    if (error.stack) {
      console.error("Stack trace:", error.stack)
    }
    // Re-throw with more context
    throw new Error(`Failed to generate response from Gemini: ${error.message}`)
  }
}

module.exports = { generateGeminiResponse }
