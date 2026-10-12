# Ecommerce API migration

ASP.NET Core 8 API replacement for the legacy Web Forms application. The solution uses Clean Architecture and retains the existing SQL Server database and legacy table names. Existing data is not recreated or seeded by the API.

## Projects

- `src/Ecommerce.Domain` — legacy domain entities and role identifiers.
- `src/Ecommerce.Application` — use cases, contracts, validation, and paging.
- `src/Ecommerce.Infrastructure` — EF Core 8 SQL Server mappings, repositories, and password hashing.
- `src/Ecommerce.Api` — HTTP endpoints, JWT authentication, authorization, rate limiting, health checks, and Swagger.
- `tests/Ecommerce.UnitTests` — password, validation, and legacy mapping unit tests.

## Prerequisites and configuration

- .NET 8 SDK (the repository `global.json` selects .NET 8).
- SQL Server with the existing `ecommerce_net_db` schema and its reference data (role, channel, status, and payment rows).
- Configure `ConnectionStrings__Ecommerce` for the target database.
- Supply a random JWT signing secret of at least 32 UTF-8 bytes as `Jwt__SigningKey` using a secret store or environment variable. Do not commit it.
- Configure `Cors__AllowedOrigins__0`, `Cors__AllowedOrigins__1`, etc. with the actual frontend origins. No cross-origin browser access is enabled by default.

For local development, use ASP.NET Core user secrets for `Jwt:SigningKey` and any non-local connection string. `appsettings.json` contains only a local SQL Server integrated-authentication example. Swagger is enabled only in Development.

## Existing database upgrade

Take a recoverable database backup and verify the target database before applying a schema upgrade. Existing users currently have plaintext values in `Users.UserPassword`; these remain readable during transition and are replaced with ASP.NET Core Identity password hashes when those users successfully sign in. The API never returns password values. The legacy column must be widened first because secure hashes exceed the old 30-character limit.

There are two equivalent deployment paths; use one:

1. Install `dotnet-ef` 8.0.31 (`dotnet tool install --global dotnet-ef --version 8.0.31`) and apply EF migration `LegacySchemaUpgrade` using `dotnet ef database update` with the supplied SQL Server connection string and this project's design-time factory; or
2. Run `database/001-security-and-guest-tracking.sql` against the existing database.

The migration/script assumes the original 20 legacy tables already exist. It widens `UserPassword`, adds hashed guest-order tracking tokens, and adds lookup indexes. It does not replace legacy tables, alter business reference data, or seed roles/statuses/payments. It has not been applied to a real database in this workspace. Do not apply both paths to the same database unless you first reconcile EF migration history.

The migration model snapshot represents the expected legacy baseline. Review it against the actual production schema before making further EF migrations, since installations may have drifted from the source scripts.

## Build and run

```powershell
dotnet restore Ecommerce.sln
dotnet build Ecommerce.sln
dotnet test Ecommerce.sln
dotnet run --project src/Ecommerce.Api
```

The API exposes `/health/live` for process liveness, `/health/ready` and `/health` for SQL readiness, and `/swagger` in Development. API requests require configured SQL Server access. Authentication endpoints also require the JWT signing secret to be configured.

## Migrated behavior and safeguards

- Product, category, brand, featured-product, user, order, tracking, and dashboard workflows are exposed as versionless JSON APIs under `/api`.
- Public catalog endpoints use paging and SQL-side projections. Product cost and admin editing require the Admin role.
- Login supports the old plaintext passwords only as a one-time verification bridge; a successful login stores a modern password hash. New passwords require at least 12 characters and mixed case plus a digit. Registration, login, and password changes use rate limiting / validation where applicable.
- JWT access tokens are short-lived (15 minutes by default). Role changes are checked against SQL Server during order transitions, so revoked roles take effect immediately for that operation.
- Guest orders receive a random tracking token once at creation. Only its SHA-256 hash is stored; subsequent tracking requires the token in `X-Order-Tracking-Token`. Numeric order IDs alone reveal no guest order information.
- Users can edit their name, phone, and password. Saved profile-address editing from the Web Forms account page is not yet exposed; a delivery address can be supplied per order.
- Order creation is transactional, verifies available stock, and atomically reserves stock. This closes a legacy overselling issue. Totals retain the legacy behavior of using current catalog price; the old schema has no order-line price snapshot column.
- Allowed order-status transitions continue to use the database's channel/status and role configuration.
- SMTP email notifications existed in the legacy application but are not wired into this API yet. Payment-provider processing, file uploads, and coupon/discount processing are also not present in the inspected executable workflows. Payment type remains legacy order metadata. Product images remain HTTPS URLs.

## API routes

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/change-password`
- `GET /api/products`, `GET /api/products/{id}`, Admin product create/update/deactivate routes
- `GET /api/categories`, `GET /api/brands`, `GET /api/featured`; Admin catalog management routes
- `POST /api/orders`, authenticated order list/detail, guest token-based tracking, authorized status transitions
- `GET/PUT /api/users/me`; Admin user listing and role update
- `GET /api/dashboard` for authorized back-office aggregates

See controller attributes and request records for the exact JSON shapes and route methods.

## Validation status

The solution and unit tests run against the .NET 8 SDK and EF Core 8.0.31. The unit suite covers password hashing, input validation, and key legacy mappings. No SQL Server connection or production dataset was available, so SQL integration behavior and the upgrade script have not been executed here. Apply to a restored staging copy and verify the existing stored procedures, indexes, role IDs, status transitions, and data constraints before production rollout.
