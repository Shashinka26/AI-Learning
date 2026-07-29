

using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class Conversation
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public Guid UserId { get; set; }

    public User User { get; set; } = null!;

    public List<Message> Messages { get; set; } = new();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}