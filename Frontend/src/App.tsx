import { useState } from "react";
import type { Message } from './types/Message'
import './App.css'
import ChatWindow from "./components/ChatWindow";
import ChatInput from './components/ChatInput'


type ChatResponse = {
  message: string
}

function App() {
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const sendPrompt = async () => {
   
    const trimmedPrompt = prompt.trim()

    if (!trimmedPrompt) {
      setError('Please enter a question.')
      return
    }

    const userMessage: Message = {
      sender: 'user',
      text: trimmedPrompt,
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
    ])

    setPrompt('')
    setLoading(true)
    setError('')

    try {
      const apiResponse = await fetch(
        'http://localhost:5136/api/AI/chat',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: trimmedPrompt,
          }),
        },
      )

      if (!apiResponse.ok) {
        throw new Error('Backend request failed.')
      }

      const data: ChatResponse = await apiResponse.json()

      const aiMessage: Message = {
        sender: 'ai',
        text: data.message,
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        aiMessage,
      ])
    } catch (error) {
      console.error(error)
      setError('Could not connect to the backend.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app">
      <section className="chat-card">
        <h1>AI Assistant</h1>
        <p>Ask a question and receive an AI-generated response.</p>

        <ChatWindow
  messages={messages}
  loading={loading}
/>

        <ChatInput
  prompt={prompt}
  loading={loading}
  setPrompt={setPrompt}
  sendPrompt={sendPrompt}
/>
      </section>
    </main>
  )
}

export default App