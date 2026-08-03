using ACCESSREQUEST.WEB.Interfaces;
using ACCESSREQUEST.WEB.Models;
using DynamicTransaction.Interfaces;
using System.Text.Json;

namespace ACCESSREQUEST.WEB.Services;

public class UserService : IUserService
{
    private readonly IDynamicQueryExecutor _queryExecutor;

    public UserService(IDynamicQueryExecutor queryExecutor)
    {
        _queryExecutor = queryExecutor ?? throw new ArgumentNullException(nameof(queryExecutor));
    }

    public async Task<UserDetailsDto?> LoginAsync(string username, string password)
    {
        var result = await _queryExecutor.QuerySingleOrDefaultAsync<UserDbResult>(
            UserQueries.Login,
            new { Username = username, Password = password }
        );

        return result == null ? null : MapResult(result);
    }

    public async Task<IEnumerable<UserDetailsDto>> GetAllUsersAsync()
    {
        var results = await _queryExecutor.QueryAsync<UserDbResult>(UserQueries.GetAllUsers);
        return results.Select(MapResult);
    }

    public async Task<UserDetailsDto?> GetUserByIdAsync(int userId)
    {
        var result = await _queryExecutor.QuerySingleOrDefaultAsync<UserDbResult>(
            UserQueries.GetUserById,
            new { UserId = userId }
        );

        return result == null ? null : MapResult(result);
    }

    public async Task<UserDetailsDto?> GetUserByIdentifierAsync(string identifier)
    {
        int.TryParse(identifier, out int idOrZero);

        var result = await _queryExecutor.QuerySingleOrDefaultAsync<UserDbResult>(
            UserQueries.GetUserByIdentifier,
            new { IdOrZero = idOrZero, Identifier = identifier }
        );

        return result == null ? null : MapResult(result);
    }

    public async Task<IEnumerable<UserDetailsDto>> GetAllHodsAsync()
    {
        var results = await _queryExecutor.QueryAsync<UserDbResult>(UserQueries.GetAllHods);
        return results.Select(MapResult);
    }

    public async Task<bool> UpdateUserRolesAndLocationAsync(int userId, List<string> roles, string location)
    {
        // Check if user exists first to return proper status
        var user = await GetUserByIdAsync(userId);
        if (user == null)
        {
            return false;
        }

        await _queryExecutor.ExecuteInTransactionAsync(async tx =>
        {
            // 1. Delete all current roles
            await _queryExecutor.ExecuteAsync(UserQueries.DeleteUserRoles, new { UserId = userId }, tx);

            // 2. Insert new roles with designated location
            foreach (var role in roles)
            {
                await _queryExecutor.ExecuteAsync(UserQueries.InsertUserRole, new
                {
                    UserId = userId,
                    Role = role,
                    Location = location
                }, tx);
            }

            return 1;
        });

        return true;
    }

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
