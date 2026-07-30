namespace Backend.DTOs;

public class CreateMessageRequest
{
    public Guid ConversationId { get; set; }

    public string Sender { get; set; } = string.Empty;

    public string Text { get; set; } = string.Empty;
}
