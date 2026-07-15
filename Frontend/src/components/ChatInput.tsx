import type { KeyboardEvent } from 'react'

type ChatInputProps = {
  prompt: string
  loading: boolean
  setPrompt: (value: string) => void
  sendPrompt: () => void
}

function ChatInput({
  prompt,
  loading,
  setPrompt,
  sendPrompt,
}: ChatInputProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendPrompt()
    }
  }

  return (
    <div className="chat-input">
      <textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your question..."
        rows={4}
        disabled={loading}
      />

      <button
        type="button"
        onClick={sendPrompt}
        disabled={loading}
      >
        {loading ? 'Thinking...' : 'Send'}
      </button>
    </div>
  )
}

export default ChatInput