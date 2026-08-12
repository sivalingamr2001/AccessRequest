using System.Threading.Tasks;
using GateEntry.Api.Models;

namespace GateEntry.Api.Repositories
{
    public interface IAuthRepository
    {
        Task<LoginResponse> AuthenticateRoleAsync(string role);
        Task<bool> VerifyUserPasswordAsync(string username, string password);
        Task<bool> ChangePasswordAsync(string username, string currentPassword, string newPassword);
    }
}
