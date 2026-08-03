using System.Data;
using ACCESSREQUEST.WEB.Interfaces;
using ACCESSREQUEST.WEB.Models;
using DynamicTransaction.Interfaces;

namespace ACCESSREQUEST.WEB.Services;

public class WorkflowEngine : IWorkflowEngine
{
    private readonly IDynamicQueryExecutor _queryExecutor;
    private readonly INotificationService _notifier;

    public WorkflowEngine(IDynamicQueryExecutor queryExecutor, INotificationService notifier)
    {
        _queryExecutor = queryExecutor ?? throw new ArgumentNullException(nameof(queryExecutor));
        _notifier = notifier ?? throw new ArgumentNullException(nameof(notifier));
    }

    // STAGE 1: Request Submission using precise properties
    public async Task<string> CreateRequestAsync(RequestCreationPayload payload)
    {
        string sequentialTicketNumber = string.Empty;

        await _queryExecutor.ExecuteInTransactionAsync(async tx =>
        {
            // Initial placeholder step to fetch sequential ID securely
            int generatedId = await _queryExecutor.ExecuteScalarAsync<int>(
                WorkflowEngineQueries.InsertRequest,
                new
                {
                    ReqTo = payload.ReqTo,
                    CreatedBy = payload.CreatedBy
                },
                tx);

            // Compute sequential padding code (e.g. REQ-00000104)
            sequentialTicketNumber = $"REQ-{generatedId:D8}";

            await _queryExecutor.ExecuteAsync(
                WorkflowEngineQueries.UpdateRequestTicket,
                new { TicketNumber = sequentialTicketNumber, Id = generatedId },
                tx);

            // Save individual items containing specific justification criteria
            foreach (var item in payload.Items)
            {
                await _queryExecutor.ExecuteAsync(
                    WorkflowEngineQueries.InsertAccessItem,
                    new
                    {
                        RequestId = generatedId,
                        AccessType = item.AccessType,
                        FolderPath = item.FolderPath,
                        ReasonForAccess = item.ReasonForAccess,
                        CreatedBy = payload.CreatedBy
                    },
                    tx);
            }

            return 1;
        });

        // Run backend alerts after transaction commits
        await _notifier.SendAsync(payload.CreatedBy, "Ticket Created", $"Your request is active: {sequentialTicketNumber}");
        await _notifier.SendAsync("hod_dept@company.com", "HOD Review Required", $"New ticket {sequentialTicketNumber} needs evaluation.");

        return sequentialTicketNumber;
    }

    // STAGE 2: Department HOD Review with detailed property maps
    public async Task HandleHodApprovalAsync(int itemId, string hodUser, bool isApproved)
    {
        bool isPendingOperator = false;
        bool isPendingFolderOwner = false;
        string? folderPath = null;

        await _queryExecutor.ExecuteInTransactionAsync(async tx =>
        {
            await _queryExecutor.ExecuteAsync(
                WorkflowEngineQueries.InsertApprovalLog,
                new
                {
                    ItemId = itemId,
                    ApproverRole = "DEPT_HOD",
                    ApprovedBy = hodUser,
                    ActionTaken = isApproved ? "APPROVED" : "REJECTED"
                },
                tx);

            if (!isApproved)
            {
                await _queryExecutor.ExecuteAsync(
                    WorkflowEngineQueries.UpdateAccessItemStatus,
                    new { Status = "REJECTED_BY_DEPT_HOD", Id = itemId },
                    tx);
                return 0;
            }

            // Pull matching item parameters
            var item = await _queryExecutor.QuerySingleOrDefaultAsync<AccessItemDto>(
                WorkflowEngineQueries.GetAccessItem,
                new { Id = itemId },
                tx);

            if (item == null)
            {
                throw new InvalidOperationException($"Access item with ID {itemId} not found.");
            }

            folderPath = item.FolderPath;
            bool departmentsMatch = CheckIfDepartmentsMatch(item.CreatedBy, item.FolderPath);

            if (departmentsMatch)
            {
                await _queryExecutor.ExecuteAsync(
                    WorkflowEngineQueries.UpdateAccessItemStatus,
                    new { Status = "PENDING_OPERATOR", Id = itemId },
                    tx);
                isPendingOperator = true;
            }
            else
            {
                await _queryExecutor.ExecuteAsync(
                    WorkflowEngineQueries.UpdateAccessItemStatus,
                    new { Status = "PENDING_FOLDER_OWNER", Id = itemId },
                    tx);
                isPendingFolderOwner = true;
            }

            return 1;
        });

        if (isPendingOperator)
        {
            await _notifier.SendAsync("operators@company.com", "Fulfillment Pipeline Entry", $"Item #{itemId} passed HOD.");
        }
        else if (isPendingFolderOwner)
        {
            await _notifier.SendAsync("folder_owner@company.com", "Cross-Dept Action Needed", $"User request for path {folderPath} needs verification.");
        }
    }

    // STAGE 3: Folder Owner Verification
    public async Task HandleFolderOwnerApprovalAsync(int itemId, string ownerUser, bool isApproved)
    {
        bool isPendingOperator = false;

        await _queryExecutor.ExecuteInTransactionAsync(async tx =>
        {
            await _queryExecutor.ExecuteAsync(
                WorkflowEngineQueries.InsertApprovalLog,
                new
                {
                    ItemId = itemId,
                    ApproverRole = "FOLDER_OWNER",
                    ApprovedBy = ownerUser,
                    ActionTaken = isApproved ? "APPROVED" : "REJECTED"
                },
                tx);

            if (!isApproved)
            {
                await _queryExecutor.ExecuteAsync(
                    WorkflowEngineQueries.UpdateAccessItemStatus,
                    new { Status = "REJECTED_BY_FOLDER_OWNER", Id = itemId },
                    tx);
                return 0;
            }

            await _queryExecutor.ExecuteAsync(
                WorkflowEngineQueries.UpdateAccessItemStatus,
                new { Status = "PENDING_OPERATOR", Id = itemId },
                tx);
            isPendingOperator = true;
            return 1;
        });

        if (isPendingOperator)
        {
            await _notifier.SendAsync("operators@company.com", "Ready to Grant", $"Item #{itemId} approved by folder owner.");
        }
    }

    // STAGE 4: Operator Execution Block
    public async Task HandleOperatorActionAsync(int itemId, string operatorUser, bool isApproved)
    {
        string? createdBy = null;
        string? folderPath = null;
        bool wasApproved = false;

        await _queryExecutor.ExecuteInTransactionAsync(async tx =>
        {
            await _queryExecutor.ExecuteAsync(
                WorkflowEngineQueries.InsertApprovalLog,
                new
                {
                    ItemId = itemId,
                    ApproverRole = "OPERATOR",
                    ApprovedBy = operatorUser,
                    ActionTaken = isApproved ? "APPROVED" : "REJECTED"
                },
                tx);

            var item = await _queryExecutor.QuerySingleOrDefaultAsync<AccessItemDto>(
                WorkflowEngineQueries.GetAccessItemCreatedByAndPath,
                new { Id = itemId },
                tx);

            if (item == null)
            {
                throw new InvalidOperationException($"Access item with ID {itemId} not found.");
            }

            createdBy = item.CreatedBy;
            folderPath = item.FolderPath;

            if (!isApproved)
            {
                await _queryExecutor.ExecuteAsync(
                    WorkflowEngineQueries.UpdateAccessItemOperatorStatus,
                    new { Status = "REJECTED_BY_OPERATOR", OperatorUser = operatorUser, Id = itemId },
                    tx);
                return 0;
            }

            // Sets status to granted and explicitly offsets the 90-day expiration window
            await _queryExecutor.ExecuteAsync(
                WorkflowEngineQueries.UpdateAccessItemGranted,
                new { Id = itemId, OperatorUser = operatorUser },
                tx);

            wasApproved = true;
            return 1;
        });

        if (createdBy != null)
        {
            if (wasApproved)
            {
                await _notifier.SendAsync(createdBy, "Access Configured", $"Access to folder #{itemId} is now active. Automated expiration scheduled in 90 days.");
            }
            else
            {
                await _notifier.SendAsync(createdBy, "Request Denied", $"Operator rejected execution for path {folderPath}.");
            }
        }
    }

    public async Task<IEnumerable<TicketDto>> GetAllTicketsAsync()
    {
        var tickets = await _queryExecutor.QueryAsync<TicketDto>(WorkflowEngineQueries.GetAllTickets);
        var items = await _queryExecutor.QueryAsync<AccessItemDto>(WorkflowEngineQueries.GetAllAccessItems);
        
        // Group items by RequestId
        var itemsByRequest = items.GroupBy(i => i.RequestId).ToDictionary(g => g.Key, g => g.ToList());
        
        foreach (var ticket in tickets)
        {
            if (itemsByRequest.TryGetValue(ticket.Id, out var ticketItems))
            {
                ticket.Items = ticketItems;
            }
        }
        
        return tickets;
    }

    public async Task<IEnumerable<ApprovalLogDto>> GetApprovalLogsAsync(int itemId)
    {
        return await _queryExecutor.QueryAsync<ApprovalLogDto>(
            WorkflowEngineQueries.GetApprovalLogsByItem,
            new { ItemId = itemId }
        );
    }

    public async Task<IEnumerable<ParsedFolderPathDto>> GetParsedFolderPathsAsync()
    {
        var rawPaths = await _queryExecutor.QueryAsync<string>(WorkflowEngineQueries.GetDistinctAuditFolderPaths);
        var parsedList = new List<ParsedFolderPathDto>();

        foreach (var path in rawPaths)
        {
            if (string.IsNullOrWhiteSpace(path)) continue;

            var parts = path.Split(new[] { '\\' }, StringSplitOptions.RemoveEmptyEntries);
            var dto = new ParsedFolderPathDto
            {
                FullPath = path
            };

            if (parts.Length > 0)
            {
                if (path.StartsWith("\\\\"))
                {
                    if (parts.Length >= 2)
                    {
                        dto.DriveName = $"\\\\{parts[0]}\\{parts[1]}";
                        dto.ParentFolder = parts.Length > 2 ? parts[2] : string.Empty;
                        dto.ChildDepth1 = parts.Length > 3 ? parts[3] : string.Empty;
                        dto.ChildDepth2 = parts.Length > 4 ? parts[4] : string.Empty;
                        dto.ChildDepth3 = parts.Length > 5 ? parts[5] : string.Empty;
                        dto.ChildDepth4 = parts.Length > 6 ? parts[6] : string.Empty;
                    }
                    else
                    {
                        dto.DriveName = path;
                    }
                }
                else
                {
                    dto.DriveName = parts[0];
                    dto.ParentFolder = parts.Length > 1 ? parts[1] : string.Empty;
                    dto.ChildDepth1 = parts.Length > 2 ? parts[2] : string.Empty;
                    dto.ChildDepth2 = parts.Length > 3 ? parts[3] : string.Empty;
                    dto.ChildDepth3 = parts.Length > 4 ? parts[4] : string.Empty;
                    dto.ChildDepth4 = parts.Length > 5 ? parts[5] : string.Empty;
                }
            }
            
            parsedList.Add(dto);
        }

        return parsedList;
    }

    private bool CheckIfDepartmentsMatch(string user, string path)
    {
        return path.Equals("edp", System.StringComparison.OrdinalIgnoreCase) || false; // Toggle to true to skip owner approval step during testing
    }
}
