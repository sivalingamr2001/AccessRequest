using ACCESSREQUEST.WEB.Interfaces;
using Microsoft.Extensions.Logging;

namespace ACCESSREQUEST.WEB.Services;

public class ConsoleNotificationService : INotificationService
{
    private readonly ILogger<ConsoleNotificationService> _logger;

    public ConsoleNotificationService(ILogger<ConsoleNotificationService> _logger)
    {
        this._logger = _logger;
    }

    public Task SendAsync(string recipient, string subject, string body)
    {
        _logger.LogInformation("Sending notification to {Recipient}:\nSubject: {Subject}\nBody: {Body}", recipient, subject, body);
        return Task.CompletedTask;
    }
}
