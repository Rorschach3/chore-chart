
import React from "react";
import { motion } from "framer-motion";
import { Message } from "./types";
import { Loader2 } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  isLastMessage: boolean;
  isTyping: boolean;
  currentTypedText: string;
}

export function MessageBubble({ 
  message, 
  isLastMessage, 
  isTyping, 
  currentTypedText 
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser
            ? "bg-primary text-primary-foreground ml-4 shadow-sm"
            : "bg-muted mr-4 shadow-sm"
        }`}
      >
        {message.content}
        {isLastMessage && message.role === "assistant" && isTyping && (
          currentTypedText || (
            <span className="inline-flex items-center">
              <span className="ml-1 animate-pulse">...</span>
            </span>
          )
        )}
      </div>
    </motion.div>
  );
}
