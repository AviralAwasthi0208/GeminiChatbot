const express = require("express")
const router = express.Router()
const multer = require("multer")
const { extractTextFromPDF, extractTextFromTXT } = require("../utils/fileProcessor")

function mapMimeToFileType(mimeType) {
  if (!mimeType) return "document"
  if (mimeType.startsWith("image/")) return "image"
  if (mimeType.startsWith("text/")) return "document"
  if (mimeType === "application/pdf") return "document"
  return "document"
}

// ✅ Render-safe multer config
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // ⬅️ 5MB max (IMPORTANT)
  },
})

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "No file received",
      })
    }

    const mimeType = req.file.mimetype
    const fileType = mapMimeToFileType(mimeType)

    let extractedText = null
    let imagePart = null

    // ✅ PDF parsing (guarded)
    if (mimeType === "application/pdf") {
      try {
        extractedText = await extractTextFromPDF(req.file.buffer)
        console.log("PDF extraction result:", {
          extracted: !!extractedText,
          type: typeof extractedText,
          length: extractedText ? extractedText.length : 0,
          preview: extractedText ? extractedText.substring(0, 100) : null
        })
        
        // Normalize: ensure it's a string, trim whitespace
        if (!extractedText || typeof extractedText !== "string") {
          extractedText = ""
        } else {
          extractedText = extractedText.trim()
          // If after trimming it's empty, keep as empty string (don't convert to null)
          // This allows us to distinguish between "not extracted" (null) and "extracted but empty" (empty string)
        }
        
        if (extractedText.length === 0) {
          console.warn("PDF extraction returned empty text after trimming - PDF might be image-only or have no extractable text")
          // Keep as empty string, not null - so frontend knows extraction was attempted
        }
      } catch (err) {
        console.error("PDF parse failed:", err)
        return res.status(400).json({
          success: false,
          message: "Failed to read PDF file",
        })
      }
    }

    // ✅ TXT parsing (safe)
    if (mimeType === "text/plain") {
      extractedText = await extractTextFromTXT(req.file.buffer)
      // Normalize
      if (!extractedText || typeof extractedText !== "string") {
        extractedText = ""
      } else {
        extractedText = extractedText.trim()
      }
    }

    // ✅ Image → Gemini-safe format + base64 for display
    let imageBase64 = null
    if (
      fileType === "image" &&
      (mimeType === "image/png" || mimeType === "image/jpeg" || mimeType === "image/jpg")
    ) {
      imageBase64 = req.file.buffer.toString("base64")

      imagePart = {
        inlineData: {
          data: imageBase64,
          mimeType,
        },
      }
    }

    // Prepare response - keep empty string as empty string (not null) to distinguish from "not extracted"
    const responseFile = {
      type: fileType,
      originalName: req.file.originalname,
      imagePart, // ⬅️ For Gemini API
      base64: imageBase64, // ⬅️ For frontend display
      mimeType: fileType === "image" ? mimeType : undefined, // ⬅️ For frontend display
    }
    
    // Only include extractedText if it was actually extracted (even if empty)
    // null = not extracted, empty string = extracted but empty, string = extracted with content
    if (mimeType === "application/pdf" || mimeType === "text/plain") {
      responseFile.extractedText = extractedText !== null && extractedText !== undefined ? extractedText : null
    }
    
    res.json({
      success: true,
      file: responseFile,
    })
  } catch (error) {
    console.error("UPLOAD ERROR:", error)
    res.status(500).json({
      success: false,
      message: error.message || "File upload failed",
    })
  }
})

module.exports = router
