using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class Message
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public Guid ConversationId { get; set; }

    public Conversation Conversation { get; set; } = null!;

    [Required]
    public string Sender { get; set; } = string.Empty;

    [Required]
    public string Text { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}