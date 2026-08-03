namespace ACCESSREQUEST.WEB.Interfaces;

public interface INotificationService
{
    Task SendAsync(string recipient, string subject, string body);
}
