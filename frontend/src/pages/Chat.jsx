"use client"

import { useState } from "react"
import { useChat } from "../context/ChatContext"
import ChatMessages from "../components/ChatMessages"
import ChatInput from "../components/ChatInput"
import ThemeToggle from "../components/ThemeToggle"

const Chat = () => {
  const { currentChat, createNewChat } = useChat()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleNewChat = async () => {
    await createNewChat()
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 dark:bg-[#0b0b0f] dark:text-gray-100 transition-colors">
      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Gemini Chatbot</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleNewChat}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition text-sm"
            >
              New Chat
            </button>
            <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col">
          {currentChat ? (
            <>
              <ChatMessages />
              <ChatInput />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Start a New Chat</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Create a new chat to begin your conversation with Gemini AI</p>
                <button
                  onClick={handleNewChat}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
                >
                  New Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Chat
