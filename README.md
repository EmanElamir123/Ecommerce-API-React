# Dokan — Full-Stack E-commerce

A full-stack e-commerce platform made of two parts that live in this repository:

- **Backend (`Ecommerce/`)** — an ASP.NET Core 8 REST API built with Clean Architecture on top of an existing SQL Server database.
- **Frontend (`frontend/`)** — a React storefront and admin dashboard with a right-to-left (Arabic) interface, built with Vite and Bootstrap 5.

## Features

**Customers**
- Browse products with search, filters (category, brand, availability) and sorting
- Product details with an image gallery
- Shopping cart saved in the browser
- Checkout as a registered user or as a guest
- Guest order tracking with a one-time tracking code
- Account profile, order history and password change

**Back office**
- Dashboard with sales figures and top-selling / most-visited products
- Product, category and brand management
- Featured products management
- User and role management
- Order lookup and status progression

## Tech stack

| Layer    | Technologies |
|----------|--------------|
| Backend  | C#, ASP.NET Core 8, Entity Framework Core 8 (SQL Server), JWT authentication, FluentValidation, rate limiting, health checks, Swagger |
| Frontend | React 18, Vite, React Router, Axios, React-Toastify |
| UI       | Bootstrap 5 (RTL), Font Awesome 6, Tajawal font |
| Tests    | xUnit (backend unit tests) |

## Repository structure

```
.
├── Ecommerce/                 # Backend solution (.NET 8)
│   ├── src/
│   │   ├── Ecommerce.Domain          # Entities and role identifiers
│   │   ├── Ecommerce.Application     # Use cases, contracts, validation, paging
│   │   ├── Ecommerce.Infrastructure  # EF Core mappings, repositories, password hashing
│   │   └── Ecommerce.Api             # Controllers, auth, rate limiting, Swagger
│   ├── tests/Ecommerce.UnitTests
│   ├── database/                     # SQL upgrade script
│   └── README.md                     # Detailed backend notes
└── frontend/                  # React app (Vite)
    └── src/
        ├── api/               # One module per API area
        ├── context/           # Auth and cart state
        ├── components/        # Layout, common, products, cart, orders, admin
        ├── pages/             # Public pages and pages/admin
        ├── utils/             # Formatters and lookup values
        └── styles/            # Theme on top of Bootstrap
```

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) 18 or newer
- SQL Server with the existing `ecommerce_net_db` database, including its reference data (roles, distribution channels, order statuses and payment types). The API does not create or seed this data.

## Getting started

### 1. Backend

Run these commands from the repository root.

```bash
# Store secrets outside the repository (user secrets)
dotnet user-secrets init --project Ecommerce/src/Ecommerce.Api
dotnet user-secrets set "Jwt:SigningKey" "<random string, at least 32 characters>" --project Ecommerce/src/Ecommerce.Api
dotnet user-secrets set "Cors:AllowedOrigins:0" "http://localhost:5173" --project Ecommerce/src/Ecommerce.Api

# Optional: point to your own database (the default uses local SQL Server with Windows authentication)
dotnet user-secrets set "ConnectionStrings:Ecommerce" "<your connection string>" --project Ecommerce/src/Ecommerce.Api

# Run
dotnet restore Ecommerce/Ecommerce.sln
dotnet run --project Ecommerce/src/Ecommerce.Api
```

The API listens on `http://localhost:5289` (and `https://localhost:7153` with the `https` launch profile). In Development, Swagger is available at `/swagger`, and health checks at `/health/live` and `/health/ready`.

Existing databases need a one-time schema upgrade before first use. Back up the database first, then follow the **Existing database upgrade** section in [`Ecommerce/README.md`](Ecommerce/README.md).

> Never commit the JWT signing key or a connection string that contains credentials.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env     # set VITE_API_BASE_URL if your API runs elsewhere
npm run dev
```

The app opens at `http://localhost:5173`. The default API address in `.env.example` is `http://localhost:5289/api`.

### 3. Production build

```bash
cd frontend
npm run build            # output goes to frontend/dist
```

Set `VITE_API_BASE_URL` to the deployed API address before building, and add the deployed frontend origin to the API's `Cors:AllowedOrigins` setting.

## API overview

All routes are under `/api`.

| Area       | Routes |
|------------|--------|
| Auth       | `POST /auth/register`, `POST /auth/login`, `POST /auth/change-password` |
| Products   | `GET /products`, `GET /products/{id}`; admin: `POST`, `PUT`, `DELETE`, `GET /products/{id}/admin` |
| Catalog    | `GET /categories`, `GET /brands`; admin: `POST`, `PUT`, `DELETE` |
| Featured   | `GET /featured-products`; admin: `PUT /featured-products` |
| Orders     | `POST /orders`, `GET /orders`, `GET /orders/{id}`, `GET /orders/{id}/tracking`, `PATCH /orders/{id}/status` |
| Users      | `GET/PUT /users/me`; admin: `GET /users`, `PUT /users/{id}/roles` |
| Dashboard  | `GET /dashboard` (back office roles) |

Guest orders return a tracking token once at creation. It is required in the `X-Order-Tracking-Token` header to track the order.

## Good to know

- **Lookup values in the frontend.** The API has no endpoint that lists payment types, delivery channels or provinces, so `frontend/src/utils/lookups.js` holds their IDs. Make sure they match the rows in your database.
- **Password rules.** New passwords need at least 12 characters, with upper and lower case letters and a digit.
- **Not included yet.** Email notifications, online payment processing, file uploads and discount codes. Product images are HTTPS links.

## Running the tests

```bash
dotnet test Ecommerce/Ecommerce.sln
```

## License

No license has been specified yet. Add a `LICENSE` file before sharing the project publicly.
