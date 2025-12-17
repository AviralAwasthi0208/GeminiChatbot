const pdf = require("pdf-parse")

async function extractTextFromPDF(buffer) {
  try {
    // Try to extract with options for better text extraction
    const data = await pdf(buffer, {
      // Try to extract text more aggressively
      max: 0, // Process all pages
    })
    
    const extractedText = data.text || ""
    
    // Log extraction details for debugging
    console.log("PDF extraction details:", {
      numPages: data.numpages,
      info: data.info,
      metadata: data.metadata,
      textLength: extractedText.length,
      textPreview: extractedText.substring(0, 200).replace(/\n/g, "\\n")
    })
    
    // Check if we got meaningful text (not just whitespace)
    const trimmedText = extractedText.trim()
    if (trimmedText.length === 0) {
      console.warn("PDF extraction returned only whitespace - PDF might be image-only or have no extractable text")
      // Return the original text (with whitespace) so caller can decide
      return extractedText
    }
    
    return extractedText
  } catch (error) {
    console.error("PDF extraction error:", error)
    console.error("Error details:", error.message, error.stack)
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
