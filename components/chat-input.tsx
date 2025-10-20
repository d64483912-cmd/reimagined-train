"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Globe, FastForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading?: boolean
}

export function ChatInput({ onSend, isLoading = false }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px"
    }
  }, [message])

  const handleSend = () => {
    if (message.trim()) {
      onSend(message)
      setMessage("")
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 shadow-lg">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message NelsonGPT…"
            className="resize-none border-0 bg-transparent focus-visible:ring-0 p-0 text-base placeholder:text-slate-400 dark:placeholder:text-slate-500"
            rows={1}
          />

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full h-9 px-3 gap-2 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <FastForward className="h-4 w-4" />
                <span className="text-xs">Quick</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="rounded-full h-9 px-3 gap-2 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Globe className="h-4 w-4" />
              </Button>
            </div>

            <Button
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
              className="rounded-full h-9 w-9 p-0 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-black"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
