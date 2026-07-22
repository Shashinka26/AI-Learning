namespace Backend.Services;

public interface IAIService
{
    Task<string> GetResponseAsync(string prompt);

    IAsyncEnumerable<string> GetStreamingResponseAsync(
        string prompt,
        CancellationToken cancellationToken = default
    );
}