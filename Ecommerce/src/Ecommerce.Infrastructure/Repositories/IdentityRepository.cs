using Ecommerce.Application.Contracts;
using Ecommerce.Application.Common;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace Ecommerce.Infrastructure.Repositories;

public sealed class IdentityRepository(EcommerceDbContext db) : IIdentityRepository
{
    public async Task<(User? User, UserProfile? Profile, IReadOnlyList<string> Roles)> FindByEmailAsync(string email, CancellationToken ct)
    {
        var user = await db.Users.AsNoTracking().Include(x => x.Person).Include(x => x.UserRoles).ThenInclude(x => x.Role)
            .SingleOrDefaultAsync(x => x.Person.Email == email, ct);
        if (user is null || !user.Person.IsActive) return (null, null, Array.Empty<string>());
        var roles = user.UserRoles.Select(x => x.Role.RoleName).Order().ToArray();
        return (user, ToProfile(user, roles), roles);
    }

    public async Task<(int UserId, UserProfile Profile)> RegisterAsync(RegisterRequest request, string passwordHash, CancellationToken ct)
    {
        var strategy = db.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            db.ChangeTracker.Clear();
            await using var tx = await db.Database.BeginTransactionAsync(ct);
            var person = await db.People.SingleOrDefaultAsync(x => x.Email == request.Email.Trim(), ct);
            if (person is not null && await db.Users.AnyAsync(x => x.PersonId == person.PersonId, ct))
                throw new ConflictException("An account already exists for this email address.");
            if (person is null)
            {
                person = new Person { FirstName = request.FirstName.Trim(), LastName = request.LastName.Trim(),
                    Email = request.Email.Trim(), Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim(),
                    IsActive = true };
                db.People.Add(person);
                await db.SaveChangesAsync(ct);
            }
            else
            {
                person.FirstName = request.FirstName.Trim(); person.LastName = request.LastName.Trim();
                person.Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim();
                person.IsActive = true;
            }
            if (!await db.Roles.AnyAsync(x => x.RoleId == LegacyRoles.Customer, ct))
                throw new InvalidOperationException("The legacy customer role (RoleId 2) is missing from the database.");
            var user = new User { Username = null, PersonId = person.PersonId, PasswordHash = passwordHash };
            db.Users.Add(user);
            await db.SaveChangesAsync(ct);
            db.UserRoles.Add(new UserRole { UserId = user.UserId, RoleId = LegacyRoles.Customer });
            await db.SaveChangesAsync(ct);
            var roleName = await db.Roles.Where(x => x.RoleId == LegacyRoles.Customer).Select(x => x.RoleName).SingleAsync(ct);
            var profile = new UserProfile(user.UserId, person.PersonId, person.Email, user.Username,
                person.FirstName, person.LastName, person.Phone, [roleName]);
            await tx.CommitAsync(ct);
            return (user.UserId, profile);
        });
    }

    public async Task<UserProfile?> GetProfileAsync(int userId, CancellationToken ct)
    {
        var user = await db.Users.AsNoTracking().Include(x => x.Person).Include(x => x.UserRoles).ThenInclude(x => x.Role)
            .SingleOrDefaultAsync(x => x.UserId == userId && x.Person.IsActive, ct);
        return user is null ? null : ToProfile(user, user.UserRoles.Select(x => x.Role.RoleName).Order().ToArray());
    }

    public async Task<bool> UpdateProfileAsync(int userId, UpdateProfileRequest request, CancellationToken ct)
    {
        var person = await db.Users.Where(x => x.UserId == userId).Select(x => x.Person).SingleOrDefaultAsync(ct);
        if (person is null || !person.IsActive) return false;
        person.FirstName = request.FirstName.Trim(); person.LastName = request.LastName.Trim();
        person.Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim();
        await db.SaveChangesAsync(ct); return true;
    }

    public Task<User?> GetUserForPasswordChangeAsync(int userId, CancellationToken ct) =>
        db.Users.SingleOrDefaultAsync(x => x.UserId == userId && x.Person.IsActive, ct);

    public async Task<IReadOnlyList<AdminUser>> ListUsersAsync(CancellationToken ct) => await db.Users.AsNoTracking()
        .Where(x => x.Person.IsActive).OrderBy(x => x.UserId)
        .Select(x => new AdminUser(x.UserId, x.PersonId, x.Person.Email, x.Username,
            x.Person.FirstName, x.Person.LastName, x.UserRoles.Select(r => r.Role.RoleName).Order().ToList()))
        .ToListAsync(ct);

    public async Task<bool> UpdateRolesAsync(int targetUserId, IReadOnlyList<byte> roleIds, int actingUserId, CancellationToken ct)
    {
        var requested = roleIds.Distinct().ToArray();
        var strategy = db.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            db.ChangeTracker.Clear();
            await using var tx = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
            if (!await db.Users.AnyAsync(x => x.UserId == targetUserId, ct)) return false;
            if (await db.Roles.CountAsync(x => requested.Contains(x.RoleId), ct) != requested.Length)
                throw new NotFoundException("One or more role IDs do not exist.");
            var current = await db.UserRoles.Where(x => x.UserId == targetUserId).ToListAsync(ct);
            if (targetUserId == actingUserId && current.Any(x => x.RoleId == LegacyRoles.Admin) && !requested.Contains(LegacyRoles.Admin))
                throw new ConflictException("An administrator cannot remove their own administrator role.");
            if (current.Any(x => x.RoleId == LegacyRoles.Admin) && !requested.Contains(LegacyRoles.Admin))
            {
                var admins = await db.UserRoles.CountAsync(x => x.RoleId == LegacyRoles.Admin, ct);
                if (admins <= 1) throw new ConflictException("The final administrator role cannot be removed.");
            }
            db.UserRoles.RemoveRange(current.Where(x => !requested.Contains(x.RoleId)));
            var oldIds = current.Select(x => x.RoleId).ToHashSet();
            foreach (var id in requested.Where(x => !oldIds.Contains(x)))
                db.UserRoles.Add(new UserRole { UserId = targetUserId, RoleId = id });
            await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return true;
        });
    }

    public async Task SavePasswordHashAsync(int userId, string passwordHash, CancellationToken ct)
    {
        var user = await db.Users.SingleOrDefaultAsync(x => x.UserId == userId, ct)
            ?? throw new NotFoundException("User account was not found.");
        user.PasswordHash = passwordHash;
        await db.SaveChangesAsync(ct);
    }

    private static UserProfile ToProfile(User user, IReadOnlyList<string> roles) => new(user.UserId,
        user.Person.PersonId, user.Person.Email, user.Username, user.Person.FirstName,
        user.Person.LastName, user.Person.Phone, roles);
}
