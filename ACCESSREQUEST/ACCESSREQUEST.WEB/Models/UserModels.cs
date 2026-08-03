using System.Text.Json.Serialization;

namespace ACCESSREQUEST.WEB.Models;

public class UserDetailsDto
{
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string EmpId { get; set; } = string.Empty;
    public string PhoneNo { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int DeptId { get; set; }
    public List<string> Roles { get; set; } = new();
    public string Location { get; set; } = string.Empty;
}

public class UserDbResult
{
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string EmpId { get; set; } = string.Empty;
    public string PhoneNo { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int DeptId { get; set; }
    public string RolesJson { get; set; } = "[]";
    public string Location { get; set; } = string.Empty;
}

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class UpdateUserRolesRequest
{
    public List<string> Roles { get; set; } = new();
    public string Location { get; set; } = string.Empty;
}
