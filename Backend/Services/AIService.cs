using System.Runtime.CompilerServices;
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
        var client = CreateChatClient();

        var response = await client.CompleteChatAsync(prompt);

        return response.Value.Content[0].Text;
    }

    public async IAsyncEnumerable<string> GetStreamingResponseAsync(
        string prompt,
        [EnumeratorCancellation]
        CancellationToken cancellationToken = default
    )
    {
        var client = CreateChatClient();

        var messages = new List<ChatMessage>
{
    new UserChatMessage(prompt)
};

        var streamingUpdates =
            client.CompleteChatStreamingAsync(
                messages,
                cancellationToken: cancellationToken
            );

        await foreach (
            var update in streamingUpdates
                .WithCancellation(cancellationToken)
        )
        {
            foreach (var contentPart in update.ContentUpdate)
            {
                if (!string.IsNullOrEmpty(contentPart.Text))
                {
                    yield return contentPart.Text;
                }
            }
        }
    }

    private ChatClient CreateChatClient()
    {
        var apiKey = _configuration["OpenAI:ApiKey"];

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new InvalidOperationException(
                "OpenAI API key is missing."
            );
        }

        return new ChatClient(
            model: "gpt-5.5",
            apiKey: apiKey
        );
    }
}