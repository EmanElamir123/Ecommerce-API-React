using Ecommerce.Application.Common;
using Ecommerce.Application.Contracts;
using Ecommerce.Domain.Entities;
using Ecommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Repositories;

public sealed class CatalogRepository(EcommerceDbContext db) : ICatalogRepository
{
    public async Task<PagedResult<ProductListItem>> ListProductsAsync(ProductQuery q, CancellationToken ct)
    {
        var query = db.Products.AsNoTracking().AsQueryable();
        if (!q.IncludeInactive) query = query.Where(x => x.IsActive);
        if (q.InStock == true) query = query.Where(x => x.Stock > 0);
        if (q.InStock == false) query = query.Where(x => x.Stock == 0);
        if (q.BrandId.HasValue) query = query.Where(x => x.BrandId == q.BrandId);
        if (q.CategoryId.HasValue) query = query.Where(x => x.ProductCategories.Any(c => c.CategoryId == q.CategoryId));
        if (!string.IsNullOrWhiteSpace(q.Search))
        {
            var term = q.Search.Trim();
            query = query.Where(x => x.ProductName.Contains(term) || x.Code.Contains(term) ||
                (x.ProductDescription != null && x.ProductDescription.Contains(term)) ||
                (x.Brand != null && x.Brand.BrandName.Contains(term)) ||
                x.ProductCategories.Any(c => c.Category.CategoryName.Contains(term)));
        }
        query = (q.SortBy.ToLowerInvariant(), q.Descending) switch
        {
            ("price", false) => query.OrderBy(x => x.Price).ThenBy(x => x.ProductId),
            ("price", true) => query.OrderByDescending(x => x.Price).ThenBy(x => x.ProductId),
            ("stock", false) => query.OrderBy(x => x.Stock).ThenBy(x => x.ProductId),
            ("stock", true) => query.OrderByDescending(x => x.Stock).ThenBy(x => x.ProductId),
            ("code", false) => query.OrderBy(x => x.Code).ThenBy(x => x.ProductId),
            ("code", true) => query.OrderByDescending(x => x.Code).ThenBy(x => x.ProductId),
            ("name", true) => query.OrderByDescending(x => x.ProductName).ThenBy(x => x.ProductId),
            _ => query.OrderBy(x => x.ProductName).ThenBy(x => x.ProductId)
        };
        var total = await query.CountAsync(ct);
        var items = await query.Skip((q.Page - 1) * q.PageSize).Take(q.PageSize)
            .Select(x => new ProductListItem(x.ProductId, x.Code, x.ProductName, x.ProductDescription,
                x.Price, x.Stock, x.Brand == null ? null : x.Brand.BrandName,
                x.ProductCategories.Select(c => c.Category.CategoryName).OrderBy(n => n).ToList(),
                x.Images.OrderBy(i => i.ImageId).Select(i => i.ImageUrl).FirstOrDefault()))
            .ToListAsync(ct);
        return new(items, q.Page, q.PageSize, total);
    }

    public Task<ProductDetails?> GetProductAsync(int id, CancellationToken ct) => db.Products.AsNoTracking()
        .Where(x => x.ProductId == id && x.IsActive)
        .Select(x => new ProductDetails(x.ProductId, x.Code, x.ProductName, x.ProductDescription,
            x.Price, x.Stock, x.Brand == null ? null : x.Brand.BrandName,
            x.ProductCategories.Select(c => c.CategoryId).ToList(),
            x.ProductCategories.Select(c => c.Category.CategoryName).OrderBy(n => n).ToList(),
            x.Images.OrderBy(i => i.ImageId).Select(i => i.ImageUrl).ToList()))
        .SingleOrDefaultAsync(ct);

    public Task<AdminProductDetails?> GetAdminProductAsync(int id, CancellationToken ct) => db.Products.AsNoTracking()
        .Where(x => x.ProductId == id)
        .Select(x => new AdminProductDetails(x.ProductId, x.Code, x.ProductName, x.ProductDescription,
            x.Price, x.Cost, x.Stock, x.IsActive, x.BrandId,
            x.ProductCategories.Select(c => c.CategoryId).ToList(),
            x.Images.OrderBy(i => i.ImageId).Select(i => i.ImageUrl).ToList()))
        .SingleOrDefaultAsync(ct);

    public async Task<int> CreateProductAsync(SaveProductRequest r, CancellationToken ct)
    {
        await ValidateRelationsAsync(r, ct);
        var product = new Product { Code = r.Code.Trim(), ProductName = r.Name.Trim(),
            ProductDescription = NullIfEmpty(r.Description), Price = r.Price, Cost = r.Cost,
            Stock = r.Stock, BrandId = r.BrandId, IsActive = r.IsActive,
            ProductCategories = r.CategoryIds.Distinct().Select(id => new ProductCategory { CategoryId = id }).ToList(),
            Images = r.ImageUrls.Distinct(StringComparer.OrdinalIgnoreCase).Select(url => new Image { ImageUrl = url.Trim() }).ToList() };
        db.Products.Add(product);
        await db.SaveChangesAsync(ct);
        return product.ProductId;
    }

    public async Task<bool> UpdateProductAsync(int id, SaveProductRequest r, CancellationToken ct)
    {
        var product = await db.Products.Include(x => x.ProductCategories).Include(x => x.Images)
            .SingleOrDefaultAsync(x => x.ProductId == id, ct);
        if (product is null) return false;
        await ValidateRelationsAsync(r, ct);
        product.Code = r.Code.Trim(); product.ProductName = r.Name.Trim();
        product.ProductDescription = NullIfEmpty(r.Description); product.Price = r.Price;
        product.Cost = r.Cost; product.Stock = r.Stock; product.BrandId = r.BrandId;
        product.IsActive = r.IsActive;
        db.ProductCategories.RemoveRange(product.ProductCategories);
        db.Images.RemoveRange(product.Images);
        product.ProductCategories = r.CategoryIds.Distinct().Select(categoryId => new ProductCategory { ProductId = id, CategoryId = categoryId }).ToList();
        product.Images = r.ImageUrls.Distinct(StringComparer.OrdinalIgnoreCase).Select(url => new Image { ProductId = id, ImageUrl = url.Trim() }).ToList();
        await db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> DeactivateProductAsync(int id, CancellationToken ct)
    {
        var affected = await db.Products.Where(x => x.ProductId == id && x.IsActive)
            .ExecuteUpdateAsync(s => s.SetProperty(x => x.IsActive, false), ct);
        return affected != 0;
    }

    public async Task<PagedResult<CatalogItem>> ListCategoriesAsync(CatalogQuery q, CancellationToken ct)
    {
        var query = db.Categories.AsNoTracking().AsQueryable();
        if (!q.IncludeInactive) query = query.Where(x => x.IsActive);
        if (!string.IsNullOrWhiteSpace(q.Search)) query = query.Where(x => x.CategoryName.Contains(q.Search.Trim()));
        var total = await query.CountAsync(ct);
        var items = await query.OrderBy(x => x.CategoryName).Skip((q.Page - 1) * q.PageSize).Take(q.PageSize)
            .Select(x => new CatalogItem(x.CategoryId, x.CategoryName, x.IsActive)).ToListAsync(ct);
        return new(items, q.Page, q.PageSize, total);
    }

    public async Task<PagedResult<CatalogItem>> ListBrandsAsync(CatalogQuery q, CancellationToken ct)
    {
        var query = db.Brands.AsNoTracking().AsQueryable();
        if (!q.IncludeInactive) query = query.Where(x => x.IsActive);
        if (!string.IsNullOrWhiteSpace(q.Search)) query = query.Where(x => x.BrandName.Contains(q.Search.Trim()));
        var total = await query.CountAsync(ct);
        var items = await query.OrderBy(x => x.BrandName).Skip((q.Page - 1) * q.PageSize).Take(q.PageSize)
            .Select(x => new CatalogItem(x.BrandId, x.BrandName, x.IsActive)).ToListAsync(ct);
        return new(items, q.Page, q.PageSize, total);
    }

    public async Task<int> CreateCategoryAsync(string name, CancellationToken ct)
    {
        var entity = new Category { CategoryName = name.Trim() }; db.Categories.Add(entity);
        await db.SaveChangesAsync(ct); return entity.CategoryId;
    }
    public async Task<int> CreateBrandAsync(string name, CancellationToken ct)
    {
        var entity = new Brand { BrandName = name.Trim() }; db.Brands.Add(entity);
        await db.SaveChangesAsync(ct); return entity.BrandId;
    }
    public async Task<bool> UpdateCategoryAsync(int id, string name, bool isActive, CancellationToken ct)
    {
        var entity = await db.Categories.FindAsync([id], ct); if (entity is null) return false;
        entity.CategoryName = name.Trim(); entity.IsActive = isActive; await db.SaveChangesAsync(ct); return true;
    }
    public async Task<bool> UpdateBrandAsync(int id, string name, bool isActive, CancellationToken ct)
    {
        var entity = await db.Brands.FindAsync([id], ct); if (entity is null) return false;
        entity.BrandName = name.Trim(); entity.IsActive = isActive; await db.SaveChangesAsync(ct); return true;
    }
    public async Task<bool> DeactivateCategoryAsync(int id, CancellationToken ct) =>
        await db.Categories.Where(x => x.CategoryId == id && x.IsActive).ExecuteUpdateAsync(s => s.SetProperty(x => x.IsActive, false), ct) > 0;
    public async Task<bool> DeactivateBrandAsync(int id, CancellationToken ct) =>
        await db.Brands.Where(x => x.BrandId == id && x.IsActive).ExecuteUpdateAsync(s => s.SetProperty(x => x.IsActive, false), ct) > 0;

    public async Task<IReadOnlyList<FeaturedItem>> ListFeaturedAsync(CancellationToken ct) => await db.FeaturedProducts.AsNoTracking()
        .OrderBy(x => x.DisplayOrder).Select(x => new FeaturedItem(x.ProductId, x.DisplayOrder, x.ShowAsNew,
            x.Product.ProductName, x.Product.Price, x.Product.Images.OrderBy(i => i.ImageId).Select(i => i.ImageUrl).FirstOrDefault()))
        .ToListAsync(ct);

    public async Task SetFeaturedAsync(IReadOnlyList<SetFeaturedRequest> items, CancellationToken ct)
    {
        if (items.Select(x => x.ProductId).Distinct().Count() != items.Count || items.Any(x => x.DisplayOrder < 0))
            throw new ArgumentException("Featured products must have distinct IDs and nonnegative order values.");
        var ids = items.Select(x => x.ProductId).ToArray();
        var existing = await db.FeaturedProducts.ToListAsync(ct);
        var productsFound = await db.Products.CountAsync(x => ids.Contains(x.ProductId) && x.IsActive, ct);
        if (productsFound != ids.Length) throw new KeyNotFoundException("One or more active products were not found.");
        foreach (var item in items)
        {
            var current = existing.SingleOrDefault(x => x.ProductId == item.ProductId);
            if (current is null)
                db.FeaturedProducts.Add(new FeaturedProduct { ProductId = item.ProductId, DisplayOrder = item.DisplayOrder, ShowAsNew = item.ShowAsNew });
            else
            {
                current.DisplayOrder = item.DisplayOrder;
                current.ShowAsNew = item.ShowAsNew;
            }
        }
        db.FeaturedProducts.RemoveRange(existing.Where(x => !ids.Contains(x.ProductId)));
        await db.SaveChangesAsync(ct);
    }

    public async Task IncrementVisitAsync(int productId, CancellationToken ct) =>
        _ = await db.Products.Where(x => x.ProductId == productId && x.IsActive)
            .ExecuteUpdateAsync(s => s.SetProperty(x => x.TotalVisits, x => x.TotalVisits + 1), ct);

    private async Task ValidateRelationsAsync(SaveProductRequest r, CancellationToken ct)
    {
        if (r.BrandId.HasValue && !await db.Brands.AnyAsync(x => x.BrandId == r.BrandId && x.IsActive, ct))
            throw new KeyNotFoundException("The selected brand does not exist or is inactive.");
        var ids = r.CategoryIds.Distinct().ToArray();
        if (ids.Length != 0 && await db.Categories.CountAsync(x => ids.Contains(x.CategoryId) && x.IsActive, ct) != ids.Length)
            throw new KeyNotFoundException("One or more selected categories do not exist or are inactive.");
    }

    private static string? NullIfEmpty(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

}
