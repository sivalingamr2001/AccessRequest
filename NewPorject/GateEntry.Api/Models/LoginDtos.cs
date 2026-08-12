namespace GateEntry.Api.Models
{
    public class LoginRequest
    {
        public string Role { get; set; } = null!;
        public string? Username { get; set; }
        public string? Password { get; set; }
    }

    public class LoginResponse
    {
        public bool Success { get; set; }
        public string? Role { get; set; }
        public string? Unit { get; set; }
        public string? OrgId { get; set; }
        public int ModifyFlag { get; set; }
        public string? Token { get; set; }
        public string? Message { get; set; }
    }
}
