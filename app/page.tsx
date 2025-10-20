"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { HelpCircle } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { ChatInput } from "@/components/chat-input"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { SplashScreen } from "@/components/splash-screen"
import { Button } from "@/components/ui/button"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (message: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    // TODO: Replace with actual Supabase API call
    // For now, simulate a response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Thank you for your question about pediatrics. This is a placeholder response. Once you provide Supabase credentials, I'll integrate the actual Nelson-GPT API.\n\n**Your question:** ${message}\n\n---\n\n### Response\n\nThis is a **markdown-enabled** response that supports:\n\n- **Bold text**\n- *Italic text*\n- \`inline code\`\n- [Links](https://example.com)\n\n#### Code Example\n\n\`\`\`python\ndef pediatric_assessment():\n    return "Nelson-GPT is ready"\n\`\`\`\n\n#### Table Example\n\n| Symptom | Age Group | Severity |\n|---------|-----------|----------|\n| Fever | 0-2 years | High |\n| Cough | 2-5 years | Medium |\n| Rash | 5+ years | Low |`,
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <Sidebar />
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
            Nelson-GPT
          </h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              {/* Mascot */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <div className="w-20 h-20 bg-slate-900 dark:bg-slate-100 rounded-full flex items-center justify-center">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-white dark:bg-slate-900 rounded-full" />
                    <div className="w-2 h-2 bg-white dark:bg-slate-900 rounded-full" />
                  </div>
                </div>
              </motion.div>

              {/* Welcome Message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center"
              >
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-2">
                  Looking for something specific?
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Ask me anything about pediatrics
                </p>
              </motion.div>
            </div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-2xl rounded-2xl px-6 py-4 ${
                        msg.role === "user"
                          ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                          : "bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <MarkdownRenderer content={msg.content} />
                      ) : (
                        <p className="text-base">{msg.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl px-6 py-4">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Help Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-32 right-6 rounded-full h-10 w-10 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <HelpCircle className="h-5 w-5" />
      </Button>

      {/* Chat Input */}
      <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
    </div>
  )
}
