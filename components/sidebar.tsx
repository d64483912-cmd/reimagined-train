"use client"

import { useState } from "react"
import { Menu, X, Plus, Settings, User, Moon, Sun, Type } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

export function Sidebar() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-semibold">Menu</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {/* New Chat */}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-10 px-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setOpen(false)}
            >
              <Plus className="h-4 w-4" />
              <span>New Chat</span>
            </Button>

            <Separator className="my-2" />

            {/* Settings */}
            <div className="space-y-2">
              <h3 className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Settings
              </h3>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-10 px-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="h-4 w-4" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    <span>Dark Mode</span>
                  </>
                )}
              </Button>

              {/* Font Size */}
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-10 px-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Type className="h-4 w-4" />
                <span>Font Size</span>
              </Button>

              {/* Privacy */}
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-10 px-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Settings className="h-4 w-4" />
                <span>Privacy</span>
              </Button>
            </div>

            <Separator className="my-2" />

            {/* Profile */}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-10 px-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setOpen(false)}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Button>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Powered by Nelson Textbook of Pediatrics
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
