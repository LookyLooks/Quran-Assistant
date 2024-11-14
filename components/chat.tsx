'use client'

import { ToolInvocation } from 'ai'
import { Message, useChat } from 'ai/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { SendHorizonal, Loader2, Volume2 } from "lucide-react"
import { useState, useRef  } from 'react'

export function Chat() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    maxSteps: 1,
    onResponse: () => {
      setIsSubmitting(false)
    },
    onError: (error) => {
      console.error('Chat error:', error)
      setIsSubmitting(false)
    }
  })

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    await handleSubmit(e)
  }

  const playAudio = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
    }
  };

  

  const renderToolResult = (toolInvocation: ToolInvocation) => {
    if (!('result' in toolInvocation)) {
      return (
        <div className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      )
    }

    switch (toolInvocation.toolName) {
        case 'getVerseByKey': {
            const verse = toolInvocation.result
            return (
              <div className="mt-4 border-l-2 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-muted-foreground">
                    Verse {verse.verseKey}
                  </div>
                  {verse.audioUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => playAudio(verse.audioUrl)}
                      className="flex items-center gap-2"
                    >
                      <Volume2 className="h-4 w-4" />
                      Play Audio
                    </Button>
                  )}
                </div>
                {/* ... rest of verse display ... */}
              </div>
            )
          }

      case 'getUthmaniScript': {
        const verses = toolInvocation.result
        return (
          <div className="mt-4 space-y-4">
            {verses.map((verse: any, index: number) => (
              <div key={index} className="border-l-2 pl-4">
                <div className="text-xs text-muted-foreground mb-2">
                  Verse {verse.verseKey}
                </div>
                <div className="text-right font-arabic text-lg">
                  {verse.text}
                </div>
              </div>
            ))}
          </div>
        )
      }

      case 'getTafsir': {
        const tafsir = toolInvocation.result
        return (
          <div className="mt-4 bg-muted/50 rounded-lg p-4">
            <div className="text-sm mb-4">{tafsir.text}</div>
            <div className="text-xs text-muted-foreground">
              Source: {tafsir.authorName} ({tafsir.language})
            </div>
          </div>
        )
      }

      default:
        return (
          <div className="text-sm text-muted-foreground mt-2">
            {JSON.stringify(toolInvocation.result, null, 2)}
          </div>
        )
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <audio ref={audioRef} className="hidden" />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m: Message) => (
          <Card key={m.id} className={`p-4 ${m.role === 'assistant' ? 'bg-muted' : ''}`}>
            <div className="flex flex-col space-y-2">
              <div className="font-medium">
                {m.role === 'assistant' ? 'Quran Assistant' : 'You'}:
              </div>
              <div className="text-sm">{m.content}</div>
              {m.toolInvocations?.map((toolInvocation: ToolInvocation) => (
                <div key={toolInvocation.toolCallId}>
                  {renderToolResult(toolInvocation)}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Chat Input */}
      <form 
        onSubmit={onSubmit}
        className="p-4 border-t flex gap-2"
      >
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about the Quran..."
          className="flex-1"
          disabled={isSubmitting}
        />
        <Button type="submit" size="icon" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizonal className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  )
}