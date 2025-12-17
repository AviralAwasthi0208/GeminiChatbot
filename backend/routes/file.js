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
    }

    // ✅ Image → Gemini-safe format
    if (
      fileType === "image" &&
      (mimeType === "image/png" || mimeType === "image/jpeg")
    ) {
      const base64 = req.file.buffer.toString("base64")

      imagePart = {
        inlineData: {
          data: base64,
          mimeType,
        },
      }
    }

    res.json({
      success: true,
      file: {
        type: fileType,
        originalName: req.file.originalname,
        extractedText,
        imagePart, // ⬅️ NOT raw base64 anymore
      },
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
