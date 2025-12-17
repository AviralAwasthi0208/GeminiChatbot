const pdf = require("pdf-parse")

async function extractTextFromPDF(buffer) {
  try {
    const data = await pdf(buffer)
    return data.text
  } catch (error) {
    console.error("PDF extraction error:", error)
    return null
  }
}

async function extractTextFromTXT(buffer) {
  try {
    return buffer.toString("utf-8")
  } catch (error) {
    console.error("TXT extraction error:", error)
    return null
  }
}

module.exports = {
  extractTextFromPDF,
  extractTextFromTXT,
}
