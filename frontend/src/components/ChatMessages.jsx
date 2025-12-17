"use client"

import { useEffect, useRef } from "react"
import { useChat } from "../context/ChatContext"

const ChatMessages = () => {
  const { currentChat, uploadingFiles } = useChat()
  const messagesEndRef = useRef(null)

  useEffect(() => {
    scrollToBottom()
  }, [currentChat?.messages, uploadingFiles])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  if (!currentChat) {
    return null
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 dark:bg-[#0b0b0f] transition-colors">
      {currentChat.messages.map((message, index) => (
        <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-3xl rounded-2xl px-6 py-4 ${
              message.role === "user"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-900 border border-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-800"
            }`}
          >
            {message.files && message.files.length > 0 && (
              <div className="mb-3 space-y-2">
                {message.files.map((file, fileIndex) => (
                  <div key={fileIndex} className="flex items-center gap-2">
                    {file.type === "image" ? (
                      <img
                        src={
                          file.base64 
                            ? `data:${file.mimeType || "image/png"};base64,${file.base64}` 
                            : file.imagePart?.inlineData?.data 
                              ? `data:${file.imagePart.inlineData.mimeType || "image/png"};base64,${file.imagePart.inlineData.data}`
                              : file.url || "/placeholder.svg"
                        }
                        alt={file.originalName}
                        className="max-w-xs rounded-lg"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span>{file.originalName}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          </div>
        </div>
      ))}
      
      {/* Display uploading files with ChatGPT-style loading indicator */}
      {uploadingFiles.length > 0 && (
        <div className="flex justify-end">
          <div className="max-w-3xl rounded-2xl px-6 py-4 bg-indigo-600 text-white">
            <div className="space-y-3">
              {uploadingFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-3">
                  {file.type === "image" && file.preview ? (
                    <div className="relative">
                      <img
                        src={file.preview}
                        alt={file.originalName}
                        className="max-w-xs rounded-lg opacity-90"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10 rounded-lg">
                        <div className="flex gap-1.5">
                          <div className="w-1.5 h-1.5 bg-white rounded-full opacity-75" style={{ animation: 'bounce 1.4s infinite', animationDelay: '0ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-white rounded-full opacity-75" style={{ animation: 'bounce 1.4s infinite', animationDelay: '200ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-white rounded-full opacity-75" style={{ animation: 'bounce 1.4s infinite', animationDelay: '400ms' }}></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 flex-shrink-0 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="text-sm">{file.originalName}</span>
                      <div className="flex gap-1 ml-2">
                        <div className="w-1 h-1 bg-white rounded-full opacity-70" style={{ animation: 'bounce 1.4s infinite', animationDelay: '0ms' }}></div>
                        <div className="w-1 h-1 bg-white rounded-full opacity-70" style={{ animation: 'bounce 1.4s infinite', animationDelay: '200ms' }}></div>
                        <div className="w-1 h-1 bg-white rounded-full opacity-70" style={{ animation: 'bounce 1.4s infinite', animationDelay: '400ms' }}></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  )
}

export default ChatMessages
