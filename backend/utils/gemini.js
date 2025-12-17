// const { GoogleGenerativeAI } = require("@google/generative-ai")

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// async function generateGeminiResponse(chat, userMessage, files = []) {
//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

//     // Build conversation history
//     const history = chat.messages.slice(0, -1).map((msg) => ({
//       role: msg.role === "user" ? "user" : "model",
//       parts: [{ text: msg.content }],
//     }))

//     // Start chat with history
//     const chatSession = model.startChat({
//       history,
//       generationConfig: {
//         temperature: 0.9,
//         topK: 1,
//         topP: 1,
//         maxOutputTokens: 2048,
//       },
//     })

//     // Build prompt with files
//     let prompt = userMessage

//     // Add document context if available
//     const documentFiles = files?.filter((f) => f.type === "document" && f.extractedText)
//     if (documentFiles && documentFiles.length > 0) {
//       const documentTexts = documentFiles.map((f) => f.extractedText).join("\n\n")
//       prompt = `Document content:\n${documentTexts}\n\nUser question: ${userMessage}`
//     }

//     // Add image if available
//     const imageFiles = files?.filter((f) => f.type === "image")
//     if (imageFiles && imageFiles.length > 0) {
//       // For images, we need to fetch and convert to base64
//       const imageParts = await Promise.all(
//         imageFiles.map(async (file) => {
//           const response = await fetch(file.url)
//           const buffer = await response.arrayBuffer()
//           const base64 = Buffer.from(buffer).toString("base64")
//           return {
//             inlineData: {
//               data: base64,
//               mimeType: "image/jpeg",
//             },
//           }
//         }),
//       )

//       const result = await chatSession.sendMessage([...imageParts, { text: prompt }])

//       return result.response.text()
//     }

//     // Send text-only message
//     const result = await chatSession.sendMessage(prompt)
//     return result.response.text()
//   } catch (error) {
//     console.error("Gemini API error:", error)
//     throw new Error("Failed to generate response from Gemini")
//   }
// }

// module.exports = { generateGeminiResponse }



const { GoogleGenerativeAI } = require("@google/generative-ai")

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

async function generateGeminiResponse(chat, userMessage, files = []) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    })

    // Build conversation history from chat messages
    const history = chat.messages
      .filter((msg) => msg.role !== "user" || msg.content !== userMessage) // Exclude current user message
      .map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }))

    const chatSession = model.startChat({
      history,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    })

    // Build prompt with document text from chat context
    let prompt = userMessage

    // Use document text from chat context (stored in-memory)
    if (chat.documentText) {
      prompt = `
Use the following document to answer the user:

${chat.documentText}

User request:
${userMessage}
`
    }

    // Prepare message parts
    const messageParts = []

    // Add image from chat context (base64) if available
    if (chat.image) {
      messageParts.push({
        inlineData: {
          data: chat.image,
          mimeType: chat.imageMimeType || "image/png",
        },
      })
    }

    // Add text prompt
    messageParts.push({ text: prompt })

    // Send message with image and text
    const result = await chatSession.sendMessage(messageParts)
    return result.response.text()
  } catch (error) {
    console.error("Gemini API error:", error)
    throw new Error("Failed to generate response from Gemini")
  }
}

module.exports = { generateGeminiResponse }
