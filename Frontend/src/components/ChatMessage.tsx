import ReactMarkdown from 'react-markdown'
import type { Message } from '../types/Message'

type ChatMessageProps = {
  message: Message
}

function ChatMessage({ message }: ChatMessageProps) {
  const copyMessage = async () => {
    await navigator.clipboard.writeText(message.text)
  }

  return (
    <div className={`message ${message.sender}`}>
      <strong>{message.sender === 'user' ? '👤 You' : '🤖 AI'}</strong>

      {message.sender === 'ai' ? (
        <>
          <ReactMarkdown>{message.text}</ReactMarkdown>

          <button
            type="button"
            className="copy-button"
            onClick={copyMessage}
          >
            Copy
          </button>
        </>
      ) : (
        <p>{message.text}</p>
      )}
    </div>
  )
}

export default ChatMessage