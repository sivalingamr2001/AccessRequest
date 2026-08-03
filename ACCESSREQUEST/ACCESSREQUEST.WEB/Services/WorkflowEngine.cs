namespace ACCESSREQUEST.WEB.Services;

using System.Data;
using AccessWorkflow.Service.Models;
using Dapper;
using MySqlConnector;

public interface IWorkflowEngine
{
    Task<string> CreateRequestAsync(RequestCreationPayload payload);
    Task HandleHodApprovalAsync(int itemId, string hodUser, bool isApproved);
    Task HandleFolderOwnerApprovalAsync(int itemId, string ownerUser, bool isApproved);
    Task HandleOperatorActionAsync(int itemId, string operatorUser, bool isApproved);
}

public class WorkflowEngine : IWorkflowEngine
{
    private readonly string _connectionString;
    private readonly INotificationService _notifier;

    public WorkflowEngine(IConfiguration configuration, INotificationService notifier)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        _notifier = notifier;
    }

    private IDbConnection CreateConnection() => new MySqlConnection(_connectionString);

    // STAGE 1: Request Submission using precise properties
    public async Task<string> CreateRequestAsync(RequestCreationPayload payload)
    {
        using var conn = CreateConnection();
        conn.Open();
        using var tx = conn.BeginTransaction();

        try
        {
            // Initial placeholder step to fetch sequential ID securely
            string insertRequestSql = @"
                INSERT INTO workspace.jan_access_request (req_to, ticket_number, created_by, created_on, is_active)
                VALUES (@ReqTo, 'PENDING_GENERATION', @CreatedBy, NOW(), 1);
                SELECT LAST_INSERT_ID();";

            int generatedId = await conn.ExecuteScalarAsync<int>(insertRequestSql, new
            {
                ReqTo = payload.ReqTo,
                CreatedBy = payload.CreatedBy
            }, tx);

            // Compute sequential padding code (e.g. REQ-00000104)
            string sequentialTicketNumber = $"REQ-{generatedId:D8}";

            await conn.ExecuteAsync(@"
                UPDATE workspace.jan_access_request 
                SET ticket_number = @TicketNumber 
                WHERE id = @Id;",
                new { TicketNumber = sequentialTicketNumber, Id = generatedId }, tx);

            // Save individual items containing specific justification criteria
            string insertItemSql = @"
                INSERT INTO workspace.jan_access_items 
                (request_id, access_type, folder_path, reason_for_access, status, created_by, created_on, is_active)
                VALUES 
                (@RequestId, @AccessType, @FolderPath, @ReasonForAccess, 'PENDING_DEPT_HOD', @CreatedBy, NOW(), 1);";

            foreach (var item in payload.Items)
            {
                await conn.ExecuteAsync(insertItemSql, new
                {
                    RequestId = generatedId,
                    AccessType = item.AccessType,
                    FolderPath = item.FolderPath,
                    ReasonForAccess = item.ReasonForAccess,
                    CreatedBy = payload.CreatedBy
                }, tx);
            }

            tx.Commit();

            // Run backend alerts
            await _notifier.SendAsync(payload.CreatedBy, "Ticket Created", $"Your request is active: {sequentialTicketNumber}");
            await _notifier.SendAsync("hod_dept@company.com", "HOD Review Required", $"New ticket {sequentialTicketNumber} needs evaluation.");

            return sequentialTicketNumber;
        }
        catch
        {
            tx.Rollback();
            throw;
        }
    }

    // STAGE 2: Department HOD Review with detailed property maps
    public async Task HandleHodApprovalAsync(int itemId, string hodUser, bool isApproved)
    {
        using var conn = CreateConnection();
        conn.Open();
        using var tx = conn.BeginTransaction();

        try
        {
            await conn.ExecuteAsync(@"
                INSERT INTO workspace.jan_approval_log (item_id, approver_role, approved_by, action_taken, action_date)
                VALUES (@ItemId, 'DEPT_HOD', @HodUser, @Action, NOW());",
                new { ItemId = itemId, HodUser = hodUser, Action = isApproved ? "APPROVED" : "REJECTED" }, tx);

            if (!isApproved)
            {
                await conn.ExecuteAsync("UPDATE workspace.jan_access_items SET status = 'REJECTED_BY_DEPT_HOD', modified_on = NOW() WHERE id = @Id;", new { Id = itemId }, tx);
                tx.Commit();
                return;
            }

            // Pull matching item parameters
            var item = await conn.QuerySingleAsync<AccessItemDto>(@"
                SELECT id, request_id, folder_path, access_type, reason_for_access, created_by 
                FROM workspace.jan_access_items WHERE id = @Id;", new { Id = itemId }, tx);

            bool departmentsMatch = CheckIfDepartmentsMatch(item.CreatedBy, item.FolderPath);

            if (departmentsMatch)
            {
                await conn.ExecuteAsync("UPDATE workspace.jan_access_items SET status = 'PENDING_OPERATOR', modified_on = NOW() WHERE id = @Id;", new { Id = itemId }, tx);
                tx.Commit();
                await _notifier.SendAsync("operators@company.com", "Fulfillment Pipeline Entry", $"Item #{itemId} passed HOD.");
            }
            else
            {
                await conn.ExecuteAsync("UPDATE workspace.jan_access_items SET status = 'PENDING_FOLDER_OWNER', modified_on = NOW() WHERE id = @Id;", new { Id = itemId }, tx);
                tx.Commit();
                await _notifier.SendAsync("folder_owner@company.com", "Cross-Dept Action Needed", $"User request for path {item.FolderPath} needs verification.");
            }
        }
        catch
        {
            tx.Rollback();
            throw;
        }
    }

    // STAGE 3: Folder Owner Verification
    public async Task HandleFolderOwnerApprovalAsync(int itemId, string ownerUser, bool isApproved)
    {
        using var conn = CreateConnection();
        conn.Open();
        using var tx = conn.BeginTransaction();

        try
        {
            await conn.ExecuteAsync(@"
                INSERT INTO workspace.jan_approval_log (item_id, approver_role, approved_by, action_taken, action_date)
                VALUES (@ItemId, 'FOLDER_OWNER', @OwnerUser, @Action, NOW());",
                new { ItemId = itemId, OwnerUser = ownerUser, Action = isApproved ? "APPROVED" : "REJECTED" }, tx);

            if (!isApproved)
            {
                await conn.ExecuteAsync("UPDATE workspace.jan_access_items SET status = 'REJECTED_BY_FOLDER_OWNER', modified_on = NOW() WHERE id = @Id;", new { Id = itemId }, tx);
                tx.Commit();
                return;
            }

            await conn.ExecuteAsync("UPDATE workspace.jan_access_items SET status = 'PENDING_OPERATOR', modified_on = NOW() WHERE id = @Id;", new { Id = itemId }, tx);
            tx.Commit();

            await _notifier.SendAsync("operators@company.com", "Ready to Grant", $"Item #{itemId} approved by folder owner.");
        }
        catch
        {
            tx.Rollback();
            throw;
        }
    }

    // STAGE 4: Operator Execution Block
    public async Task HandleOperatorActionAsync(int itemId, string operatorUser, bool isApproved)
    {
        using var conn = CreateConnection();
        conn.Open();
        using var tx = conn.BeginTransaction();

        try
        {
            await conn.ExecuteAsync(@"
                INSERT INTO workspace.jan_approval_log (item_id, approver_role, approved_by, action_taken, action_date)
                VALUES (@ItemId, 'OPERATOR', @OperatorUser, @Action, NOW());",
                new { ItemId = itemId, OperatorUser = operatorUser, Action = isApproved ? "APPROVED" : "REJECTED" }, tx);

            var item = await conn.QuerySingleAsync<AccessItemDto>(
                "SELECT created_by, folder_path FROM workspace.jan_access_items WHERE id = @Id;", new { Id = itemId }, tx);

            if (!isApproved)
            {
                await conn.ExecuteAsync("UPDATE workspace.jan_access_items SET status = 'REJECTED_BY_OPERATOR', modified_by = @OperatorUser, modified_on = NOW() WHERE id = @Id;", new { Id = itemId, OperatorUser = operatorUser }, tx);
                tx.Commit();
                await _notifier.SendAsync(item.CreatedBy, "Request Denied", $"Operator rejected execution for path {item.FolderPath}.");
                return;
            }

            // Sets status to granted and explicitly offsets the 90-day expiration window
            await conn.ExecuteAsync(@"
                UPDATE workspace.jan_access_items 
                SET status = 'ACCESS_GRANTED', 
                    granted_at = NOW(), 
                    expires_at = DATE_ADD(NOW(), INTERVAL 90 DAY), 
                    modified_by = @OperatorUser,
                    modified_on = NOW() 
                WHERE id = @Id;", new { Id = itemId, OperatorUser = operatorUser }, tx);

            tx.Commit();

            await _notifier.SendAsync(item.CreatedBy, "Access Configured", $"Access to folder #{itemId} is now active. Automated expiration scheduled in 90 days.");
        }
        catch
        {
            tx.Rollback();
            throw;
        }
    }

    private bool CheckIfDepartmentsMatch(string user, string path)
    {
        return false; // Toggle to true to skip owner approval step during testing
    }
}
