import React, { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"

type Theme = "dark" | "light"

type ThemeProviderProps = {
  children: React.ReactNode
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  const { user, updateUser } = useAuth();
  const [theme, setTheme] = useState<Theme>("light");
  
  useEffect(() => {
    const isDark = user?.preferences?.darkMode || false;
    setTheme(isDark ? "dark" : "light");
  }, [user?.preferences?.darkMode])

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
  }, [theme])

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  }

  return (
    <ThemeProviderContext.Provider {...props} value={{ theme, setTheme: handleSetTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")
  return context
}
