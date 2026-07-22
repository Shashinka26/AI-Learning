using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AIController : ControllerBase
{
    private readonly IAIService _aiService;

    public AIController(IAIService aiService)
    {
        _aiService = aiService;
    }

    [HttpGet("hello")]
    public IActionResult Hello()
    {
        return Ok("AI Controller is working!");
    }

    [HttpPost("chat")]
    public async Task<IActionResult> Chat([FromBody] ChatRequest request)
    {
        var result = await _aiService.GetResponseAsync(request.Prompt);

        return Ok(new
        {
            message = result
        });
    }

    [HttpPost("chat/stream")]
    public async Task StreamChat(
        [FromBody] ChatRequest request,
        CancellationToken cancellationToken)
    {
        Response.ContentType = "text/plain; charset=utf-8";
        Response.Headers.Append("Cache-Control", "no-cache");

        await foreach (
            var chunk in _aiService.GetStreamingResponseAsync(
                request.Prompt,
                cancellationToken
            )
        )
        {
            await Response.WriteAsync(chunk, cancellationToken);
            await Response.Body.FlushAsync(cancellationToken);
        }
    }
}

public class ChatRequest
{
    public string Prompt { get; set; } = string.Empty;
}