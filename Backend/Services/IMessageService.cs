using Backend.Models;

namespace Backend.Services;

public interface IMessageService
{
    Task<Message?> SaveMessageAsync(
        Guid userId,
        Guid conversationId,
        string sender,
        string text);

    Task<List<Message>> GetMessagesAsync(
        Guid conversationId,
        Guid userId);
}