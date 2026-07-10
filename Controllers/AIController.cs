using Microsoft.AspNetCore.Mvc;
using OpenAI.Chat;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AIController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public AIController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpGet("hello")]
    public IActionResult Hello()
    {
        return Ok("AI Controller is working!");
    }

    [HttpPost("chat")]
    public async Task<IActionResult> Chat([FromBody] ChatRequest request)
    {
        var apiKey = _configuration["OpenAI:ApiKey"];

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return BadRequest("OpenAI API key is missing.");
        }

        var client = new ChatClient(
            model: "gpt-5.5",
            apiKey: apiKey
        );

        var response = await client.CompleteChatAsync(request.Prompt);

        return Ok(new
        {
            message = response.Value.Content[0].Text
        });
    }
}

public class ChatRequest
{
    public string Prompt { get; set; } = string.Empty;
}