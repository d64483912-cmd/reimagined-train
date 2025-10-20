"use client"

import { useState } from "react"
import { Menu, X, Plus, Settings, User, Moon, Sun, Type, Info } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function Sidebar() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [fontSize, setFontSize] = useState("base")
  const [profileOpen, setProfileOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)

  const fontSizes = [
    { label: "Small", value: "sm" },
    { label: "Normal", value: "base" },
    { label: "Large", value: "lg" },
    { label: "Extra Large", value: "xl" },
  ]

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
      <SheetContent side="left" className="w-64 p-0 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold">Menu</h2>
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
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-10 px-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Type className="h-4 w-4" />
                  <span>Font Size</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Font Size</DialogTitle>
                  <DialogDescription>
                    Choose your preferred font size for better readability
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  {fontSizes.map((size) => (
                    <Button
                      key={size.value}
                      variant={fontSize === size.value ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => {
                        setFontSize(size.value)
                        document.documentElement.style.fontSize = 
                          size.value === "sm" ? "14px" :
                          size.value === "base" ? "16px" :
                          size.value === "lg" ? "18px" :
                          "20px"
                      }}
                    >
                      <span className={`text-${size.value}`}>{size.label}</span>
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

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
          <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-10 px-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>User Profile</DialogTitle>
                <DialogDescription>
                  Manage your profile information
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                    NP
                  </div>
                  <div>
                    <p className="font-semibold">Nelson-GPT User</p>
                    <p className="text-sm text-slate-500">Pediatric Assistant</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Account Information</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Email: user@nelson-gpt.local
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Status: Active
                  </p>
                </div>
                <Button className="w-full" variant="outline">
                  Edit Profile
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* About */}
          <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-10 px-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Info className="h-4 w-4" />
                <span>About</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>About Nelson-GPT</DialogTitle>
                <DialogDescription>
                  Smart Pediatric Medical Assistant
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Version</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">1.0.0</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Nelson-GPT is an AI-powered pediatric medical assistant built with Next.js, 
                    LangChain, and Mistral AI. It provides intelligent medical guidance based on 
                    Nelson Textbook of Pediatrics.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Technology Stack</h3>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <li>• Next.js 15.5.3</li>
                    <li>• React 19</li>
                    <li>• TypeScript 5.0</li>
                    <li>• Tailwind CSS 3.4</li>
                    <li>• Mistral AI</li>
                    <li>• Supabase PostgreSQL</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Status</h3>
                  <p className="text-sm text-green-600 dark:text-green-400">✓ Production Ready</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Powered by Nelson Textbook of Pediatrics
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
