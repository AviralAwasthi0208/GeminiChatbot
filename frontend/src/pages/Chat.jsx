"use client"

import { useState } from "react"
import { useChat } from "../context/ChatContext"

import ChatSidebar from "../components/ChatSidebar"
import ChatMessages from "../components/ChatMessages"
import ChatInput from "../components/ChatInput"
import ThemeToggle from "../components/ThemeToggle"

const Chat = () => {
  const { currentChat, createNewChat } = useChat()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleNewChat = async () => {
    await createNewChat()
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0b0b0f] text-gray-900 dark:text-gray-100">

      {/* Sidebar */}
      {sidebarOpen && (
        <ChatSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNewChat={handleNewChat}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">

          <div className="flex items-center gap-3">
            {/* SINGLE Sidebar Toggle Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {/* Icon changes based on state */}
              {sidebarOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            <h1 className="text-lg font-semibold">
              {currentChat?.title || "Gemini Chatbot"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChat}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
            >
              New Chat
            </button>
            <ThemeToggle />
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {currentChat ? (
            <>
              <ChatMessages />
              <ChatInput />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <h2 className="text-2xl font-bold mb-2">Start a New Chat</h2>
                <p className="text-gray-500 mb-6">
                  Create a new chat to begin your conversation
                </p>
                <button
                  onClick={handleNewChat}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
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
