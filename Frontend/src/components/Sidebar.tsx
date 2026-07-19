import { useState } from "react";
import type { Conversation } from "../types/Conversation";

type SidebarProps = {
  conversations: Conversation[];
  currentConversationId: string;
  onNewChat: () => void;
  onSelectConversation: (conversationId: string) => void;
  onDeleteConversation: (conversationId: string) => void;
  onRenameConversation: (
    conversationId: string,
    newTitle: string,
  ) => void;
};

function Sidebar({
  conversations,
  currentConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
}: SidebarProps) {
  const [editingConversationId, setEditingConversationId] =
  useState<string | null>(null);

const [editingTitle, setEditingTitle] = useState("");

const startEditing = (conversation: Conversation) => {
  setEditingConversationId(conversation.id);
  setEditingTitle(conversation.title);
};

const saveRename = () => {
  if (!editingConversationId) {
    return;
  }

  onRenameConversation(editingConversationId, editingTitle);

  setEditingConversationId(null);
  setEditingTitle("");
};
  return (
    <aside className="sidebar">
      <button
        type="button"
        className="new-chat-button"
        onClick={onNewChat}
      >
        + New Chat
      </button>

      <div className="conversation-list">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={
              conversation.id === currentConversationId
                ? "conversation-row active"
                : "conversation-row"
            }
          >
            {editingConversationId === conversation.id ? (
  <input
    className="conversation-rename-input"
    value={editingTitle}
    onChange={(event) => setEditingTitle(event.target.value)}
    onKeyDown={(event) => {
      if (event.key === "Enter") {
        saveRename();
      }
    }}
    onBlur={saveRename}
    autoFocus
  />
) : (
  <button
    type="button"
    className="conversation-item"
    onClick={() => onSelectConversation(conversation.id)}
  >
    💬{" "}
    {conversation.title.length > 25
      ? conversation.title.slice(0, 25) + "..."
      : conversation.title}
  </button>
)}

<div className="conversation-actions">
  <button
    type="button"
    className="conversation-action-button"
    onClick={() => startEditing(conversation)}
    aria-label="Rename conversation"
  >
    ✏️
  </button>

  <button
    type="button"
    className="conversation-action-button"
    onClick={() => onDeleteConversation(conversation.id)}
    aria-label="Delete conversation"
  >
    🗑
  </button>
</div>

            
          </div>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;