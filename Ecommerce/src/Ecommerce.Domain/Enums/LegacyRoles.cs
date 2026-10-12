namespace Ecommerce.Domain.Enums;

public static class LegacyRoles
{
    public const byte Admin = 1;
    public const byte Customer = 2;
    public const byte DeliveryDriver = 3;
    public const byte CustomerService = 4;
    public const byte Plus = 5;
}

public static class LegacyOrderStatuses
{
    public const int ProcessingPayment = 1;
    public const int OrderCompleted = 5;
    public const int PaymentAndWithdrawalPending = 6;
    public const int OrderCancelled = 9;
    public const int DeliveryAndPaymentPending = 10;
}
