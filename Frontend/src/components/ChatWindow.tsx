import { useEffect, useRef } from 'react'
import type { Message } from '../types/Message'
import ChatMessage from './ChatMessage'
import TypingIndicator from "./TypingIndicator";

type ChatWindowProps = {
  messages: Message[]
  loading: boolean
}

function ChatWindow({
  messages,
  loading,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages, loading])

  return (
    <div className="messages">
      {messages.map((message, index) => (
        <ChatMessage
          key={`${message.sender}-${index}`}
          message={message}
        />
      ))}

      {loading && <TypingIndicator />}

      <div ref={messagesEndRef} />
    </div>
  )
}

export default ChatWindow