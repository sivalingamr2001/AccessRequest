using ACCESSREQUEST.WEB.Services;
using ACCESSREQUEST.WEB.Interfaces;
using DynamicTransaction;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDynamicQueryInfrastructure<MySqlConnectionFactory>();
builder.Services.AddScoped<INotificationService, ConsoleNotificationService>();
builder.Services.AddScoped<IWorkflowEngine, WorkflowEngine>();
builder.Services.AddScoped<IUserService, UserService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();
