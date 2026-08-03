using Microsoft.AspNetCore.Mvc;
using ACCESSREQUEST.WEB.Interfaces;
using ACCESSREQUEST.WEB.Models;

namespace ACCESSREQUEST.WEB.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService ?? throw new ArgumentNullException(nameof(userService));
    }

    [HttpGet]
    public async Task<IActionResult> GetAllUsers()
    {
        try
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while retrieving users: {ex.Message}");
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetUserById(int id)
    {
        try
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound($"User with ID {id} not found.");
            }
            return Ok(user);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while retrieving user details: {ex.Message}");
        }
    }

    [HttpGet("identifier/{identifier}")]
    public async Task<IActionResult> GetUserByIdentifier(string identifier)
    {
        if (string.IsNullOrWhiteSpace(identifier))
        {
            return BadRequest("Identifier is required.");
        }

        try
        {
            var user = await _userService.GetUserByIdentifierAsync(identifier);
            if (user == null)
            {
                return NotFound($"User with identifier '{identifier}' not found.");
            }
            return Ok(user);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while searching for user: {ex.Message}");
        }
    }

    [HttpGet("hods")]
    public async Task<IActionResult> GetAllHods()
    {
        try
        {
            var hods = await _userService.GetAllHodsAsync();
            return Ok(hods);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while retrieving HODs: {ex.Message}");
        }
    }

    [HttpPut("{id:int}/roles-location")]
    public async Task<IActionResult> UpdateUserRolesAndLocation(int id, [FromBody] UpdateUserRolesRequest request)
    {
        if (request == null || request.Roles == null)
        {
            return BadRequest("Invalid roles/location update payload.");
        }

        try
        {
            var updated = await _userService.UpdateUserRolesAndLocationAsync(id, request.Roles, request.Location);
            if (!updated)
            {
                return NotFound($"User with ID {id} not found.");
            }

            return Ok(new { Message = "User roles and location updated successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while updating user roles and location: {ex.Message}");
        }
    }
}
