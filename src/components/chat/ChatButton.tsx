
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

export function ChatButton() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          size="icon"
          variant="default"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] h-[80vh] p-0">
        <SheetHeader className="px-4 py-2 border-b">
          <SheetTitle>ChoreChart Assistant</SheetTitle>
        </SheetHeader>
        <div className="h-[calc(100%-53px)]">
          <ChatInterface />
        </div>
      </SheetContent>
    </Sheet>
  );
}
