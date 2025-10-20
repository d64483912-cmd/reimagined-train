"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface MarkdownRendererProps {
  content: string
  className?: string
}

interface CodeProps {
  inline?: boolean
  children?: ReactNode
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("prose dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: (props) => (
            <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />
          ),
          h2: (props) => (
            <h2 className="text-2xl font-bold mt-5 mb-3" {...props} />
          ),
          h3: (props) => (
            <h3 className="text-xl font-bold mt-4 mb-2" {...props} />
          ),
          p: (props) => (
            <p className="text-base leading-7 mb-4" {...props} />
          ),
          ul: (props) => (
            <ul className="list-disc list-inside space-y-2 mb-4" {...props} />
          ),
          ol: (props) => (
            <ol className="list-decimal list-inside space-y-2 mb-4" {...props} />
          ),
          li: (props) => (
            <li className="text-base" {...props} />
          ),
          code: ({ inline, ...props }: CodeProps) =>
            inline ? (
              <code
                className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm font-mono"
                {...props}
              />
            ) : (
              <code
                className="block bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto text-sm font-mono mb-4"
                {...props}
              />
            ),
          pre: (props) => (
            <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto mb-4" {...props} />
          ),
          table: (props) => (
            <table className="w-full border-collapse border border-slate-300 dark:border-slate-600 mb-4" {...props} />
          ),
          thead: (props) => (
            <thead className="bg-slate-100 dark:bg-slate-800" {...props} />
          ),
          th: (props) => (
            <th className="border border-slate-300 dark:border-slate-600 px-4 py-2 text-left font-semibold" {...props} />
          ),
          td: (props) => (
            <td className="border border-slate-300 dark:border-slate-600 px-4 py-2" {...props} />
          ),
          tr: (props) => (
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-900" {...props} />
          ),
          a: (props) => (
            <a className="text-blue-600 dark:text-blue-400 underline hover:opacity-80" {...props} />
          ),
          blockquote: (props) => (
            <blockquote className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 italic text-slate-600 dark:text-slate-400 mb-4" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
