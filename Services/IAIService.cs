namespace Backend.Services;

public interface IAIService
{
    Task<string> GetResponseAsync(string prompt);
}