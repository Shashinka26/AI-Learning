using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class MessageService : IMessageService
{
    private readonly AppDbContext _context;

    public MessageService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Message?> SaveMessageAsync(
        Guid userId,
        Guid conversationId,
        string sender,
        string text)
    {
        var conversation =
            await _context.Conversations
                .FirstOrDefaultAsync(c =>
                    c.Id == conversationId &&
                    c.UserId == userId);

        if (conversation == null)
        {
            return null;
        }

        var message = new Message
        {
            Id = Guid.NewGuid(),
            ConversationId = conversationId,
            Sender = sender.Trim(),
            Text = text.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _context.Messages.Add(message);

        conversation.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return message;
    }

    public async Task<List<Message>> GetMessagesAsync(
        Guid conversationId,
        Guid userId)
    {
        var conversationExists =
            await _context.Conversations
                .AnyAsync(c =>
                    c.Id == conversationId &&
                    c.UserId == userId);

        if (!conversationExists)
        {
            return new List<Message>();
        }

        return await _context.Messages
            .Where(message =>
                message.ConversationId ==
                conversationId)
            .OrderBy(message =>
                message.CreatedAt)
            .ToListAsync();
    }
}