import { Message } from "ai"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4",
        message.role === "assistant" && "bg-muted/50"
      )}
    >
      <Avatar>
        <AvatarFallback>
          {message.role === "assistant" ? "Q" : "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">
            {message.role === "assistant" ? "Quran Assistant" : "You"}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {message.content}
        </p>
      </div>
    </div>
  )
}