using System;
using System.Data;
using System.Threading.Tasks;
using Dapper;
using GateEntry.Api.Models;

namespace GateEntry.Api.Repositories
{
    public class DapperAuthRepository : IAuthRepository
    {
        private readonly DbConnectionFactory _connectionFactory;

        public DapperAuthRepository(DbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<LoginResponse> AuthenticateRoleAsync(string role)
        {
            using var connection = _connectionFactory.CreateOracleConnection();
            const string sql = "SELECT role AS Role, unit AS Unit, orgid AS OrgId, modify_flag AS ModifyFlag FROM jan_gate_login WHERE role = :Role";
            
            try
            {
                var userRole = await connection.QueryFirstOrDefaultAsync<dynamic>(sql, new { Role = role });
                if (userRole != null)
                {
                    return new LoginResponse
                    {
                        Success = true,
                        Role = userRole.ROLE,
                        Unit = userRole.UNIT,
                        OrgId = Convert.ToString(userRole.ORGID),
                        ModifyFlag = Convert.ToInt32(userRole.MODIFYFLAG),
                        Message = "Authentication successful"
                    };
                }
            }
            catch (Exception ex)
            {
                return new LoginResponse
                {
                    Success = false,
                    Message = $"Database login check failed: {ex.Message}"
                };
            }

            return new LoginResponse
            {
                Success = false,
                Message = "Role not found in configuration database"
            };
        }

        public async Task<bool> VerifyUserPasswordAsync(string username, string password)
        {
            using var connection = _connectionFactory.CreateOracleConnection();
            const string sql = "SELECT COUNT(*) FROM jan_gate_users WHERE username = :Username AND password = :Password AND active = 'Y'";
            try
            {
                int count = await connection.ExecuteScalarAsync<int>(sql, new { Username = username, Password = password });
                return count > 0;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> ChangePasswordAsync(string username, string currentPassword, string newPassword)
        {
            using var connection = _connectionFactory.CreateOracleConnection();
            const string sql = "UPDATE jan_gate_users SET password = :NewPassword WHERE username = :Username AND password = :CurrentPassword";
            try
            {
                int rows = await connection.ExecuteAsync(sql, new { NewPassword = newPassword, Username = username, CurrentPassword = currentPassword });
                return rows > 0;
            }
            catch
            {
                return false;
            }
        }
    }
}
