"use client"
import { useChat } from "../context/ChatContext"

const ChatSidebar = ({ isOpen, onClose, onNewChat, onLogout }) => {
  const { chats, currentChat, fetchChat, deleteChat } = useChat()

  const handleChatSelect = (chatId) => {
    fetchChat(chatId)
    onClose()
  }

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation()
    if (window.confirm("Are you sure you want to delete this chat?")) {
      await deleteChat(chatId)
    }
  }

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40" onClick={onClose}></div>}

      <aside
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } fixed lg:relative lg:translate-x-0 inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-transform duration-300`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={onNewChat}
            className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Chat History</h3>
          <div className="space-y-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleChatSelect(chat.id)}
                className={`p-3 rounded-lg cursor-pointer transition group ${
                  currentChat?._id === chat.id
                    ? "bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-500/40"
                    : "hover:bg-gray-100 dark:hover:bg-gray-900 border border-transparent"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{chat.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{chat.lastMessage}</p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteChat(e, chat.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition"
                  >
                    <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onLogout}
            className="w-full text-red-600 dark:text-red-400 px-4 py-3 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}

export default ChatSidebar
