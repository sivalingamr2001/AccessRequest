using System.Data;
using MySqlConnector;
using DynamicTransaction.Interfaces;
using Microsoft.Extensions.Configuration;

namespace ACCESSREQUEST.WEB.Services;

public class MySqlConnectionFactory : IDbConnectionFactory
{
    private readonly string _connectionString;

    public MySqlConnectionFactory(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? throw new InvalidOperationException("DefaultConnection string is missing.");
    }

    public IAsyncDbConnectionWrapper CreateConnection(string? connectionStringOverride = null)
    {
        var conn = new MySqlConnection(connectionStringOverride ?? _connectionString);
        return new MySqlConnectionWrapper(conn);
    }
}

public class MySqlConnectionWrapper : IAsyncDbConnectionWrapper
{
    public IDbConnection Connection { get; }

    public MySqlConnectionWrapper(IDbConnection connection)
    {
        Connection = connection ?? throw new ArgumentNullException(nameof(connection));
    }

    public void Dispose()
    {
        Connection.Dispose();
    }

    public async ValueTask DisposeAsync()
    {
        if (Connection is IAsyncDisposable asyncDisposable)
        {
            await asyncDisposable.DisposeAsync();
        }
        else
        {
            Connection.Dispose();
        }
    }
}
