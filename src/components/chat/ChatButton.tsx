
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ChatInterface } from "./ChatInterface";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-mobile";

export function ChatButton() {
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Button
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
            size="icon"
            variant="default"
          >
            <MessageCircle className="h-6 w-6" />
            <span className="sr-only">Open chat assistant</span>
          </Button>
        </motion.div>
      </SheetTrigger>
      <SheetContent className="w-[90%] sm:w-[540px] h-[80vh] p-0 border-l-0 sm:border-l">
        <SheetHeader className="px-4 py-2 border-b">
          <SheetTitle className="flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              ChoreChart Assistant
            </motion.span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-auto" 
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </SheetTitle>
        </SheetHeader>
        <div className="h-[calc(100%-53px)]">
          <ChatInterface />
        </div>
      </SheetContent>
    </Sheet>
  );
}
