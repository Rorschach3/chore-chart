
import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageBubble } from "./MessageBubble";
import { ChatEmpty } from "./ChatEmpty";
import { ChatTypingIndicator } from "./ChatTypingIndicator";
import { ChatInput } from "./ChatInput";
import { Message } from "./types";
import { useCallback } from "react";

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentTypedText, setCurrentTypedText] = useState("");
  const [fullResponseText, setFullResponseText] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, []);

  // Focus textarea when component mounts
  useEffect(() => {
    scrollToBottom();
  }, [messages, currentTypedText, scrollToBottom]);

  // Load messages from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("chat_messages");
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Failed to parse saved messages:", e);
      }
    }
  }, []);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chat_messages", JSON.stringify(messages));
    }
  }, [messages]);

  // Typing effect for AI responses
  useEffect(() => {
    if (isTyping && fullResponseText) {
      let index = 0;
      const typingInterval = setInterval(() => {
        if (index < fullResponseText.length) {
          setCurrentTypedText(fullResponseText.substring(0, index + 1));
          index++;
        } else {
          setIsTyping(false);
          setCurrentTypedText("");
          setFullResponseText("");
          clearInterval(typingInterval);
          
          // Add the complete message to the messages array
          setMessages(prev => {
            const newMessages = [...prev];
            // Remove the last message if it's from the assistant (the typing indicator)
            if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === "assistant") {
              newMessages.pop();
            }
            return [...newMessages, { role: "assistant", content: fullResponseText }];
          });
        }
      }, 15); // Adjust typing speed here
      
      return () => clearInterval(typingInterval);
    }
  }, [isTyping, fullResponseText]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-with-ai", {
        body: { prompt: userMessage },
      });

      if (error) {
        console.error("Chat error:", error);
        throw error;
      }

      // If we received a response but no generatedText, handle it as an error
      if (!data || !data.generatedText) {
        throw new Error("No response received from the assistant");
      }

      // Start typing animation
      setIsTyping(true);
      setFullResponseText(data.generatedText);
      
      // Add a temporary message that will be updated by the typing effect
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "" },
      ]);
      
    } catch (error) {
      console.error("Chat error:", error);
      
      // Add a message from the assistant explaining the error
      setMessages(prev => [
        ...prev,
        { 
          role: "assistant", 
          content: "I apologize, but I'm currently experiencing technical difficulties. " +
            "This could be due to service limits or connectivity issues. Please try again later."
        },
      ]);
      
      toast({
        title: "Chat Service Unavailable",
        description: "The chat assistant is currently unavailable. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("chat_messages");
    toast({
      title: "Chat cleared",
      description: "Your conversation history has been cleared.",
    });
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea
        ref={scrollAreaRef}
        className="flex-1 p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <ChatEmpty />
        ) : (
          messages.map((message, index) => (
            <MessageBubble 
              key={index}
              message={message}
              isLastMessage={index === messages.length - 1}
              isTyping={isTyping}
              currentTypedText={currentTypedText}
            />
          ))
        )}
        
        {isLoading && !isTyping && <ChatTypingIndicator />}
      </ScrollArea>
      
      <ChatInput 
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        handleSubmit={handleSubmit}
        clearChat={clearChat}
        messageCount={messages.length}
      />
    </div>
  );
}
