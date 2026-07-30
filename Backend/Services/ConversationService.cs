using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Backend.Services;

public class ConversationService : IConversationService
{
    private readonly AppDbContext _context;

    public ConversationService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Conversation> CreateConversationAsync(
        Guid userId,
        string title)
    {
        var conversation = new Conversation
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = string.IsNullOrWhiteSpace(title)
                ? "New Chat"
                : title.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Conversations.Add(conversation);

        await _context.SaveChangesAsync();

        return conversation;
    }

    public async Task<List<Conversation>> GetUserConversationsAsync(
     Guid userId)
    {
        return await _context.Conversations
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.UpdatedAt)
            .ToListAsync();
    }

    public Task<Conversation?> GetConversationAsync(Guid conversationId, Guid userId)
    {
        throw new NotImplementedException();
    }

    public Task<bool> RenameConversationAsync(Guid conversationId, Guid userId, string title)
    {
        throw new NotImplementedException();
    }

    public Task<bool> DeleteConversationAsync(Guid conversationId, Guid userId)
    {
        throw new NotImplementedException();
    }
    
}
