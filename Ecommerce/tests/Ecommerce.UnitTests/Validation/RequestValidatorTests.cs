using Ecommerce.Application.Contracts;
using Ecommerce.Application.Validation;
using Xunit;

namespace Ecommerce.UnitTests.Validation;

public sealed class RequestValidatorTests
{
    [Fact]
    public async Task Registration_requires_valid_email_and_long_password()
    {
        var validator = new RegisterRequestValidator();
        var valid = await validator.ValidateAsync(new RegisterRequest("Ana", "Bertello", "ana@example.com",
            "StrongPassword42", "+541100000000"), TestContext.Current.CancellationToken);
        var invalid = await validator.ValidateAsync(new RegisterRequest("A", "B", "bad-email", "short", null),
            TestContext.Current.CancellationToken);

        Assert.True(valid.IsValid);
        Assert.False(invalid.IsValid);
        Assert.Contains(invalid.Errors, x => x.PropertyName == "Email");
        Assert.Contains(invalid.Errors, x => x.PropertyName == "Password");
    }

    [Fact]
    public async Task Product_images_must_be_https_and_catalog_values_bounded()
    {
        var validator = new SaveProductRequestValidator();
        var result = await validator.ValidateAsync(new SaveProductRequest("P-1", "Test", null,
            100, 50, 2, null, [], ["javascript:alert(1)"]), TestContext.Current.CancellationToken);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, x => x.ErrorMessage.Contains("HTTPS", StringComparison.Ordinal));
    }
}
