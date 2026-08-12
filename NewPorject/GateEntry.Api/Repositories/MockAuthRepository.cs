using System.Threading.Tasks;
using GateEntry.Api.Models;

namespace GateEntry.Api.Repositories
{
    public class MockAuthRepository : IAuthRepository
    {
        public Task<LoginResponse> AuthenticateRoleAsync(string role)
        {
            var response = new LoginResponse
            {
                Success = true,
                Role = role.ToUpper(),
                Unit = "UNIT7",
                OrgId = "444",
                ModifyFlag = 1,
                Token = "mock-jwt-token-for-gate-entry-system",
                Message = "Mock Authentication successful"
            };

            return Task.FromResult(response);
        }

        public Task<bool> VerifyUserPasswordAsync(string username, string password)
        {
            // Allow any test password
            return Task.FromResult(password == "admin" || password == "password");
        }

        public Task<bool> ChangePasswordAsync(string username, string currentPassword, string newPassword)
        {
            return Task.FromResult(true);
        }
    }
}
