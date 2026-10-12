using Ecommerce.Application.Contracts;
using Ecommerce.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace Ecommerce.Infrastructure.Security;

public sealed class PasswordService : IPasswordService
{
    private readonly PasswordHasher<User> _hasher = new();

    public string Hash(User user, string password) => _hasher.HashPassword(user, password);

    public PasswordCheck Verify(User user, string hash, string password)
    {
        var result = _hasher.VerifyHashedPassword(user, hash, password);
        return result switch
        {
            PasswordVerificationResult.Success => PasswordCheck.Success,
            PasswordVerificationResult.SuccessRehashNeeded => PasswordCheck.UpgradeRequired,
            _ => PasswordCheck.Failed
        };
    }
}
