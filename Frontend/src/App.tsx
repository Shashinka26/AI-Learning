import { useState } from 'react'
import './App.css'

type ChatResponse = {
  message: string
}

function App() {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const sendPrompt = async () => {
    if (!prompt.trim()) {
      setError('Please enter a question.')
      return
    }

    setLoading(true)
    setError('')
    setResponse('')

    try {
      const apiResponse = await fetch(
        'http://localhost:5136/api/AI/chat',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt,
          }),
        },
      )

      if (!apiResponse.ok) {
        throw new Error('Backend request failed.')
      }

      const data: ChatResponse = await apiResponse.json()
      setResponse(data.message)
    } catch {
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

        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Type your question..."
          rows={6}
        />

        <button type="button" onClick={sendPrompt} disabled={loading}>
          {loading ? 'Thinking...' : 'Send'}
        </button>

        {error && <div className="error">{error}</div>}

        {response && (
          <div className="response">
            <h2>AI Response</h2>
            <p>{response}</p>
          </div>
        )}
      </section>
    </main>
  )
}

export default App