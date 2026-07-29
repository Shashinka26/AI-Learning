using Backend.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Backend.Extensions;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ConversationController : ControllerBase
{
    private readonly IConversationService _conversationService;

    public ConversationController(
        IConversationService conversationService)
    {
        _conversationService = conversationService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateConversation(
        CreateConversationRequest request)
    {
        var userId = User.GetUserId();

        var conversation =
            await _conversationService
                .CreateConversationAsync(
                    userId,
                    request.Title);

        return Ok(conversation);
    }

    [HttpGet]
    public async Task<IActionResult> GetMyConversations()
    {
        var userId = User.GetUserId();

        var conversations =
            await _conversationService
                .GetUserConversationsAsync(userId);

        return Ok(conversations);
    }
}