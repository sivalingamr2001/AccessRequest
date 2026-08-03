using Microsoft.AspNetCore.Mvc;
using ACCESSREQUEST.WEB.Interfaces;
using ACCESSREQUEST.WEB.Models;

namespace ACCESSREQUEST.WEB.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LoginController : ControllerBase
{
    private readonly IUserService _userService;

    public LoginController(IUserService userService)
    {
        _userService = userService ?? throw new ArgumentNullException(nameof(userService));
    }

    [HttpPost]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("Username and Password are required.");
        }

        try
        {
            var user = await _userService.LoginAsync(request.Username, request.Password);
            if (user == null)
            {
                return Unauthorized("Invalid credentials.");
            }

            return Ok(user);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred during login: {ex.Message}");
        }
    }
}
