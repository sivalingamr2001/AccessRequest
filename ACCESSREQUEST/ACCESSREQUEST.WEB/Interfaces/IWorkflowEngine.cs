using ACCESSREQUEST.WEB.Models;

namespace ACCESSREQUEST.WEB.Interfaces;

public interface IWorkflowEngine
{
    Task<string> CreateRequestAsync(RequestCreationPayload payload);
    Task HandleHodApprovalAsync(int itemId, string hodUser, bool isApproved, string? comments = null, string? confirmAccessType = null);
    Task HandleFolderOwnerApprovalAsync(int itemId, string ownerUser, bool isApproved, string? comments = null, string? confirmAccessType = null);
    Task HandleOperatorActionAsync(int itemId, string operatorUser, bool isApproved, string? comments = null);
    Task<bool> HandleRevokeAccessAsync(int itemId, string operatorUser, string comments);
    Task<IEnumerable<TicketDto>> GetAllTicketsAsync();
    Task<IEnumerable<ApprovalLogDto>> GetApprovalLogsAsync(int itemId);
    Task<IEnumerable<AuditLogDetailDto>> GetAllAuditLogsAsync();
    Task<IEnumerable<ParsedFolderPathDto>> GetParsedFolderPathsAsync();
    Task<bool> ResubmitItemAsync(int itemId, string folderPath, string accessType, string reasonForAccess, string username);
    Task<bool> InsertMailLogAsync(MailLogDto mailDto);
    Task<IEnumerable<FolderMappingDto>> GetAllFolderMappingsAsync();
    Task<int> AddFolderMappingAsync(FolderMappingDto mapping);
    Task<bool> UpdateFolderMappingAsync(FolderMappingDto mapping);
    Task<bool> DeleteFolderMappingAsync(int id);
}
