using Ecommerce.Application.Contracts;
using FluentValidation;

namespace Ecommerce.Application.Validation;

public sealed class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(30);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(30);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(30);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(12).MaximumLength(128)
            .Must(x => x.Any(char.IsLower) && x.Any(char.IsUpper) && x.Any(char.IsDigit))
            .WithMessage("Password must include lowercase, uppercase, and numeric characters.");
        RuleFor(x => x.Phone).MaximumLength(30);
    }
}

public sealed class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(254);
        RuleFor(x => x.Password).NotEmpty().MaximumLength(128);
    }
}

public sealed class ChangePasswordRequestValidator : AbstractValidator<ChangePasswordRequest>
{
    public ChangePasswordRequestValidator()
    {
        RuleFor(x => x.CurrentPassword).NotEmpty().MaximumLength(128);
        RuleFor(x => x.NewPassword).NotEmpty().MinimumLength(12).MaximumLength(128)
            .Must(x => x.Any(char.IsLower) && x.Any(char.IsUpper) && x.Any(char.IsDigit))
            .WithMessage("Password must include lowercase, uppercase, and numeric characters.");
        RuleFor(x => x.NewPassword).NotEqual(x => x.CurrentPassword)
            .WithMessage("The new password must differ from the current password.");
    }
}

public sealed class SaveProductRequestValidator : AbstractValidator<SaveProductRequest>
{
    public SaveProductRequestValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Description).MaximumLength(300);
        RuleFor(x => x.Price).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Cost).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Stock).GreaterThanOrEqualTo(0);
        RuleFor(x => x.CategoryIds).Must(x => x.Count <= 100);
        RuleFor(x => x.ImageUrls).Must(x => x.Count <= 20)
            .WithMessage("At most 20 images are allowed.");
        RuleForEach(x => x.ImageUrls).Must(IsSafeImageUrl)
            .WithMessage("Image URLs must be valid HTTPS URLs.");
    }

    private static bool IsSafeImageUrl(string url) =>
        Uri.TryCreate(url, UriKind.Absolute, out var uri) && uri.Scheme == Uri.UriSchemeHttps &&
        uri.HostNameType is UriHostNameType.Dns or UriHostNameType.IPv4 or UriHostNameType.IPv6;
}

public sealed class CreateOrderRequestValidator : AbstractValidator<CreateOrderRequest>
{
    public CreateOrderRequestValidator()
    {
        RuleFor(x => x.Items).NotEmpty().Must(x => x.Count <= 50);
        RuleForEach(x => x.Items).ChildRules(line =>
        {
            line.RuleFor(x => x.ProductId).GreaterThan(0);
            line.RuleFor(x => x.Quantity).InclusiveBetween(1, 100);
        });
        RuleFor(x => x.PaymentTypeId).GreaterThan(0);
        RuleFor(x => x.DistributionChannelId).InclusiveBetween(1, 4);
        RuleFor(x => x.GuestCustomer!.Email).EmailAddress().MaximumLength(30)
            .When(x => x.GuestCustomer is not null);
        RuleFor(x => x.DeliveryAddress!.ProvinceId).GreaterThan((short)0)
            .When(x => x.DeliveryAddress is not null);
        RuleFor(x => x.DeliveryAddress!.CityName).NotEmpty().MaximumLength(30)
            .When(x => x.DeliveryAddress is not null);
        RuleFor(x => x.DeliveryAddress!.StreetName).NotEmpty().MaximumLength(30)
            .When(x => x.DeliveryAddress is not null);
        RuleFor(x => x.DeliveryAddress!.StreetNumber).NotEmpty().MaximumLength(10)
            .When(x => x.DeliveryAddress is not null);
    }
}
