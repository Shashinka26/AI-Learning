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
}

public class ChatRequest
{
    public string Prompt { get; set; } = string.Empty;
}