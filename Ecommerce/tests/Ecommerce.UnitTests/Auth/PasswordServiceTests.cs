using Ecommerce.Application.Contracts;
using Ecommerce.Domain.Entities;
using Ecommerce.Infrastructure.Security;
using Xunit;

namespace Ecommerce.UnitTests.Auth;

public sealed class PasswordServiceTests
{
    [Fact]
    public void Hash_is_not_plain_text_and_verifies_the_original_password()
    {
        var service = new PasswordService();
        var user = new User { UserId = 42 };
        const string password = "CorrectHorse42Battery!";

        var hash = service.Hash(user, password);

        Assert.NotEqual(password, hash);
        Assert.Equal(PasswordCheck.Success, service.Verify(user, hash, password));
        Assert.Equal(PasswordCheck.Failed, service.Verify(user, hash, "wrong-password"));
    }
}
