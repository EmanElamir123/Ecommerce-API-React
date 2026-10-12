/* Run once against the existing ecommerce_net_db after taking a verified backup.
   This preserves all existing rows and widens only the legacy password column. */
SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF COL_LENGTH('dbo.Users', 'UserPassword') IS NULL
    THROW 50001, 'Expected legacy dbo.Users.UserPassword column was not found.', 1;

IF EXISTS (
    SELECT 1 FROM sys.columns c
    JOIN sys.types t ON t.user_type_id = c.user_type_id
    WHERE c.object_id = OBJECT_ID('dbo.Users') AND c.name = 'UserPassword'
      AND (t.name <> 'varchar' OR c.max_length < 512)
)
    ALTER TABLE dbo.Users ALTER COLUMN UserPassword varchar(512) NOT NULL;

IF OBJECT_ID('dbo.GuestOrderTokens', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.GuestOrderTokens
    (
        OrderId int NOT NULL CONSTRAINT PK_GuestOrderTokens PRIMARY KEY,
        TokenHash binary(32) NOT NULL,
        CreatedAtUtc datetime2 NOT NULL,
        CONSTRAINT FK_GuestOrderTokens_Orders_OrderId
            FOREIGN KEY (OrderId) REFERENCES dbo.Orders(OrderId)
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.Products') AND name = 'IX_Products_IsActive_ProductName')
    CREATE INDEX IX_Products_IsActive_ProductName ON dbo.Products(IsActive, ProductName);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.Images') AND name = 'IX_Images_ProductId')
    CREATE INDEX IX_Images_ProductId ON dbo.Images(ProductId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.Addresses') AND name = 'IX_Addresses_CityId')
    CREATE INDEX IX_Addresses_CityId ON dbo.Addresses(CityId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.ChannelStatuses') AND name = 'IX_ChannelStatuses_OrderStatusId')
    CREATE INDEX IX_ChannelStatuses_OrderStatusId ON dbo.ChannelStatuses(OrderStatusId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.Cities') AND name = 'IX_Cities_ProvinceId')
    CREATE INDEX IX_Cities_ProvinceId ON dbo.Cities(ProvinceId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.ProductCategories') AND name = 'IX_ProductCategories_CategoryId')
    CREATE INDEX IX_ProductCategories_CategoryId ON dbo.ProductCategories(CategoryId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.OrderProducts') AND name = 'IX_OrderProducts_ProductId')
    CREATE INDEX IX_OrderProducts_ProductId ON dbo.OrderProducts(ProductId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.Orders') AND name = 'IX_Orders_DeliveryAddressId')
    CREATE INDEX IX_Orders_DeliveryAddressId ON dbo.Orders(DeliveryAddressId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.Orders') AND name = 'IX_Orders_DistributionChannelId')
    CREATE INDEX IX_Orders_DistributionChannelId ON dbo.Orders(DistributionChannelId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.Users') AND name = 'IX_Users_PersonId')
    CREATE INDEX IX_Users_PersonId ON dbo.Users(PersonId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.Orders') AND name = 'IX_Orders_PersonId_CreationDate')
    CREATE INDEX IX_Orders_PersonId_CreationDate ON dbo.Orders(PersonId, CreationDate);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.Orders') AND name = 'IX_Orders_OrderStatusId_CreationDate')
    CREATE INDEX IX_Orders_OrderStatusId_CreationDate ON dbo.Orders(OrderStatusId, CreationDate);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.Orders') AND name = 'IX_Orders_PaymentTypeId')
    CREATE INDEX IX_Orders_PaymentTypeId ON dbo.Orders(PaymentTypeId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.OrderStatuses') AND name = 'IX_OrderStatuses_RoleId')
    CREATE INDEX IX_OrderStatuses_RoleId ON dbo.OrderStatuses(RoleId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.People') AND name = 'IX_People_AddressId')
    CREATE INDEX IX_People_AddressId ON dbo.People(AddressId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.Products') AND name = 'IX_Products_BrandId')
    CREATE INDEX IX_Products_BrandId ON dbo.Products(BrandId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.Provinces') AND name = 'IX_Provinces_CountryId')
    CREATE INDEX IX_Provinces_CountryId ON dbo.Provinces(CountryId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.UserRoles') AND name = 'IX_UserRoles_RoleId')
    CREATE INDEX IX_UserRoles_RoleId ON dbo.UserRoles(RoleId);

COMMIT TRANSACTION;
