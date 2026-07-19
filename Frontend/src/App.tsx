import { useEffect, useState } from "react";
import type { Message } from "./types/Message";
import type { Conversation } from "./types/Conversation";
import "./App.css";

import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";

type ChatResponse = {
  message: string;
};

const createNewConversation = (): Conversation => {
  const now = new Date();

  return {
    id: crypto.randomUUID(),
    title: "New Chat",
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
};

function App() {
  const [prompt, setPrompt] = useState("");

  const [conversations, setConversations] =
  useState<Conversation[]>(() => {
    const savedConversations =
      localStorage.getItem("conversations");

    if (savedConversations) {
      return JSON.parse(savedConversations);
    }

    return [createNewConversation()];
  });
  const handleSelectConversation = (conversationId: string) => {
  setCurrentConversationId(conversationId);
  setPrompt("");
  setError("");
};

  const handleRenameConversation = (
  conversationId: string,
  newTitle: string,
) => {
  const trimmedTitle = newTitle.trim();

  if (!trimmedTitle) {
    return;
  }

  setConversations((currentConversations) =>
    currentConversations.map((conversation) =>
      conversation.id === conversationId
        ? {
            ...conversation,
            title: trimmedTitle,
            updatedAt: new Date(),
          }
        : conversation,
    ),
  );
};

  const [currentConversationId, setCurrentConversationId] =
  useState<string>(() => {
    const savedConversations =
      localStorage.getItem("conversations");

    if (savedConversations) {
      const conversations: Conversation[] =
        JSON.parse(savedConversations);

      return conversations[0].id;
    }

    return createNewConversation().id;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentConversation = conversations.find(
    (conversation) => conversation.id === currentConversationId,
  );
  useEffect(() => {
  localStorage.setItem(
    "conversations",
    JSON.stringify(conversations)
  );
}, [conversations]);  
 const handleDeleteConversation = (conversationId: string) => {
  setConversations((currentConversations) => {
    const remainingConversations = currentConversations.filter(
      (conversation) => conversation.id !== conversationId,
    );

    if (remainingConversations.length === 0) {
      const newConversation = createNewConversation();
      setCurrentConversationId(newConversation.id);

      return [newConversation];
    }

    if (conversationId === currentConversationId) {
      setCurrentConversationId(remainingConversations[0].id);
    }

    return remainingConversations;
  });

  setPrompt("");
  setError("");
};

  const addMessageToConversation = (
    conversationId: string,
    message: Message,
  ) => {
    setConversations((currentConversations) =>
      currentConversations.map((conversation) => {
        if (conversation.id !== conversationId) {
          return conversation;
        }

        return {
  ...conversation,

  title:
    conversation.title === "New Chat" && message.sender === "user"
      ? message.text.slice(0, 35)
      : conversation.title,

  messages: [...conversation.messages, message],

  updatedAt: new Date(),
};
      }),
    );
  };

  const handleNewChat = () => {
    const newConversation = createNewConversation();

    setConversations((currentConversations) => [
      newConversation,
      ...currentConversations,
    ]);

    setCurrentConversationId(newConversation.id);
    setPrompt("");
    setError("");
  };

  const sendPrompt = async () => {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      setError("Please enter a question.");
      return;
    }

    const activeConversationId = currentConversationId;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      sender: "user",
      text: trimmedPrompt,
      createdAt: new Date(),
    };

    addMessageToConversation(activeConversationId, userMessage);

    setPrompt("");
    setLoading(true);
    setError("");

    try {
      const apiResponse = await fetch(
        "http://localhost:5136/api/AI/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: trimmedPrompt,
          }),
        },
      );

      if (!apiResponse.ok) {
        throw new Error("Backend request failed.");
      }

      const data: ChatResponse = await apiResponse.json();

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        sender: "ai",
        text: data.message,
        createdAt: new Date(),
      };

      addMessageToConversation(activeConversationId, aiMessage);
    } catch (requestError) {
      console.error(requestError);
      setError("Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app">
      <Sidebar
  conversations={conversations}
  currentConversationId={currentConversationId}
  onNewChat={handleNewChat}
  onSelectConversation={handleSelectConversation}
  onDeleteConversation={handleDeleteConversation}
/>

      <section className="chat-card">
        <h1>AI Assistant</h1>

        <p>Ask a question and receive an AI-generated response.</p>

        <ChatWindow
          messages={currentConversation?.messages ?? []}
          loading={loading}
        />

        {error && <p className="error-message">{error}</p>}

        <ChatInput
          prompt={prompt}
          loading={loading}
          setPrompt={setPrompt}
          sendPrompt={sendPrompt}
        />
      </section>
    </main>
  );
}

export default App;