
import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Trash2, Loader2 } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ChatInputProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  clearChat: () => void;
  messageCount: number;
}

export function ChatInput({ 
  input, 
  setInput, 
  isLoading, 
  handleSubmit, 
  clearChat,
  messageCount
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        handleSubmit(e);
      }
    }
  };

  const adjustTextareaHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  return (
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
        
        {messageCount > 0 && (
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
  );
}
