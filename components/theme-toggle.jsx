"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

// Floating theme toggle with black/yellow styling for dark mode
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const isDark = theme === "dark"

  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`flex items-center gap-2 rounded-full px-4 py-2 border transition-all shadow-sm
        ${isDark
          ? "bg-black text-yellow-300 border-yellow-400 hover:border-yellow-300"
          : "bg-white text-gray-900 border-gray-300 hover:border-gray-400"
        }`}
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors
          ${isDark ? "bg-yellow-400 text-black" : "bg-black text-yellow-300"}`}
      >
        {isDark ? <Moon size={16} /> : <Sun size={16} />}
      </span>
      <span className="text-sm font-medium">{isDark ? "Dark" : "Light"}</span>
    </button>
  )
}

