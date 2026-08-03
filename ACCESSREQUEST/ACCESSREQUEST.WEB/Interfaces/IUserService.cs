using ACCESSREQUEST.WEB.Models;

namespace ACCESSREQUEST.WEB.Interfaces;

public interface IUserService
{
    Task<UserDetailsDto?> LoginAsync(string username, string password);
    Task<IEnumerable<UserDetailsDto>> GetAllUsersAsync();
    Task<UserDetailsDto?> GetUserByIdAsync(int userId);
    Task<UserDetailsDto?> GetUserByIdentifierAsync(string identifier);
    Task<IEnumerable<UserDetailsDto>> GetAllHodsAsync();
    Task<bool> UpdateUserRolesAndLocationAsync(int userId, List<string> roles, string location);
}
