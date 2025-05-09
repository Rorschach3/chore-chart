
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function ChatTypingIndicator() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
    >
      <div className="bg-muted rounded-lg px-4 py-2 mr-4 shadow-sm flex items-center">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Thinking...
      </div>
    </motion.div>
  );
}
