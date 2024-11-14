"use client"

import { Message } from "ai"
import { ChatMessage } from "./chat-message"
import { useEffect, useRef } from "react"

interface ChatMessagesProps {
  messages: Message[]
  isLoading?: boolean
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto"
    >
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <span className="text-sm text-muted-foreground">
            Thinking...
          </span>
        </div>
      )}
    </div>
  )
}