const express = require("express")
const router = express.Router()
const multer = require("multer")
const { extractTextFromPDF, extractTextFromTXT } = require("../utils/fileProcessor")

function mapMimeToFileType(mimeType) {
  if (!mimeType) return "document"

  if (mimeType.startsWith("image/")) return "image"
  if (mimeType.startsWith("application/")) return "document"
  if (mimeType.startsWith("text/")) return "document"
  if (mimeType.startsWith("audio/")) return "audio"
  if (mimeType.startsWith("video/")) return "video"

  return "document"
}

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
})

// Upload file - process and return extracted text/base64
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      })
    }

    const fileType = mapMimeToFileType(req.file.mimetype)

    let extractedText = null
    let base64 = null

    // Extract text from PDF/TXT documents
    if (req.file.mimetype === "application/pdf") {
      extractedText = await extractTextFromPDF(req.file.buffer)
    } else if (req.file.mimetype === "text/plain") {
      extractedText = await extractTextFromTXT(req.file.buffer)
    }

    // Convert image to base64 (PNG/JPG only)
    if (fileType === "image" && (req.file.mimetype === "image/png" || req.file.mimetype === "image/jpeg" || req.file.mimetype === "image/jpg")) {
      base64 = req.file.buffer.toString("base64")
    }

    res.json({
      success: true,
      file: {
        type: fileType,
        originalName: req.file.originalname,
        extractedText,
        base64, // base64 string for images (PNG/JPG)
        mimeType: req.file.mimetype,
      },
    })
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({
      success: false,
      message: "Error processing file",
    })
  }
})

module.exports = router
