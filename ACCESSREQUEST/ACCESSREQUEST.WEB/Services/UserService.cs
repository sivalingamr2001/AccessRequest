using ACCESSREQUEST.WEB.Interfaces;
using ACCESSREQUEST.WEB.Models;
using DynamicTransaction.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Text.Json;

namespace ACCESSREQUEST.WEB.Services;

public class UserService : IUserService
{
    private readonly IDynamicQueryExecutor _queryExecutor;
    private readonly string _loginConnectionString;
    private readonly string _workspaceConnectionString;

    public UserService(IDynamicQueryExecutor queryExecutor, IConfiguration configuration)
    {
        _queryExecutor = queryExecutor ?? throw new ArgumentNullException(nameof(queryExecutor));
        _loginConnectionString = configuration.GetConnectionString("LoginConnection")
            ?? configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("No login connection string was configured.");
        _workspaceConnectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection string is missing.");
    }

    public async Task<UserDetailsDto?> LoginAsync(string username, string password)
    {
        var result = await _queryExecutor.QuerySingleOrDefaultAsync<UserDbResult>(
            UserQueries.Login,
            new { Username = username, Password = password },
            connectionString: _loginConnectionString
        );

        if (result == null)
        {
            return null;
        }

        await EnrichUserWithWorkspaceDataAsync(result);
        return MapResult(result);
    }

    public async Task<IEnumerable<UserDetailsDto>> GetAllUsersAsync()
    {
        var results = await _queryExecutor.QueryAsync<UserDbResult>(
            UserQueries.GetAllUsers,
            connectionString: _loginConnectionString
        );

        await EnrichUsersWithWorkspaceDataAsync(results);
        return results.Select(MapResult);
    }

    public async Task<UserDetailsDto?> GetUserByIdAsync(int userId)
    {
        var result = await _queryExecutor.QuerySingleOrDefaultAsync<UserDbResult>(
            UserQueries.GetUserById,
            new { UserId = userId },
            connectionString: _loginConnectionString
        );

        if (result == null)
        {
            return null;
        }

        await EnrichUserWithWorkspaceDataAsync(result);
        return MapResult(result);
    }

    public async Task<UserDetailsDto?> GetUserByIdentifierAsync(string identifier)
    {
        int.TryParse(identifier, out int idOrZero);

        var result = await _queryExecutor.QuerySingleOrDefaultAsync<UserDbResult>(
            UserQueries.GetUserByIdentifier,
            new { IdOrZero = idOrZero, Identifier = identifier },
            connectionString: _loginConnectionString
        );

        if (result == null)
        {
            return null;
        }

        await EnrichUserWithWorkspaceDataAsync(result);
        return MapResult(result);
    }

    public async Task<IEnumerable<UserDetailsDto>> GetAllHodsAsync()
    {
        var results = await _queryExecutor.QueryAsync<UserDbResult>(
            UserQueries.GetAllHods,
            connectionString: _loginConnectionString
        );

        await EnrichUsersWithWorkspaceDataAsync(results, roleFilter: "Hod");
        return results
            .Select(MapResult)
            .Where(dto => dto.Roles.Any())
            .ToList();
    }

    public async Task<bool> UpdateUserRolesAndLocationAsync(int userId, List<string> roles, string location)
    {
        var user = await GetUserByIdAsync(userId);
        if (user == null)
        {
            return false;
        }

        await _queryExecutor.ExecuteInTransactionAsync(async tx =>
        {
            await _queryExecutor.ExecuteAsync(
                UserQueries.DeleteUserRoles,
                new { UserId = userId },
                tx,
                connectionString: _workspaceConnectionString
            );

            foreach (var role in roles)
            {
                await _queryExecutor.ExecuteAsync(
                    UserQueries.InsertUserRole,
                    new
                    {
                        UserId = userId,
                        Role = role,
                        Location = location
                    },
                    tx,
                    connectionString: _workspaceConnectionString
                );
            }

            return 1;
        }, connectionString: _workspaceConnectionString);

        return true;
    }

    private async Task EnrichUsersWithWorkspaceDataAsync(IEnumerable<UserDbResult> users, string? roleFilter = null)
    {
        var userIds = users
            .Select(u => u.UserId)
            .Where(id => id > 0)
            .Distinct()
            .ToList();

        if (userIds.Count == 0)
        {
            return;
        }

        var workspaceRows = await _queryExecutor.QueryAsync<UserRoleLocationRow>(
            "SELECT Id, Role, Location FROM jan_portal_user WHERE Id IN @Ids AND IsActive = 1",
            new { Ids = userIds },
            connectionString: _workspaceConnectionString
        );

        var filteredRows = roleFilter is null
            ? workspaceRows
            : workspaceRows.Where(r => string.Equals(r.Role, roleFilter, StringComparison.OrdinalIgnoreCase));

        var workspaceByUserId = filteredRows
            .GroupBy(r => r.Id)
            .ToDictionary(
                g => g.Key,
                g => new UserRoleLocationData(
                    Roles: g.Where(r => !string.IsNullOrWhiteSpace(r.Role))
                        .Select(r => r.Role!)
                        .Distinct(StringComparer.OrdinalIgnoreCase)
                        .ToList(),
                    Location: g.Select(r => r.Location)
                        .FirstOrDefault(r => !string.IsNullOrWhiteSpace(r)) ?? string.Empty
                )
            );

        foreach (var user in users)
        {
            if (workspaceByUserId.TryGetValue(user.UserId, out var roleData))
            {
                user.RolesJson = JsonSerializer.Serialize(roleData.Roles);
                user.Location = roleData.Location;
            }
            else
            {
                user.RolesJson = "[]";
                user.Location = string.Empty;
            }
        }
    }

    private Task EnrichUserWithWorkspaceDataAsync(UserDbResult user)
    {
        return EnrichUsersWithWorkspaceDataAsync(new[] { user });
    }

    private sealed record UserRoleLocationRow(int Id, string? Role, string? Location);
    private sealed record UserRoleLocationData(List<string> Roles, string Location);

    private static UserDetailsDto MapResult(UserDbResult res)
    {
        List<string> roles = new();
        try
        {
            if (!string.IsNullOrWhiteSpace(res.RolesJson))
            {
                roles = JsonSerializer.Deserialize<List<string>>(res.RolesJson) ?? new();
            }
        }
        catch
        {
            // fallback: in case GROUP_CONCAT or DB output is malformed, split or ignore
        }

        return new UserDetailsDto
        {
            UserId = res.UserId,
            UserName = res.UserName,
            EmpId = res.EmpId,
            PhoneNo = res.PhoneNo,
            Email = res.Email,
            DeptId = res.DeptId,
            Roles = roles,
            Location = res.Location
        };
    }
}
