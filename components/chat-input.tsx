"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SendHorizonal } from "lucide-react"
import { FormEvent } from "react"

interface ChatInputProps {
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void
  isLoading?: boolean
}

export function ChatInput({ 
  input, 
  handleInputChange, 
  handleSubmit, 
  isLoading 
}: ChatInputProps) {
  return (
    <form 
      onSubmit={handleSubmit}
      className="flex items-center gap-2 border-t p-4"
    >
      <Input
        value={input}
        onChange={handleInputChange}
        placeholder="Ask about the Quran..."
        disabled={isLoading}
        className="flex-1"
      />
      <Button 
        type="submit" 
        size="icon"
        disabled={isLoading || !input.trim()}
      >
        <SendHorizonal className="h-4 w-4" />
      </Button>
    </form>
  )
}