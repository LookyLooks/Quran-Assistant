export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatMessage {
  messages: Message[];
  pending?: boolean;
  id: string;
  title?: string;
}