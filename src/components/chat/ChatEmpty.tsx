
import { motion } from "framer-motion";

export function ChatEmpty() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="text-center text-muted-foreground p-4"
    >
      <p>Ask about chores, household management, or anything else...</p>
      <p className="text-sm mt-1">Your conversation will be saved locally.</p>
    </motion.div>
  );
}
