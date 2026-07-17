import type { Conversation } from "../types/Conversation";

type SidebarProps = {
  conversations: Conversation[];
  currentConversationId: string;
  onNewChat: () => void;
  onSelectConversation: (conversationId: string) => void;
};

function Sidebar({
  conversations,
  currentConversationId,
  onNewChat,
  onSelectConversation,
}: SidebarProps) {
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
          <button
            type="button"
            key={conversation.id}
            className={
              conversation.id === currentConversationId
                ? "conversation-item active"
                : "conversation-item"
            }
            onClick={() => onSelectConversation(conversation.id)}
          >
            {conversation.title}
          </button>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;