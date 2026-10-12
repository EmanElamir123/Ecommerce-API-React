using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ecommerce.Infrastructure.Persistence.Migrations;

/// <summary>
/// Upgrade for an existing legacy ecommerce_net_db. This migration assumes the 20 legacy
/// tables already exist; it deliberately does not recreate or replace them.
/// </summary>
public partial class LegacySchemaUpgrade : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<string>(
            name: "UserPassword", table: "Users", type: "varchar(512)", unicode: false,
            maxLength: 512, nullable: false, oldClrType: typeof(string), oldType: "varchar(30)",
            oldUnicode: false, oldMaxLength: 30);

        migrationBuilder.CreateTable(
            name: "GuestOrderTokens",
            columns: table => new
            {
                OrderId = table.Column<int>(type: "int", nullable: false),
                TokenHash = table.Column<byte[]>(type: "binary(32)", fixedLength: true, maxLength: 32, nullable: false),
                CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_GuestOrderTokens", x => x.OrderId);
                table.ForeignKey("FK_GuestOrderTokens_Orders_OrderId", x => x.OrderId,
                    "Orders", "OrderId", onDelete: ReferentialAction.NoAction);
            });

        migrationBuilder.CreateIndex("IX_Addresses_CityId", "Addresses", "CityId");
        migrationBuilder.CreateIndex("IX_ChannelStatuses_OrderStatusId", "ChannelStatuses", "OrderStatusId");
        migrationBuilder.CreateIndex("IX_Cities_ProvinceId", "Cities", "ProvinceId");
        migrationBuilder.CreateIndex("IX_Images_ProductId", "Images", "ProductId");
        migrationBuilder.CreateIndex("IX_OrderProducts_ProductId", "OrderProducts", "ProductId");
        migrationBuilder.CreateIndex("IX_Orders_DeliveryAddressId", "Orders", "DeliveryAddressId");
        migrationBuilder.CreateIndex("IX_Orders_DistributionChannelId", "Orders", "DistributionChannelId");
        migrationBuilder.CreateIndex("IX_Orders_OrderStatusId_CreationDate", "Orders", new[] { "OrderStatusId", "CreationDate" });
        migrationBuilder.CreateIndex("IX_Orders_PaymentTypeId", "Orders", "PaymentTypeId");
        migrationBuilder.CreateIndex("IX_Orders_PersonId_CreationDate", "Orders", new[] { "PersonId", "CreationDate" });
        migrationBuilder.CreateIndex("IX_OrderStatuses_RoleId", "OrderStatuses", "RoleId");
        migrationBuilder.CreateIndex("IX_People_AddressId", "People", "AddressId");
        migrationBuilder.CreateIndex("IX_ProductCategories_CategoryId", "ProductCategories", "CategoryId");
        migrationBuilder.CreateIndex("IX_Products_BrandId", "Products", "BrandId");
        migrationBuilder.CreateIndex("IX_Products_IsActive_ProductName", "Products", new[] { "IsActive", "ProductName" });
        migrationBuilder.CreateIndex("IX_Provinces_CountryId", "Provinces", "CountryId");
        migrationBuilder.CreateIndex("IX_UserRoles_RoleId", "UserRoles", "RoleId");
        migrationBuilder.CreateIndex("IX_Users_PersonId", "Users", "PersonId");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable("GuestOrderTokens");
        migrationBuilder.DropIndex("IX_Addresses_CityId", "Addresses");
        migrationBuilder.DropIndex("IX_ChannelStatuses_OrderStatusId", "ChannelStatuses");
        migrationBuilder.DropIndex("IX_Cities_ProvinceId", "Cities");
        migrationBuilder.DropIndex("IX_Images_ProductId", "Images");
        migrationBuilder.DropIndex("IX_OrderProducts_ProductId", "OrderProducts");
        migrationBuilder.DropIndex("IX_Orders_DeliveryAddressId", "Orders");
        migrationBuilder.DropIndex("IX_Orders_DistributionChannelId", "Orders");
        migrationBuilder.DropIndex("IX_Orders_OrderStatusId_CreationDate", "Orders");
        migrationBuilder.DropIndex("IX_Orders_PaymentTypeId", "Orders");
        migrationBuilder.DropIndex("IX_Orders_PersonId_CreationDate", "Orders");
        migrationBuilder.DropIndex("IX_OrderStatuses_RoleId", "OrderStatuses");
        migrationBuilder.DropIndex("IX_People_AddressId", "People");
        migrationBuilder.DropIndex("IX_ProductCategories_CategoryId", "ProductCategories");
        migrationBuilder.DropIndex("IX_Products_BrandId", "Products");
        migrationBuilder.DropIndex("IX_Products_IsActive_ProductName", "Products");
        migrationBuilder.DropIndex("IX_Provinces_CountryId", "Provinces");
        migrationBuilder.DropIndex("IX_UserRoles_RoleId", "UserRoles");
        migrationBuilder.DropIndex("IX_Users_PersonId", "Users");
        // Keep UserPassword widened: already migrated password hashes can exceed the legacy 30-char limit.
    }
}
