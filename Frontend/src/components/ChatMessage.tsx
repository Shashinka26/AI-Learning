import type { Message } from "../types/Message";

type ChatMessageProps = {
  message: Message;
};

function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className={`message ${message.sender}`}>
      <strong>
        {message.sender === "user" ? "You" : "AI"}
      </strong>

      <p>{message.text}</p>
    </div>
  );
}

export default ChatMessage;