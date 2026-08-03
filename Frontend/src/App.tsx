import { useEffect, useState } from "react";
import type { Message } from "./types/Message";
import type { Conversation } from "./types/Conversation";
import "./App.css";

import {
  createConversation,
  getConversations,
} from "./services/conversationService";

import { getMessages } from "./services/messageService";

import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";

function App() {
  const [isAuthenticated, setIsAuthenticated] =
    useState<boolean>(() =>
      Boolean(localStorage.getItem("authToken")),
    );

  const [prompt, setPrompt] = useState("");

  const [conversations, setConversations] =
    useState<Conversation[]>([]);

  const [
    currentConversationId,
    setCurrentConversationId,
  ] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentConversation = conversations.find(
    (conversation) =>
      conversation.id === currentConversationId,
  );

  /*
   * Load the logged-in user's conversations
   * from PostgreSQL through the backend API.
   */
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const loadUserConversations = async () => {
      setLoading(true);
      setError("");

      try {
        const loadedConversations =
          await getConversations();

        const normalizedConversations: Conversation[] =
          loadedConversations.map((conversation) => ({
            ...conversation,
            messages: conversation.messages ?? [],
            createdAt: new Date(
              conversation.createdAt,
            ),
            updatedAt: new Date(
              conversation.updatedAt,
            ),
          }));

        setConversations(normalizedConversations);

        if (normalizedConversations.length === 0) {
          setCurrentConversationId("");
          return;
        }

        const firstConversation =
          normalizedConversations[0];

        setCurrentConversationId(
          firstConversation.id,
        );

        const loadedMessages = await getMessages(
          firstConversation.id,
        );

        setConversations((currentConversations) =>
          currentConversations.map((conversation) =>
            conversation.id === firstConversation.id
              ? {
                  ...conversation,
                  messages: loadedMessages.map(
                    (message) => ({
                      ...message,
                      createdAt: new Date(
                        message.createdAt,
                      ),
                    }),
                  ),
                }
              : conversation,
          ),
        );
      } catch (loadError) {
        console.error(loadError);

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load conversations.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadUserConversations();
  }, [isAuthenticated]);

  const handleSelectConversation = async (
    conversationId: string,
  ) => {
    setCurrentConversationId(conversationId);
    setPrompt("");
    setError("");
    setLoading(true);

    try {
      const loadedMessages =
        await getMessages(conversationId);

      setConversations((currentConversations) =>
        currentConversations.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                messages: loadedMessages.map(
                  (message) => ({
                    ...message,
                    createdAt: new Date(
                      message.createdAt,
                    ),
                  }),
                ),
              }
            : conversation,
        ),
      );
    } catch (loadError) {
      console.error(loadError);

      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load messages.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    setLoading(true);
    setError("");

    try {
      const createdConversation =
        await createConversation("New Chat");

      const normalizedConversation: Conversation = {
        ...createdConversation,
        messages: [],
        createdAt: new Date(
          createdConversation.createdAt,
        ),
        updatedAt: new Date(
          createdConversation.updatedAt,
        ),
      };

      setConversations(
        (currentConversations) => [
          normalizedConversation,
          ...currentConversations,
        ],
      );

      setCurrentConversationId(
        normalizedConversation.id,
      );

      setPrompt("");
    } catch (createError) {
      console.error(createError);

      setError(
        createError instanceof Error
          ? createError.message
          : "Could not create conversation.",
      );
    } finally {
      setLoading(false);
    }
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

      if (
        conversationId === currentConversationId
      ) {
        setCurrentConversationId(
          remainingConversations[0]?.id ?? "",
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
        if (conversation.id !== conversationId) {
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
        if (conversation.id !== conversationId) {
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

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");

    setConversations([]);
    setCurrentConversationId("");
    setPrompt("");
    setError("");
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

    setLoading(true);
    setError("");

    try {
      /*
       * Create a conversation automatically when
       * the user has no selected conversation.
       */
      let activeConversationId =
        currentConversationId;

      if (!activeConversationId) {
        const createdConversation =
          await createConversation("New Chat");

        const normalizedConversation: Conversation = {
          ...createdConversation,
          messages: [],
          createdAt: new Date(
            createdConversation.createdAt,
          ),
          updatedAt: new Date(
            createdConversation.updatedAt,
          ),
        };

        setConversations(
          (currentConversations) => [
            normalizedConversation,
            ...currentConversations,
          ],
        );

        activeConversationId =
          normalizedConversation.id;

        setCurrentConversationId(
          activeConversationId,
        );
      }

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