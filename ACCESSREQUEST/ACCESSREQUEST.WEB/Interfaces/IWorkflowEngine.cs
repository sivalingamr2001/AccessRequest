using ACCESSREQUEST.WEB.Models;

namespace ACCESSREQUEST.WEB.Interfaces;

public interface IWorkflowEngine
{
    Task<string> CreateRequestAsync(RequestCreationPayload payload);
    Task HandleHodApprovalAsync(int itemId, string hodUser, bool isApproved);
    Task HandleFolderOwnerApprovalAsync(int itemId, string ownerUser, bool isApproved);
    Task HandleOperatorActionAsync(int itemId, string operatorUser, bool isApproved);
    Task<IEnumerable<TicketDto>> GetAllTicketsAsync();
    Task<IEnumerable<ApprovalLogDto>> GetApprovalLogsAsync(int itemId);
    Task<IEnumerable<ParsedFolderPathDto>> GetParsedFolderPathsAsync();
}
