using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Ecommerce.Application.Contracts;
using Microsoft.IdentityModel.Tokens;

namespace Ecommerce.Api.Security;

public sealed class JwtAccessTokenService(IConfiguration configuration) : IAccessTokenService
{
    public (string Token, DateTime ExpiresAtUtc) Create(UserProfile profile)
    {
        var section = configuration.GetSection("Jwt");
        var expires = DateTime.UtcNow.AddMinutes(Math.Clamp(section.GetValue("AccessTokenMinutes", 15), 5, 60));
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, profile.UserId.ToString()),
            new("user_id", profile.UserId.ToString()),
            new("person_id", profile.PersonId.ToString()),
            new(JwtRegisteredClaimNames.Email, profile.Email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N"))
        };
        claims.AddRange(profile.Roles.Select(role => new Claim("role", role)));
        var credentials = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(section["SigningKey"]!)), SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(section["Issuer"], section["Audience"], claims,
            expires: expires, signingCredentials: credentials);
        return (new JwtSecurityTokenHandler().WriteToken(token), expires);
    }
}
