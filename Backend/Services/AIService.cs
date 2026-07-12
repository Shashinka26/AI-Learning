using OpenAI.Chat;

namespace Backend.Services;

public class AIService : IAIService
{
    private readonly IConfiguration _configuration;

    public AIService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<string> GetResponseAsync(string prompt)
    {
        var apiKey = _configuration["OpenAI:ApiKey"];

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new InvalidOperationException("OpenAI API key is missing.");
        }

        var client = new ChatClient(
            model: "gpt-5.5",
            apiKey: apiKey
        );

        var response = await client.CompleteChatAsync(prompt);

        return response.Value.Content[0].Text;
    }
}