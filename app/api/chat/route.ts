import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { z } from 'zod'

export const maxDuration = 30 // Allow streaming responses up to 30 seconds

export async function POST(req: Request) {
  try {
    console.log('🚀 Chat API called')
    const { messages } = await req.json()
    console.log('📨 Messages received:', messages)


  const result = await streamText({
    model: openai('gpt-4o'),  // or 'gpt-3.5-turbo'
    maxTokens: 4096,
    messages: [
      {
        role: 'system',
        content: `You are a knowledgeable and engaging Quran assistant who can have natural conversations about the Quran and its teachings. 

  Your capabilities include:
  - Having thoughtful discussions about Quranic verses and their meanings
  - Answering questions about Islamic concepts
  - Retrieving specific verses when requested
  - Providing scholarly interpretations when asked
  
  When responding:
  1. If the user specifically asks for verses or their meanings, use:
     - getVerseByKey for single verses
     - getChapterVerses for multiple verses
     - getTafsir for scholarly interpretations
  
  2. If the user wants to discuss or ask questions about verses they've already seen:
     - Engage in natural conversation
     - Draw from your knowledge to explain concepts
     - Only fetch new verses if explicitly requested
     - Reference previously shown verses in the discussion

  3. When providing commentary on verses:
     - Be conversational and approachable
     - Connect the teachings to modern life
     - Welcome follow-up questions
     - Encourage deeper understanding through discussion

  Remember: Not every message needs to trigger the tools - focus on having a meaningful dialogue about the Quran's wisdom and teachings.`
      },
      ...messages.map((message: any) => ({
        content: message.content,
        role: message.role,
      }))
    ],
    tools: {
      // Get verses from a chapter
      getVerseByKey: {
        description: 'Get a specific verse by its key (e.g., "1:1" for first verse of first chapter)',
        parameters: z.object({
          verseKey: z.string().describe('The verse key in format "chapter:verse" (e.g., "1:1", "2:255")'),
          language: z.string().optional().default('en').describe('Language code for translations'),
        }),
        execute: async ({ verseKey, language = 'en' }) => {
          console.log('🔧 Fetching verse:', verseKey)
          try {
            const response = await fetch(
                `https://api.quran.com/api/v4/verses/by_key/${verseKey}?language=${language}&words=true&translations=131&audio=9`
              )
              const data = await response.json()
              console.log('📦 Received verse data')
              
              const verse = data.verse
              // Construct the full audio URL
              const audioUrl = verse.audio?.url 
                ? `https://verses.quran.com/${verse.audio.url}` 
                : null
        
              return {
                verseKey: verse.verse_key,
                arabicText: verse.text_uthmani,
                translation: verse.translations[0]?.text || '',
                audioUrl: audioUrl,  // Now contains the full URL
                chapterNumber: parseInt(verseKey.split(':')[0]),
                verseNumber: parseInt(verseKey.split(':')[1])
              }
          } catch (error) {
            console.error('❌ Error fetching verse:', error)
            throw new Error('Failed to fetch verse')
          }
        },
      },

      getChapterVerses: {
        description: 'Get all verses from a specific chapter with their recitation',
        parameters: z.object({
          chapterNumber: z.number().min(1).max(114).describe('The chapter number (1-114)'),
          language: z.string().optional().default('en').describe('Language code for translations'),
          perPage: z.number().optional().default(10).describe('Number of verses per page (1-50)'),
          page: z.number().optional().default(1).describe('Page number'),
          audio: z.number().optional().default(7).describe('Reciter ID (default: 7 for Mishari Rashid al-Afasy)'),
        }),
        execute: async ({ chapterNumber, language = 'en', perPage = 10, page = 1, audio = 7 }) => {
          console.log('🔧 Fetching chapter verses:', chapterNumber)
          try {
            const response = await fetch(
              `https://api.quran.com/api/v4/verses/by_chapter/${chapterNumber}?language=${language}&words=true&translations=131&audio=${audio}&per_page=${perPage}&page=${page}`
            )
            const data = await response.json()
            console.log('📦 Received chapter verses data')
    
            return {
              verses: data.verses.map((verse: any) => ({
                verseKey: verse.verse_key,
                arabicText: verse.text_uthmani,
                translation: verse.translations[0]?.text || '',
                audioUrl: verse.audio?.url 
                  ? `https://verses.quran.com/${verse.audio.url}` 
                  : null,
                verseNumber: verse.verse_number
              })),
              pagination: data.pagination
            }
          } catch (error) {
            console.error('❌ Error fetching chapter verses:', error)
            throw new Error('Failed to fetch chapter verses')
          }
        },
      },

      // Get chapter information
      getChapterInfo: {
        description: 'Get information about a specific chapter (surah)',
        parameters: z.object({
          chapterId: z.number().min(1).max(114).describe('The chapter number (1-114)'),
        }),
        execute: async ({ chapterId }) => {
          try {
            const response = await fetch(
              `https://api.quran.com/api/v4/chapters/${chapterId}`
            )
            const data = await response.json()
            return data.chapter
          } catch (error) {
            console.error('Error fetching chapter info:', error)
            throw new Error('Failed to fetch chapter information')
          }
        },
      },

      getUthmaniScript: {
        description: 'Get Uthmani script of verses by chapter, juz, page, or verse key',
        parameters: z.object({
          chapterNumber: z.number().min(1).max(114).optional(),
          verseKey: z.string().optional(),
          pageNumber: z.number().min(1).max(604).optional(),
        }),
        execute: async ({ chapterNumber, verseKey, pageNumber }) => {
          console.log('🔧 Fetching Uthmani script')
          try {
            const params = new URLSearchParams()
            if (chapterNumber) params.append('chapter_number', chapterNumber.toString())
            if (verseKey) params.append('verse_key', verseKey)
            if (pageNumber) params.append('page_number', pageNumber.toString())

            const response = await fetch(
              `https://api.quran.com/api/v4/quran/verses/uthmani?${params}`
            )
            const data = await response.json()
            return data.verses.map((verse: any) => ({
              verseKey: verse.verse_key,
              text: verse.text_uthmani,
            }))
          } catch (error) {
            console.error('❌ Error fetching Uthmani script:', error)
            throw new Error('Failed to fetch Uthmani script')
          }
        },
      },

      // Get tafsir for a verse
      getTafsir: {
        description: 'Get tafsir (interpretation) for a specific verse',
        parameters: z.object({
          verseKey: z.string().describe('The verse key in format "chapter:verse" (e.g., "1:1")'),
          tafsirId: z.string().optional().default('en-tafisr-ibn-kathir'),
        }),
        execute: async ({ verseKey, tafsirId = 'en-tafisr-ibn-kathir' }) => {
          console.log('🔧 Fetching tafsir:', verseKey)
          try {
            const response = await fetch(
              `https://api.qurancdn.com/api/qdc/tafsirs/${tafsirId}/by_ayah/${verseKey}`
            )
            const data = await response.json()
            
            let text = data.tafsir.text
            // Clean up HTML and format text
            text = text.replace(/<[^>]+>/g, ' ')
                      .replace(/\s+/g, ' ')
                      .trim()

            return {
              text,
              authorName: data.tafsir.resource_name,
              language: data.tafsir.language_name
            }
          } catch (error) {
            console.error('❌ Error fetching tafsir:', error)
            throw new Error('Failed to fetch tafsir')
          }
        },
      },
    },
  })

  console.log('🔄 Streaming response')
    return result.toDataStreamResponse()
  } catch (error) {
    console.error('❌ API error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500 }
    )
  }
}