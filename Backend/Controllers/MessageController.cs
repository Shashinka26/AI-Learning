using Backend.DTOs;
using Backend.Extensions;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MessageController : ControllerBase
{
    private readonly IMessageService _messageService;

    public MessageController(
        IMessageService messageService)
    {
        _messageService = messageService;
    }

    [HttpPost]
    public async Task<IActionResult> SaveMessage(
        CreateMessageRequest request)
    {
        var userId = User.GetUserId();

        if (string.IsNullOrWhiteSpace(request.Sender))
        {
            return BadRequest(new
            {
                message = "Sender is required."
            });
        }

        if (string.IsNullOrWhiteSpace(request.Text))
        {
            return BadRequest(new
            {
                message = "Message text is required."
            });
        }

        var message =
            await _messageService.SaveMessageAsync(
                userId,
                request.ConversationId,
                request.Sender,
                request.Text);

        if (message == null)
        {
            return NotFound(new
            {
                message =
                    "Conversation was not found."
            });
        }

        return Ok(message);
    }

    [HttpGet("{conversationId:guid}")]
    public async Task<IActionResult> GetMessages(
        Guid conversationId)
    {
        var userId = User.GetUserId();

        var messages =
            await _messageService.GetMessagesAsync(
                conversationId,
                userId);

        return Ok(messages);
    }
}
