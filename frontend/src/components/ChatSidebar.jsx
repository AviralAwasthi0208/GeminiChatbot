
"use client"
import { useChat } from "../context/ChatContext"
import { showSuccess, showError, showWarning } from "../utils/toast"

export default function ChatSidebar({ onNewChat }) {
  const { chats, currentChat, fetchChat, deleteChat } = useChat()

  const confirmDelete = (chatId) => {
    showWarning(
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">
          Delete this chat permanently?
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => showWarning.dismiss?.()}
            className="px-3 py-1 text-sm rounded bg-gray-200 dark:bg-gray-700"
          >
            Cancel
          </button>

          <button
            onClick={async () => {
              try {
                await deleteChat(chatId)
                showSuccess("Chat deleted successfully")
              } catch {
                showError("Failed to delete chat")
              }
            }}
            className="px-3 py-1 text-sm rounded bg-red-600 text-white"
          >
            Delete
          </button>
        </div>
      </div>
    )
  }

  return (
    <aside className="w-80 h-full bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col">

      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={onNewChat}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          New Chat
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-3">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">
          CHAT HISTORY
        </h3>

        {chats.length === 0 && (
          <p className="text-sm text-gray-400 text-center mt-6">
            No chats yet
          </p>
        )}

        <div className="space-y-1">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => fetchChat(chat.id)}
              className={`group flex items-center justify-between gap-2 px-3 py-2 rounded-lg cursor-pointer transition ${
                currentChat?.id === chat.id
                  ? "bg-indigo-100 dark:bg-indigo-900/40"
                  : "hover:bg-gray-100 dark:hover:bg-gray-900"
              }`}
            >
              <p className="text-sm font-medium truncate flex-1">
                {chat.title}
              </p>

              {/* Delete icon */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  confirmDelete(chat.id)
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                title="Delete chat"
              >
                <svg
                  className="w-4 h-4 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7M9 7v10M15 7v10M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
