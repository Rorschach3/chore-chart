
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Send, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentTypedText, setCurrentTypedText] = useState("");
  const [fullResponseText, setFullResponseText] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  };

  // Focus textarea when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentTypedText]);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea
        ref={scrollAreaRef}
        className="flex-1 p-4 space-y-4"
      >
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center text-muted-foreground p-4"
            >
              <p>Ask about chores, household management, or anything else...</p>
              <p className="text-sm mt-1">Your conversation will be saved locally.</p>
            </motion.div>
          ) : (
            messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground ml-4 shadow-sm"
                      : "bg-muted mr-4 shadow-sm"
                  }`}
                >
                  {message.content}
                  {index === messages.length - 1 && message.role === "assistant" && isTyping && (
                    currentTypedText || <span className="animate-pulse">...</span>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
        {isLoading && !isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2 mr-4 shadow-sm flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Thinking...
            </div>
          </div>
        )}
      </ScrollArea>
      <form
        onSubmit={handleSubmit}
        className="border-t p-4 flex gap-2 items-end"
      >
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            adjustTextareaHeight(e);
          }}
          placeholder="Ask about chores, household management, or anything else..."
          className="min-h-[60px] max-h-[120px] resize-none transition-all"
          onKeyDown={handleKeyDown}
        />
        <div className="flex flex-col gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  size="icon"
                  disabled={isLoading || !input.trim()}
                  className="transition-all duration-200"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Send message</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {messages.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    type="button" 
                    size="icon" 
                    variant="outline" 
                    onClick={clearChat}
                    className="transition-all duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">Clear chat history</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </form>
    </div>
  );
}
