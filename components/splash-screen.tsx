"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"

interface SplashScreenProps {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onComplete()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onComplete])

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 2.5 }}
      className="fixed inset-0 bg-white dark:bg-slate-950 flex flex-col items-center justify-center z-50"
    >
      {/* Mascot Icon */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-8"
      >
        <div className="w-24 h-24 bg-slate-900 dark:bg-slate-100 rounded-full flex items-center justify-center">
          <div className="flex gap-3">
            <div className="w-2 h-2 bg-white dark:bg-slate-900 rounded-full" />
            <div className="w-2 h-2 bg-white dark:bg-slate-900 rounded-full" />
          </div>
        </div>
      </motion.div>

      {/* App Name */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2"
      >
        Nelson-GPT
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-12"
      >
        Smart Pediatric Assistant
      </motion.p>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="text-sm text-slate-500 dark:text-slate-400 absolute bottom-8"
      >
        Powered by Nelson Textbook of Pediatrics
      </motion.p>
    </motion.div>
  )
}
