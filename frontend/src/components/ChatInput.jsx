"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "../context/ChatContext"
import { showSuccess, showError, showWarning } from "../utils/toast"

const ChatInput = () => {
  const { currentChat, sendMessage, clearUploadingFiles, uploadFiles, pendingFiles, clearPendingFiles, uploadFilesAndAddToPending } = useChat()
  const [message, setMessage] = useState("")
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [sending, setSending] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)
  const inputContainerRef = useRef(null)
  const textInputRef = useRef(null)

  // Add pending files (from drag-drop/paste) to local files state
  useEffect(() => {
    if (pendingFiles.length > 0) {
      setFiles((prevFiles) => [...prevFiles, ...pendingFiles])
      clearPendingFiles()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingFiles])

  // Handle paste (Ctrl+V) when input is focused
  useEffect(() => {
    const handlePaste = async (e) => {
      // Only handle if the text input is focused
      if (document.activeElement !== textInputRef.current) return

      const items = Array.from(e.clipboardData.items)
      const files = []

      for (const item of items) {
        if (item.kind === "file") {
          const file = item.getAsFile()
          if (file) {
            // Check if it's an image or other accepted file type
            const acceptedTypes = ["image/", "application/pdf", "text/plain", "audio/", "video/"]
            const isValid = acceptedTypes.some(
              (type) => file.type.startsWith(type) || file.type === type
            )

            if (isValid) {
              files.push(file)
            }
          }
        }
      }

      if (files.length > 0) {
        e.preventDefault()
        await uploadFilesAndAddToPending(files)
      }
    }

    const container = inputContainerRef.current || document
    container.addEventListener("paste", handlePaste)

    return () => {
      container.removeEventListener("paste", handlePaste)
    }
  }, [uploadFilesAndAddToPending])

  const handleFileUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files)
    if (selectedFiles.length === 0) return

    setUploading(true)
    const uploadedFiles = await uploadFiles(selectedFiles)
    if (uploadedFiles.length > 0) {
      setFiles((prevFiles) => [...prevFiles, ...uploadedFiles])
    }
    setUploading(false)
  }

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set dragging to false if we're leaving the container itself
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false)
    }
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length === 0) return

    // Filter files by accepted types
    const acceptedTypes = ["image/", "application/pdf", "text/plain", "audio/", "video/"]
    const validFiles = droppedFiles.filter((file) =>
      acceptedTypes.some((type) => file.type.startsWith(type) || file.type === type)
    )

    if (validFiles.length === 0) {
      showError("Please drop valid files (images, PDFs, text files, audio, or video)")
      return
    }

    if (validFiles.length < droppedFiles.length) {
      showWarning(`Only ${validFiles.length} of ${droppedFiles.length} files are valid. Uploading valid files only.`)
    }

    await uploadFilesAndAddToPending(validFiles)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim() || !currentChat) return

    setSending(true)

    try {
      await sendMessage(currentChat.chatId, message, files)
      setMessage("")
      setFiles([])
      clearUploadingFiles()
      showSuccess("Message sent successfully!")
    } catch (error) {
      console.error("Send message error:", error)
      showError("Failed to send message. Please try again.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div 
      ref={inputContainerRef}
      className={`border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 relative transition-all ${
        isDragging ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-600 border-2 border-dashed" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-indigo-50 bg-opacity-95 z-10 pointer-events-none rounded-lg">
          <div className="text-center">
            <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-sm font-semibold text-indigo-900">Drop files here to upload</p>
          </div>
        </div>
      )}
      {files.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div key={index} className="relative group">
              {file.type === "image" ? (
                <img
                  src={file.base64 ? `data:${file.mimeType || "image/png"};base64,${file.base64}` : file.preview || "/placeholder.svg"}
                  alt={file.originalName}
                  className="h-20 w-20 object-cover rounded-lg"
                />
              ) : (
                <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              )}
              <button
                onClick={() => handleRemoveFile(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          multiple
          accept="image/*,.pdf,.txt,audio/*,video/*"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition disabled:opacity-50"
        >
          <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
        </button>

        <input
          ref={textInputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          disabled={sending || uploading}
        />

        <button
          type="submit"
          disabled={sending || uploading || !message.trim()}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
  * PDF: max 5MB | Image (JPG/PNG): max 2MB
</p>

    </div>
  )
}

export default ChatInput
