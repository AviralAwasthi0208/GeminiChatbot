const { GoogleGenerativeAI } = require("@google/generative-ai")

if (!process.env.GEMINI_API_KEY) {
  console.error("ERROR: GEMINI_API_KEY is not set in environment variables!")
}

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null

async function generateGeminiResponse(chat, userMessage) {
  try {
    // 1️⃣ Validate API key
    if (!genAI || !process.env.GEMINI_API_KEY) {
      const err = new Error("Gemini API key not configured")
      err.statusCode = 500
      throw err
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    })

    // 2️⃣ Build conversation history
    const history = chat.messages
      .filter(
        (msg) =>
          msg.content &&
          msg.content.trim().length > 0 &&
          !(msg.role === "user" && msg.content === userMessage)
      )
      .map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content.trim() }],
      }))

    // 3️⃣ Build message parts
    const messageParts = []

    if (chat.image) {
      messageParts.push(chat.image)
    }

    let prompt = userMessage || ""

    if (chat.documentText && chat.documentText.trim()) {
      prompt = `Document content:\n\n${chat.documentText}\n\nUser request: ${userMessage || "Please analyze the document."}`
    }

    if (prompt.trim()) {
      messageParts.push({ text: prompt })
    } else if (messageParts.length === 0) {
      messageParts.push({ text: "Hello" })
    }

    const chatSession = model.startChat({
      history,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    })

    const result = await chatSession.sendMessage(messageParts)
    const responseText = result.response.text()

    if (!responseText) {
      const err = new Error("Empty response from Gemini API")
      err.statusCode = 500
      throw err
    }

    return responseText
  } catch (error) {
    // 🔥 LOG FULL ERROR (backend only)
    console.error("Gemini API internal error:", error)

    // ✅ HANDLE RATE LIMIT / QUOTA
    if (error?.status === 429 || error?.statusCode === 429) {
      const err = new Error("Gemini API quota exhausted")
      err.statusCode = 429
      throw err
    }

    // ✅ HANDLE ALL OTHER GEMINI ERRORS
    const err = new Error("Gemini API error")
    err.statusCode = 500
    throw err
  }
}

module.exports = { generateGeminiResponse }
