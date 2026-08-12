using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Oracle.ManagedDataAccess.Client;

namespace GateEntry.Api.Repositories
{
    public class DbConnectionFactory
    {
        private readonly IConfiguration _configuration;

        public DbConnectionFactory(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public IDbConnection CreateOracleConnection()
        {
            var connectionString = _configuration.GetConnectionString("OracleDefaultConnection");
            return new OracleConnection(connectionString);
        }

        public IDbConnection CreateSqlServerConnection()
        {
            var connectionString = _configuration.GetConnectionString("SqlServerScmConnection");
            return new SqlConnection(connectionString);
        }
    }
}
