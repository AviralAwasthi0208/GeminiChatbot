"use client"

import { useEffect, useState } from "react"

const STORAGE_KEY = "theme"

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState("light")

  useEffect(() => {
    setMounted(true)
    const root = document.documentElement
    
    // Check localStorage first
    const stored = localStorage.getItem(STORAGE_KEY)
    
    // Also check if dark class is already on html element (from system preference or previous session)
    const isDarkMode = root.classList.contains("dark")
    
    // Determine initial theme
    let initialTheme = "light"
    if (stored === "dark" || stored === "light") {
      initialTheme = stored
    } else if (isDarkMode) {
      initialTheme = "dark"
    } else {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      initialTheme = prefersDark ? "dark" : "light"
    }
    
    setTheme(initialTheme)
    applyTheme(initialTheme)
  }, [])

  const applyTheme = (nextTheme) => {
    const root = document.documentElement
    if (nextTheme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
    localStorage.setItem(STORAGE_KEY, nextTheme)
  }

  const toggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const nextTheme = theme === "dark" ? "light" : "dark"
    setTheme(nextTheme)
    applyTheme(nextTheme)
  }

  if (!mounted) {
    // Return a placeholder button to prevent layout shift
    return (
      <button
        className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all border bg-white text-gray-900 border-gray-300"
        disabled
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full text-xs bg-black text-yellow-300">
          ☀
        </span>
        <span>Light</span>
      </button>
    )
  }

  const isDark = theme === "dark"

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all border cursor-pointer
        ${isDark
          ? "bg-black text-yellow-300 border-yellow-400 hover:border-yellow-300 hover:bg-gray-900"
          : "bg-white text-gray-900 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        }`}
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs transition-colors
          ${isDark ? "bg-yellow-400 text-black" : "bg-black text-yellow-300"}`}
      >
        {isDark ? "☾" : "☀"}
      </span>
      <span>{isDark ? "Dark" : "Light"}</span>
    </button>
  )
}

