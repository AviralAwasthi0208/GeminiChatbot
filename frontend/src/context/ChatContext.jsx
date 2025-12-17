"use client"

import { createContext, useState, useContext } from "react"
import api from "../utils/api"
import { showError, showSuccess } from "../utils/toast"

const ChatContext = createContext()

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}

export const ChatProvider = ({ children }) => {
  const [currentChat, setCurrentChat] = useState(null)
  const [chatId, setChatId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState([])
  const [pendingFiles, setPendingFiles] = useState([])

  const fetchChat = async (id) => {
    try {
      setLoading(true)
      const response = await api.get(`/chat/${id}`)
      if (response.data.success) {
        setCurrentChat(response.data.chat)
        setChatId(id)
      }
    } catch (error) {
      console.error("Fetch chat error:", error)
    } finally {
      setLoading(false)
    }
  }

  const createNewChat = async () => {
    try {
      // Clear all state for new chat
      setCurrentChat(null)
      setChatId(null)
      setPendingFiles([])
      clearUploadingFiles()

      const response = await api.post("/chat")
      if (response.data.success) {
        const newChat = response.data.chat
        setCurrentChat(newChat)
        setChatId(newChat.chatId)
        return newChat
      }
    } catch (error) {
      console.error("Create chat error:", error)
      throw error
    }
  }

  const sendMessage = async (id, message, files = []) => {
    try {
      const response = await api.post(`/chat/${id}/message`, {
        message,
        files,
      })
      if (response.data.success) {
        setCurrentChat(response.data.chat)
        return response.data
      }
    } catch (error) {
      console.error("Send message error:", error)
      throw error
    }
  }

  const deleteChat = async (id) => {
    try {
      await api.delete(`/chat/${id}`)
      if (chatId === id) {
        setCurrentChat(null)
        setChatId(null)
      }
    } catch (error) {
      console.error("Delete chat error:", error)
      throw error
    }
  }

  const addUploadingFile = (file) => {
    setUploadingFiles((prev) => [...prev, file])
  }

  const removeUploadingFile = (fileId) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const clearUploadingFiles = () => {
    setUploadingFiles([])
  }

  // Shared file upload function that can be used by drag-drop, paste, and file input
  const uploadFiles = async (fileList) => {
    const selectedFiles = Array.from(fileList)
    if (selectedFiles.length === 0) return []

    // Create preview objects for uploading files
    const uploadingFileObjects = selectedFiles.map((file, index) => {
      const fileId = `uploading-${Date.now()}-${index}`
      const isImage = file.type.startsWith("image/")
      const preview = isImage ? URL.createObjectURL(file) : null
      
      const fileObj = {
        id: fileId,
        originalName: file.name,
        type: isImage ? "image" : "document",
        preview,
        file,
      }
      
      addUploadingFile(fileObj)
      return fileObj
    })

    try {
      const uploadedFiles = []
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const uploadingFileObj = uploadingFileObjects[i]
        
        const formData = new FormData()
        formData.append("file", file)

        const response = await api.post("/file/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })

        if (response.data.success) {
          uploadedFiles.push(response.data.file)
        }
        
        // Remove from uploading state
        removeUploadingFile(uploadingFileObj.id)
        
        // Clean up preview URL if it was an image
        if (uploadingFileObj.preview) {
          URL.revokeObjectURL(uploadingFileObj.preview)
        }
      }

      if (uploadedFiles.length > 0) {
        showSuccess(`${uploadedFiles.length} file(s) uploaded successfully!`)
      }
      return uploadedFiles
    } catch (error) {
      console.error("File upload error:", error)
      showError("Failed to upload file. Please try again.")
      
      // Clean up all uploading files on error
      uploadingFileObjects.forEach((fileObj) => {
        removeUploadingFile(fileObj.id)
        if (fileObj.preview) {
          URL.revokeObjectURL(fileObj.preview)
        }
      })
      
      return []
    }
  }

  // Upload files and add to pending (for drag-drop/paste)
  const uploadFilesAndAddToPending = async (fileList) => {
    const uploadedFiles = await uploadFiles(fileList)
    if (uploadedFiles.length > 0) {
      setPendingFiles((prev) => [...prev, ...uploadedFiles])
    }
    return uploadedFiles
  }

  const clearPendingFiles = () => {
    setPendingFiles([])
  }

  const value = {
    currentChat,
    chatId,
    loading,
    uploadingFiles,
    pendingFiles,
    fetchChat,
    createNewChat,
    sendMessage,
    deleteChat,
    setCurrentChat,
    addUploadingFile,
    removeUploadingFile,
    clearUploadingFiles,
    uploadFiles,
    uploadFilesAndAddToPending,
    clearPendingFiles,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
