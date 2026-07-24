import { useEffect, useState } from "react";
import type { Message } from "./types/Message";
import type { Conversation } from "./types/Conversation";
import "./App.css";

import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";

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

const loadConversations = (): Conversation[] => {
  const savedConversations =
    localStorage.getItem("conversations");

  if (!savedConversations) {
    return [createNewConversation()];
  }

  try {
    const parsedConversations: Conversation[] =
      JSON.parse(savedConversations);

    if (parsedConversations.length === 0) {
      return [createNewConversation()];
    }

    return parsedConversations;
  } catch {
    return [createNewConversation()];
  }
};

function App() {
  const [isAuthenticated, setIsAuthenticated] =
    useState<boolean>(() =>
      Boolean(localStorage.getItem("authToken")),
    );

  const [prompt, setPrompt] = useState("");

  const [conversations, setConversations] =
    useState<Conversation[]>(loadConversations);

  const [
    currentConversationId,
    setCurrentConversationId,
  ] = useState<string>(() => conversations[0].id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentConversation = conversations.find(
    (conversation) =>
      conversation.id === currentConversationId,
  );

  useEffect(() => {
    localStorage.setItem(
      "conversations",
      JSON.stringify(conversations),
    );
  }, [conversations]);

  const handleSelectConversation = (
    conversationId: string,
  ) => {
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

  const handleDeleteConversation = (
    conversationId: string,
  ) => {
    setConversations((currentConversations) => {
      const remainingConversations =
        currentConversations.filter(
          (conversation) =>
            conversation.id !== conversationId,
        );

      if (remainingConversations.length === 0) {
        const newConversation =
          createNewConversation();

        setCurrentConversationId(
          newConversation.id,
        );

        return [newConversation];
      }

      if (
        conversationId === currentConversationId
      ) {
        setCurrentConversationId(
          remainingConversations[0].id,
        );
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
        if (
          conversation.id !== conversationId
        ) {
          return conversation;
        }

        return {
          ...conversation,

          title:
            conversation.title === "New Chat" &&
            message.sender === "user"
              ? message.text.slice(0, 35)
              : conversation.title,

          messages: [
            ...conversation.messages,
            message,
          ],

          updatedAt: new Date(),
        };
      }),
    );
  };

  const updateMessageInConversation = (
    conversationId: string,
    messageId: string,
    text: string,
  ) => {
    setConversations((currentConversations) =>
      currentConversations.map((conversation) => {
        if (
          conversation.id !== conversationId
        ) {
          return conversation;
        }

        return {
          ...conversation,

          messages: conversation.messages.map(
            (message) =>
              message.id === messageId
                ? {
                    ...message,
                    text,
                  }
                : message,
          ),

          updatedAt: new Date(),
        };
      }),
    );
  };

  const handleNewChat = () => {
    const newConversation =
      createNewConversation();

    setConversations(
      (currentConversations) => [
        newConversation,
        ...currentConversations,
      ],
    );

    setCurrentConversationId(
      newConversation.id,
    );

    setPrompt("");
    setError("");
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");

    setIsAuthenticated(false);
  };

  const sendPrompt = async () => {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      setError("Please enter a question.");
      return;
    }

    const token =
      localStorage.getItem("authToken");

    if (!token) {
      setIsAuthenticated(false);
      setError("Please log in again.");
      return;
    }

    const activeConversationId =
      currentConversationId;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      sender: "user",
      text: trimmedPrompt,
      createdAt: new Date(),
    };

    addMessageToConversation(
      activeConversationId,
      userMessage,
    );

    setPrompt("");
    setLoading(true);
    setError("");

    try {
      const apiResponse = await fetch(
        "http://localhost:5136/api/AI/chat/stream",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            prompt: trimmedPrompt,
          }),
        },
      );

      if (apiResponse.status === 401) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");

        setIsAuthenticated(false);

        throw new Error(
          "Your login session has expired.",
        );
      }

      if (!apiResponse.ok) {
        throw new Error(
          "Backend request failed.",
        );
      }

      if (!apiResponse.body) {
        throw new Error(
          "Response stream is not available.",
        );
      }

      const aiMessageId =
        crypto.randomUUID();

      const aiMessage: Message = {
        id: aiMessageId,
        sender: "ai",
        text: "",
        createdAt: new Date(),
      };

      addMessageToConversation(
        activeConversationId,
        aiMessage,
      );

      const reader =
        apiResponse.body.getReader();

      const decoder = new TextDecoder();

      let completeText = "";

      while (true) {
        const { value, done } =
          await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, {
          stream: true,
        });

        if (chunk && completeText === "") {
          setLoading(false);
        }

        completeText += chunk;

        updateMessageInConversation(
          activeConversationId,
          aiMessageId,
          completeText,
        );
      }

      const finalChunk = decoder.decode();

      if (finalChunk) {
        completeText += finalChunk;

        updateMessageInConversation(
          activeConversationId,
          aiMessageId,
          completeText,
        );
      }
    } catch (requestError) {
      console.error(requestError);

      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not connect to the backend.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Login
        onLoginSuccess={() =>
          setIsAuthenticated(true)
        }
      />
    );
  }

  return (
    <main className="app">
      <Sidebar
        conversations={conversations}
        currentConversationId={
          currentConversationId
        }
        onNewChat={handleNewChat}
        onSelectConversation={
          handleSelectConversation
        }
        onDeleteConversation={
          handleDeleteConversation
        }
        onRenameConversation={
          handleRenameConversation
        }
      />

      <section className="chat-card">
        <div className="chat-header">
          <div>
            <h1>AI Assistant</h1>

            <p>
              Ask a question and receive an
              AI-generated response.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        <ChatWindow
          messages={
            currentConversation?.messages ?? []
          }
          loading={loading}
        />

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

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