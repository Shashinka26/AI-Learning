using Backend.Models;

namespace Backend.Services;

public interface IConversationService
{
    Task<Conversation> CreateConversationAsync(
        Guid userId,
        string title);

    Task<List<Conversation>> GetUserConversationsAsync(
        Guid userId);

    Task<Conversation?> GetConversationAsync(
        Guid conversationId,
        Guid userId);

    Task<bool> RenameConversationAsync(
        Guid conversationId,
        Guid userId,
        string title);

    Task<bool> DeleteConversationAsync(
        Guid conversationId,
        Guid userId);
}
