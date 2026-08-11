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

        // Check if requester is an HOD
        bool isHodRequester = false;
        if (string.IsNullOrWhiteSpace(payload.ReqTo) ||
            payload.ReqTo.Equals("Operator", StringComparison.OrdinalIgnoreCase) ||
            payload.ReqTo.Equals(payload.CreatedBy, StringComparison.OrdinalIgnoreCase))
        {
            isHodRequester = true;
        }
        else
        {
            try
            {
                int hodCount = await _queryExecutor.ExecuteScalarAsync<int>(
                    WorkflowEngineQueries.CheckIsHodUser,
                    new { UserName = payload.CreatedBy });
                if (hodCount > 0)
                {
                    isHodRequester = true;
                }
            }
            catch
            {
                // If table join isn't available, rely on payload
            }
        }

        string initialStatus = isHodRequester ? "PENDING_OPERATOR" : "PENDING_DEPT_HOD";
        string reqToValue = isHodRequester ? "Operator" : (payload.ReqTo ?? string.Empty);

        bool hasPendingFolderOwnerItems = false;
        var folderOwnerEmails = new List<string>();
        var itemMailDetails = new List<(string FolderPath, string AccessType, string ReasonForAccess, string Status)>();

        await _queryExecutor.ExecuteInTransactionAsync(async tx =>
        {
            // Initial placeholder step to fetch sequential ID securely
            int generatedId = await _queryExecutor.ExecuteScalarAsync<int>(
                WorkflowEngineQueries.InsertRequest,
                new
                {
                    ReqTo = reqToValue,
                    CreatedBy = payload.CreatedBy
                },
                tx);

            // Compute sequential padding code (e.g. REQ-00000104)
            sequentialTicketNumber = $"REQ-{generatedId:D8}";

            await _queryExecutor.ExecuteAsync(
                WorkflowEngineQueries.UpdateRequestTicket,
                new { TicketNumber = sequentialTicketNumber, Id = generatedId },
                tx);

            int? requesterDept = null;
            try
            {
                requesterDept = await _queryExecutor.ExecuteScalarAsync<int?>(
                    WorkflowEngineQueries.GetUserDeptId,
                    new { UserName = payload.CreatedBy },
                    tx);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Requester Dept Lookup Error]: {ex.Message}");
            }

            var allMappings = await _queryExecutor.QueryAsync<FolderMappingDto>(
                WorkflowEngineQueries.GetAllFolderMappings,
                tx);

            // Save individual items containing specific justification criteria
            foreach (var item in payload.Items)
            {
                string itemStatus = initialStatus;
                bool isCrossDeptOwner = false;
                string? matchedOwner = null;

                if (isHodRequester)
                {
                    var normalizedItemPath = NormalizePath(item.FolderPath);
                    var mapping = allMappings.FirstOrDefault(m => 
                    {
                        var mapPath = NormalizePath(m.FolderPath);
                        return mapPath.Equals(normalizedItemPath, StringComparison.OrdinalIgnoreCase)
                            || (!string.IsNullOrWhiteSpace(mapPath) && (
                                normalizedItemPath.StartsWith(mapPath + "\\", StringComparison.OrdinalIgnoreCase)
                                || mapPath.Equals(normalizedItemPath, StringComparison.OrdinalIgnoreCase)
                            ));
                    });

                    if (mapping != null)
                    {
                        string? primaryOwner = mapping.PrimaryFolderOwner?.Trim();
                        string? secondaryOwner = mapping.SecondaryFolderOwner?.Trim();

                        bool isOwnFolder = (!string.IsNullOrWhiteSpace(primaryOwner) && primaryOwner.Equals(payload.CreatedBy, StringComparison.OrdinalIgnoreCase))
                                        || (!string.IsNullOrWhiteSpace(secondaryOwner) && secondaryOwner.Equals(payload.CreatedBy, StringComparison.OrdinalIgnoreCase));

                        if (!isOwnFolder && !string.IsNullOrWhiteSpace(primaryOwner))
                        {
                            int? ownerDept = null;
                            try
                            {
                                ownerDept = await _queryExecutor.ExecuteScalarAsync<int?>(
                                    WorkflowEngineQueries.GetUserDeptId,
                                    new { UserName = primaryOwner },
                                    tx);
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine($"[Owner Dept Lookup Error]: {ex.Message}");
                            }

                            if (ownerDept.HasValue && requesterDept.HasValue && ownerDept.Value != requesterDept.Value)
                            {
                                isCrossDeptOwner = true;
                                matchedOwner = primaryOwner;
                            }
                        }
                    }
                }

                if (isCrossDeptOwner)
                {
                    itemStatus = "PENDING_FOLDER_OWNER";
                    hasPendingFolderOwnerItems = true;
                    
                    if (!string.IsNullOrWhiteSpace(matchedOwner))
                    {
                        try
                        {
                            string? ownerEmail = await _queryExecutor.ExecuteScalarAsync<string>(
                                "SELECT MAIL_ID FROM itsr.jan_complaint_login WHERE LOWER(CMPL_USER_NAME) = LOWER(@UserName) LIMIT 1;",
                                new { UserName = matchedOwner },
                                tx);
                            if (!string.IsNullOrWhiteSpace(ownerEmail) && !folderOwnerEmails.Contains(ownerEmail))
                            {
                                folderOwnerEmails.Add(ownerEmail);
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"[Owner Email Lookup Error]: {ex.Message}");
                        }
                    }
                }

                itemMailDetails.Add((item.FolderPath, item.AccessType, item.ReasonForAccess, itemStatus));

                int itemId = await _queryExecutor.ExecuteScalarAsync<int>(
                    WorkflowEngineQueries.InsertAccessItemWithStatus,
                    new
                    {
                        RequestId = generatedId,
                        AccessType = item.AccessType,
                        FolderPath = item.FolderPath,
                        ReasonForAccess = item.ReasonForAccess,
                        Status = itemStatus,
                        CreatedBy = payload.CreatedBy
                    },
                    tx);

                if (isHodRequester)
                {
                    string comments = isCrossDeptOwner 
                        ? $"Auto-approved: Requester is Department HOD (Pending Cross-Dept Folder Owner {matchedOwner} Approval)"
                        : "Auto-approved: Requester is Department HOD (Direct to Operator)";

                    await _queryExecutor.ExecuteAsync(
                        WorkflowEngineQueries.InsertApprovalLog,
                        new
                        {
                            ItemId = itemId,
                            ApproverRole = "DEPT_HOD",
                            ApprovedBy = payload.CreatedBy,
                            ActionTaken = "APPROVED",
                            Comments = comments
                        },
                        tx);
                }
            }

            return 1;
        });

        // Run backend alerts after transaction commits
        if (isHodRequester)
        {
            if (hasPendingFolderOwnerItems)
            {
                await _notifier.SendAsync(payload.CreatedBy, "Ticket Created", $"Your request is active: {sequentialTicketNumber} (Pending Folder Owner Approval)");
                await _notifier.SendAsync("folder_owner@company.com", "Cross-Dept HOD Approval Needed", $"New ticket {sequentialTicketNumber} from HOD {payload.CreatedBy} needs folder owner approval.");
            }
            else
            {
                await _notifier.SendAsync(payload.CreatedBy, "Ticket Created", $"Your request is active: {sequentialTicketNumber} (Direct to Operator)");
                await _notifier.SendAsync("operators@company.com", "HOD Access Request", $"New ticket {sequentialTicketNumber} from HOD {payload.CreatedBy} is ready for execution.");
            }
        }
        else
        {
            await _notifier.SendAsync(payload.CreatedBy, "Ticket Created", $"Your request is active: {sequentialTicketNumber}");
            await _notifier.SendAsync("hod_dept@company.com", "HOD Review Required", $"New ticket {sequentialTicketNumber} needs evaluation.");
        }

        try
        {
            string mailSubject;
            string mailProgram;
            string mailTo;
            string stageName;

            if (isHodRequester)
            {
                if (hasPendingFolderOwnerItems)
                {
                    stageName = "PENDING_FOLDER_OWNER";
                    mailSubject = $"Access request {sequentialTicketNumber} pending folder owner approval";
                    mailProgram = "ACCESS_REQUEST_PENDING_FOLDER_OWNER";
                    mailTo = folderOwnerEmails.Any() ? string.Join(";", folderOwnerEmails) : "folder_owner@company.com";
                }
                else
                {
                    stageName = "PENDING_OPERATOR";
                    mailSubject = $"Access request {sequentialTicketNumber} pending operator fulfillment";
                    mailProgram = "ACCESS_REQUEST_PENDING_OPERATOR";
                    mailTo = "operators@company.com";
                }
            }
            else
            {
                stageName = "PENDING_DEPT_HOD";
                mailSubject = $"Access request {sequentialTicketNumber} pending HOD approval";
                mailProgram = "ACCESS_REQUEST_CREATED";
                mailTo = payload.ReqTo ?? "hod_dept@company.com";
            }

            var mailBody = $@"
<div style=""font-family: Arial, sans-serif; color: #1f2937;"">
  <h2 style=""color:#2563eb;"">{(stageName == "PENDING_FOLDER_OWNER" ? "New Access Request Pending Folder Owner Approval" : (stageName == "PENDING_OPERATOR" ? "New Access Request Pending Operator Fulfillment" : "New Access Request Pending HOD Approval"))}</h2>
  <table cellpadding=""8"" cellspacing=""0"" border=""1"" style=""border-collapse:collapse;width:100%;margin-bottom:16px;"">
    <tr><td><b>Ticket No</b></td><td>{sequentialTicketNumber}</td></tr>
    <tr><td><b>Requester</b></td><td>{payload.CreatedBy}</td></tr>
    <tr><td><b>Approver / Actor</b></td><td>{(stageName == "PENDING_FOLDER_OWNER" ? string.Join(", ", folderOwnerEmails) : (stageName == "PENDING_OPERATOR" ? "Operator" : mailTo))}</td></tr>
    <tr><td><b>Stage</b></td><td>{stageName}</td></tr>
    <tr><td><b>Action</b></td><td>CREATED</td></tr>
    <tr><td><b>Date</b></td><td>{DateTime.Now.ToString("g")}</td></tr>
  </table>
  <h3>Access Request Details</h3>
  <table cellpadding=""8"" cellspacing=""0"" border=""1"" style=""border-collapse:collapse;width:100%;"">
    <thead style=""background:#f1f5f9;"">
      <tr><th>#</th><th>Folder Path</th><th>Access Type</th><th>Reason</th><th>Status</th></tr>
    </thead>
    <tbody>
      {string.Join("", itemMailDetails.Select((itm, idx) => $"<tr><td>{idx + 1}</td><td>{itm.FolderPath}</td><td>{itm.AccessType}</td><td>{itm.ReasonForAccess}</td><td>{itm.Status}</td></tr>"))}
    </tbody>
  </table>
</div>";

            await _queryExecutor.ExecuteAsync(WorkflowEngineQueries.InsertMailLog, new
            {
                MailProgram = mailProgram,
                MailFrom = "feedback@janatics.co.in",
                MailTo = mailTo,
                MailSubject = mailSubject,
                MailSent = 0,
                MailBody = mailBody,
                MailCc = string.Empty
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Mail Log Insert Warning]: {ex.Message}");
        }

        return sequentialTicketNumber;
    }

    // STAGE 2: Department HOD Review with detailed property maps
    public async Task HandleHodApprovalAsync(int itemId, string hodUser, bool isApproved, string? comments = null, string? confirmAccessType = null)
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
                    ActionTaken = isApproved ? "APPROVED" : "REJECTED",
                    Comments = comments
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
            
            // Check if User's HOD and Folder Owner's HOD are the same person / same department
            bool shouldSkipFolderOwner = false;
            try
            {
                int? requesterDept = await _queryExecutor.ExecuteScalarAsync<int?>(
                    WorkflowEngineQueries.GetUserDeptId,
                    new { UserName = item.CreatedBy },
                    tx);

                int? approvingHodDept = await _queryExecutor.ExecuteScalarAsync<int?>(
                    WorkflowEngineQueries.GetUserDeptId,
                    new { UserName = hodUser },
                    tx);

                var allMappings = await _queryExecutor.QueryAsync<FolderMappingDto>(
                    WorkflowEngineQueries.GetAllFolderMappings,
                    tx);

                var normalizedItemPath = NormalizePath(item.FolderPath);
                var mapping = allMappings.FirstOrDefault(m => 
                {
                    var mapPath = NormalizePath(m.FolderPath);
                    return mapPath.Equals(normalizedItemPath, StringComparison.OrdinalIgnoreCase)
                        || (!string.IsNullOrWhiteSpace(mapPath) && (
                            normalizedItemPath.StartsWith(mapPath + "\\", StringComparison.OrdinalIgnoreCase)
                            || mapPath.Equals(normalizedItemPath, StringComparison.OrdinalIgnoreCase)
                        ));
                });

                if (mapping != null)
                {
                    string? primaryOwner = mapping.PrimaryFolderOwner?.Trim();
                    string? secondaryOwner = mapping.SecondaryFolderOwner?.Trim();

                    // 1. If approving HOD is directly the folder owner
                    bool isHodOwner = (!string.IsNullOrWhiteSpace(primaryOwner) && primaryOwner.Equals(hodUser, StringComparison.OrdinalIgnoreCase))
                                   || (!string.IsNullOrWhiteSpace(secondaryOwner) && secondaryOwner.Equals(hodUser, StringComparison.OrdinalIgnoreCase));

                    if (isHodOwner)
                    {
                        shouldSkipFolderOwner = true;
                    }
                    else if (!string.IsNullOrWhiteSpace(primaryOwner))
                    {
                        int? ownerDept = await _queryExecutor.ExecuteScalarAsync<int?>(
                            WorkflowEngineQueries.GetUserDeptId,
                            new { UserName = primaryOwner },
                            tx);

                        // 2. If folder owner is in same department as requester or approving HOD -> Same HOD!
                        if (ownerDept.HasValue && ((requesterDept.HasValue && ownerDept.Value == requesterDept.Value) || (approvingHodDept.HasValue && ownerDept.Value == approvingHodDept.Value)))
                        {
                            shouldSkipFolderOwner = true;
                        }
                        else if (ownerDept.HasValue)
                        {
                            // 3. Check if the HOD of the owner's department matches approving HOD
                            var ownerHods = await _queryExecutor.QueryAsync<string>(
                                WorkflowEngineQueries.GetHodUsersByDeptId,
                                new { DeptId = ownerDept.Value },
                                tx);

                            if (ownerHods.Any(h => h.Equals(hodUser, StringComparison.OrdinalIgnoreCase)))
                            {
                                shouldSkipFolderOwner = true;
                            }
                        }
                    }
                    else
                    {
                        shouldSkipFolderOwner = true;
                    }
                }
                else
                {
                    shouldSkipFolderOwner = CheckIfDepartmentsMatch(item.CreatedBy, item.FolderPath, hodUser);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Folder Owner Check Warning]: {ex.Message}");
                shouldSkipFolderOwner = CheckIfDepartmentsMatch(item.CreatedBy, item.FolderPath, hodUser);
            }

            string nextStatus = shouldSkipFolderOwner ? "PENDING_OPERATOR" : "PENDING_FOLDER_OWNER";

            await _queryExecutor.ExecuteAsync(
                WorkflowEngineQueries.UpdateAccessItemStatusAndConfirmType,
                new 
                { 
                    Status = nextStatus, 
                    ConfirmAccessType = string.IsNullOrWhiteSpace(confirmAccessType) ? item.AccessType : confirmAccessType,
                    Id = itemId 
                },
                tx);

            if (shouldSkipFolderOwner)
            {
                await _queryExecutor.ExecuteAsync(
                    WorkflowEngineQueries.InsertApprovalLog,
                    new
                    {
                        ItemId = itemId,
                        ApproverRole = "FOLDER_OWNER",
                        ApprovedBy = hodUser,
                        ActionTaken = "APPROVED",
                        Comments = string.IsNullOrWhiteSpace(comments)
                            ? "Auto-approved: Department HOD and Folder Owner HOD are the same"
                            : $"{comments} (Auto-approved: Same HOD / Department)"
                    },
                    tx);

                isPendingOperator = true;
            }
            else
            {
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
    public async Task HandleFolderOwnerApprovalAsync(int itemId, string ownerUser, bool isApproved, string? comments = null, string? confirmAccessType = null)
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
                    ActionTaken = isApproved ? "APPROVED" : "REJECTED",
                    Comments = comments
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

            var item = await _queryExecutor.QuerySingleOrDefaultAsync<AccessItemDto>(
                WorkflowEngineQueries.GetAccessItem,
                new { Id = itemId },
                tx);

            await _queryExecutor.ExecuteAsync(
                WorkflowEngineQueries.UpdateAccessItemStatusAndConfirmType,
                new 
                { 
                    Status = "PENDING_OPERATOR", 
                    ConfirmAccessType = string.IsNullOrWhiteSpace(confirmAccessType) ? (item?.ConfirmAccessType ?? item?.AccessType) : confirmAccessType,
                    Id = itemId 
                },
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
    public async Task HandleOperatorActionAsync(int itemId, string operatorUser, bool isApproved, string? comments = null)
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
                    ActionTaken = isApproved ? "APPROVED" : "REJECTED",
                    Comments = comments
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

    public async Task<bool> HandleRevokeAccessAsync(int itemId, string operatorUser, string comments)
    {
        string? createdBy = null;
        string? folderPath = null;

        await _queryExecutor.ExecuteInTransactionAsync(async tx =>
        {
            await _queryExecutor.ExecuteAsync(
                WorkflowEngineQueries.InsertApprovalLog,
                new
                {
                    ItemId = itemId,
                    ApproverRole = "OPERATOR",
                    ApprovedBy = operatorUser,
                    ActionTaken = "REVOKED",
                    Comments = comments
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

            await _queryExecutor.ExecuteAsync(
                WorkflowEngineQueries.UpdateAccessItemRevoked,
                new { Id = itemId, OperatorUser = operatorUser },
                tx);

            return 1;
        });

        if (createdBy != null)
        {
            await _notifier.SendAsync(createdBy, "Access Revoked", $"Access to folder {folderPath} (item #{itemId}) was revoked by operator {operatorUser}. Reason: {comments}");
        }

        return true;
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

    public async Task<IEnumerable<AuditLogDetailDto>> GetAllAuditLogsAsync()
    {
        return await _queryExecutor.QueryAsync<AuditLogDetailDto>(WorkflowEngineQueries.GetAllAuditLogs);
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

    public async Task<bool> ResubmitItemAsync(int itemId, string folderPath, string accessType, string reasonForAccess, string username)
    {
        await _queryExecutor.ExecuteAsync(WorkflowEngineQueries.UpdateAccessItemForResubmit, new
        {
            Id = itemId,
            FolderPath = folderPath,
            AccessType = accessType,
            ReasonForAccess = reasonForAccess,
            ModifiedBy = username
        });

        await _queryExecutor.ExecuteAsync(WorkflowEngineQueries.InsertApprovalLog, new
        {
            ItemId = itemId,
            ApproverRole = "Requester",
            ApprovedBy = username,
            ActionTaken = "RESUBMITTED"
        });

        return true;
    }

    public async Task<bool> InsertMailLogAsync(MailLogDto mailDto)
    {
        await _queryExecutor.ExecuteAsync(WorkflowEngineQueries.InsertMailLog, new
        {
            MailProgram = mailDto.MailProgram,
            MailFrom = mailDto.MailFrom,
            MailTo = mailDto.MailTo,
            MailSubject = mailDto.MailSubject,
            MailSent = mailDto.MailSent ? 1 : 0,
            MailBody = mailDto.MailBody,
            MailCc = mailDto.MailCc
        });

        return true;
    }

    public async Task<IEnumerable<FolderMappingDto>> GetAllFolderMappingsAsync()
    {
        return await _queryExecutor.QueryAsync<FolderMappingDto>(WorkflowEngineQueries.GetAllFolderMappings);
    }

    public async Task<int> AddFolderMappingAsync(FolderMappingDto mapping)
    {
        return await _queryExecutor.ExecuteScalarAsync<int>(
            WorkflowEngineQueries.InsertFolderMapping,
            new
            {
                FolderPath = mapping.FolderPath,
                PrimaryFolderOwner = mapping.PrimaryFolderOwner,
                SecondaryFolderOwner = mapping.SecondaryFolderOwner,
                CreatedBy = string.IsNullOrWhiteSpace(mapping.CreatedBy) ? "SYSTEM" : mapping.CreatedBy
            });
    }

    public async Task<bool> UpdateFolderMappingAsync(FolderMappingDto mapping)
    {
        await _queryExecutor.ExecuteAsync(
            WorkflowEngineQueries.UpdateFolderMapping,
            new
            {
                Id = mapping.Id,
                FolderPath = mapping.FolderPath,
                PrimaryFolderOwner = mapping.PrimaryFolderOwner,
                SecondaryFolderOwner = mapping.SecondaryFolderOwner,
                ModifiedBy = string.IsNullOrWhiteSpace(mapping.ModifiedBy) ? "SYSTEM" : mapping.ModifiedBy
            });
        return true;
    }

    public async Task<bool> DeleteFolderMappingAsync(int id)
    {
        await _queryExecutor.ExecuteAsync(WorkflowEngineQueries.DeleteFolderMapping, new { Id = id });
        return true;
    }

    private static string NormalizePath(string? path)
    {
        if (string.IsNullOrWhiteSpace(path)) return string.Empty;
        return path.Replace('/', '\\').Trim().TrimEnd('\\');
    }

    private bool CheckIfDepartmentsMatch(string user, string path, string? approver = null)
    {
        if (string.IsNullOrWhiteSpace(path)) return true;
        if (!string.IsNullOrWhiteSpace(approver) && path.IndexOf(approver, StringComparison.OrdinalIgnoreCase) >= 0)
            return true;
        return path.IndexOf("edp", StringComparison.OrdinalIgnoreCase) >= 0;
    }
}
