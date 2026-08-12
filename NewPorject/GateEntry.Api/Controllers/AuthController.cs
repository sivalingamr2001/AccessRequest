using System.Threading.Tasks;
using GateEntry.Api.Models;
using GateEntry.Api.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace GateEntry.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthRepository _authRepository;

        public AuthController(IAuthRepository authRepository)
        {
            _authRepository = authRepository;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Role))
            {
                return BadRequest(new LoginResponse { Success = false, Message = "Role parameter is required" });
            }

            // Simple login verification if username/password are supplied
            if (!string.IsNullOrWhiteSpace(request.Username) && !string.IsNullOrWhiteSpace(request.Password))
            {
                bool userValid = await _authRepository.VerifyUserPasswordAsync(request.Username, request.Password);
                if (!userValid)
                {
                    return Unauthorized(new LoginResponse { Success = false, Message = "Invalid username or password" });
                }
            }

            var response = await _authRepository.AuthenticateRoleAsync(request.Role);
            if (!response.Success)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromQuery] string username, [FromQuery] string currentPassword, [FromQuery] string newPassword)
        {
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(currentPassword) || string.IsNullOrWhiteSpace(newPassword))
            {
                return BadRequest("Invalid input values");
            }

            bool success = await _authRepository.ChangePasswordAsync(username, currentPassword, newPassword);
            if (!success)
            {
                return BadRequest("Password change failed. Verify credentials.");
            }

            return Ok("Password updated successfully");
        }
    }
}
