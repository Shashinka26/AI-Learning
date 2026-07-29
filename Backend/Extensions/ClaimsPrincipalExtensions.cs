using System.Security.Claims;

namespace Backend.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal user)
    {
        var userIdValue = user.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdValue))
        {
            throw new UnauthorizedAccessException(
                "User identifier claim is missing.");
        }

        if (!Guid.TryParse(userIdValue, out var userId))
        {
            throw new UnauthorizedAccessException(
                "User identifier claim is invalid.");
        }

        return userId;
    }
}