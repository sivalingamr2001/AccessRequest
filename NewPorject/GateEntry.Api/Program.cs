using GateEntry.Api.Repositories;
using GateEntry.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Configure CORS for frontend access
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Configure Repository Dependency Injections
bool useMockDb = builder.Configuration.GetValue<bool>("UseMockDatabase");

if (useMockDb)
{
    // Use Singletons for mock repositories to maintain in-memory state across requests
    builder.Services.AddSingleton<IAuthRepository, MockAuthRepository>();
    builder.Services.AddSingleton<IGateRepository, MockGateRepository>();
    builder.Services.AddSingleton<IAsnRepository, MockAsnRepository>();
    builder.Services.AddSingleton<ILookupRepository, MockLookupRepository>();
}
else
{
    // Real SQL-based repositories
    builder.Services.AddSingleton<DbConnectionFactory>();
    builder.Services.AddScoped<IAuthRepository, DapperAuthRepository>();
    builder.Services.AddScoped<IGateRepository, DapperGateRepository>();
    builder.Services.AddScoped<IAsnRepository, DapperAsnRepository>();
    builder.Services.AddScoped<ILookupRepository, DapperLookupRepository>();
}

// Business Rules Validation Service
builder.Services.AddScoped<IGateValidationService, GateValidationService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowAll");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

