"use client";

import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import Sidebar from "@/components/sidebar";
import ChatInput from "@/components/chat-input";
import MarkdownRenderer from "@/components/markdown-renderer";
import SplashScreen from "@/components/splash-screen";
import { useTheme } from "next-themes";
import { sendMessage, getConversationHistory, getMedicalContext } from "@/lib/chat-service";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  sources?: any[];
  confidence?: number;
  timestamp: string;
}

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [conversationId, setConversationId] = useState<string>("");
  const [medicalContext, setMedicalContext] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // Initialize session on mount
  useEffect(() => {
    const initializeSession = async () => {
      const newSessionId = uuidv4();
      const newConversationId = uuidv4();
      
      setSessionId(newSessionId);
      setConversationId(newConversationId);
    };

    initializeSession();
  }, []);

  // Load conversation history
  useEffect(() => {
    if (conversationId) {
      loadConversationHistory();
    }
  }, [conversationId]);

  // Load medical context
  useEffect(() => {
    if (sessionId) {
      loadMedicalContext();
    }
  }, [sessionId]);

  const loadConversationHistory = async () => {
    try {
      const history = await getConversationHistory(conversationId);
      const formattedMessages = history.map((msg: any) => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        sources: msg.sources,
        confidence: msg.confidence_score,
        timestamp: msg.created_at,
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error loading conversation history:", error);
    }
  };

  const loadMedicalContext = async () => {
    try {
      const context = await getMedicalContext(sessionId);
      setMedicalContext(context);
    } catch (error) {
      console.error("Error loading medical context:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !sessionId || !conversationId) return;

    // Add user message to UI
    const userMessage: Message = {
      id: uuidv4(),
      type: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      // Send to RAG pipeline
      const response = await sendMessage(message, sessionId, conversationId);

      // Add assistant response to UI
      const assistantMessage: Message = {
        id: uuidv4(),
        type: "assistant",
        content: response.message,
        sources: response.sources,
        confidence: response.confidence,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update medical context if available
      if (response.diagnosis || response.treatment) {
        setMedicalContext({
          ...medicalContext,
          lastDiagnosis: response.diagnosis,
          lastTreatment: response.treatment,
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Add error message
      const errorMessage: Message = {
        id: uuidv4(),
        type: "assistant",
        content: "Sorry, I encountered an error processing your query. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className={`flex h-screen ${theme === "dark" ? "bg-slate-950" : "bg-white"}`}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className={`border-b ${theme === "dark" ? "border-slate-800 bg-slate-900" : "border-gray-200 bg-gray-50"} px-4 py-3`}>
          <h1 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Nelson-GPT
          </h1>
          <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}>
            Smart Pediatric Assistant
          </p>
        </div>

        {/* Messages Container */}
        <div className={`flex-1 overflow-y-auto ${theme === "dark" ? "bg-slate-950" : "bg-white"}`}>
          <div className="max-w-4xl mx-auto w-full px-4 py-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className={`text-5xl mb-4 ${theme === "dark" ? "text-slate-600" : "text-gray-300"}`}>
                    👨‍⚕️
                  </div>
                  <h2 className={`text-2xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    Welcome to Nelson-GPT
                  </h2>
                  <p className={`${theme === "dark" ? "text-slate-400" : "text-gray-600"}`}>
                    Ask me anything about pediatric medicine
                  </p>
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-2xl rounded-lg px-4 py-3 ${
                        msg.type === "user"
                          ? theme === "dark"
                            ? "bg-blue-600 text-white"
                            : "bg-blue-500 text-white"
                          : theme === "dark"
                          ? "bg-slate-800 text-slate-100"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {msg.type === "assistant" ? (
                        <MarkdownRenderer content={msg.content} />
                      ) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className={`mt-3 pt-3 border-t ${theme === "dark" ? "border-slate-700" : "border-gray-300"}`}>
                          <p className="text-xs font-semibold mb-2">Sources:</p>
                          <ul className="text-xs space-y-1">
                            {msg.sources.map((source: any, i: number) => (
                              <li key={i} className="opacity-80">
                                • {source.title} (p. {source.page})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className={`rounded-lg px-4 py-3 ${theme === "dark" ? "bg-slate-800" : "bg-gray-100"}`}>
                  <div className="flex space-x-2">
                    <div className={`w-2 h-2 rounded-full ${theme === "dark" ? "bg-slate-400" : "bg-gray-400"} animate-bounce`} />
                    <div className={`w-2 h-2 rounded-full ${theme === "dark" ? "bg-slate-400" : "bg-gray-400"} animate-bounce delay-100`} />
                    <div className={`w-2 h-2 rounded-full ${theme === "dark" ? "bg-slate-400" : "bg-gray-400"} animate-bounce delay-200`} />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Chat Input */}
        <ChatInput onSend={handleSendMessage} isLoading={loading} />
      </div>
    </div>
  );
}
