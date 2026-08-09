namespace ACCESSREQUEST.WEB.Services;

public static class WorkflowEngineQueries
{
    public const string InsertRequest = @"
        INSERT INTO workspace.jan_access_request (req_to, ticket_number, created_by, created_on, is_active)
        VALUES (@ReqTo, 'PENDING_GENERATION', @CreatedBy, NOW(), 1);
        SELECT LAST_INSERT_ID();";

    public const string UpdateRequestTicket = @"
        UPDATE workspace.jan_access_request 
        SET ticket_number = @TicketNumber 
        WHERE id = @Id;";

    public const string InsertAccessItem = @"
        INSERT INTO workspace.jan_access_items 
        (request_id, access_type, folder_path, reason_for_access, status, created_by, created_on, is_active)
        VALUES 
        (@RequestId, @AccessType, @FolderPath, @ReasonForAccess, 'PENDING_DEPT_HOD', @CreatedBy, NOW(), 1);";

    public const string InsertApprovalLog = @"
        INSERT INTO workspace.jan_approval_log (item_id, approver_role, approved_by, action_taken, action_date, comments)
        VALUES (@ItemId, @ApproverRole, @ApprovedBy, @ActionTaken, NOW(), @Comments);";

    public const string InsertMailLog = @"
        INSERT INTO workspace.jan_mail_system 
        (mail_date, mail_program, mail_from, mail_to, mail_subject, mail_sent, mail_body, mail_cc)
        VALUES 
        (NOW(), @MailProgram, @MailFrom, @MailTo, @MailSubject, @MailSent, @MailBody, @MailCc);";

    public const string UpdateAccessItemStatus = @"
        UPDATE workspace.jan_access_items 
        SET status = @Status, modified_on = NOW() 
        WHERE id = @Id;";

    public const string UpdateAccessItemStatusAndConfirmType = @"
        UPDATE workspace.jan_access_items 
        SET status = @Status, 
            confirm_access_type = COALESCE(@ConfirmAccessType, confirm_access_type), 
            modified_on = NOW() 
        WHERE id = @Id;";

    public const string UpdateAccessItemForResubmit = @"
        UPDATE workspace.jan_access_items 
        SET folder_path = @FolderPath, 
            access_type = @AccessType, 
            reason_for_access = @ReasonForAccess, 
            status = 'PENDING_DEPT_HOD', 
            modified_by = @ModifiedBy, 
            modified_on = NOW() 
        WHERE id = @Id;";

    public const string GetAccessItem = @"
        SELECT id, request_id AS RequestId, folder_path AS FolderPath, access_type AS AccessType, reason_for_access AS ReasonForAccess, confirm_access_type AS ConfirmAccessType, created_by AS CreatedBy, status AS Status, granted_at AS GrantedAt, expires_at AS ExpiresAt, modified_by AS ModifiedBy, modified_on AS ModifiedOn, is_active AS IsActive
        FROM workspace.jan_access_items WHERE id = @Id;";

    public const string GetAccessItemCreatedByAndPath = @"
        SELECT created_by AS CreatedBy, folder_path AS FolderPath, confirm_access_type AS ConfirmAccessType, access_type AS AccessType FROM workspace.jan_access_items WHERE id = @Id;";

    public const string UpdateAccessItemOperatorStatus = @"
        UPDATE workspace.jan_access_items 
        SET status = @Status, modified_by = @OperatorUser, modified_on = NOW() 
        WHERE id = @Id;";

    public const string UpdateAccessItemGranted = @"
        UPDATE workspace.jan_access_items 
        SET status = 'ACCESS_GRANTED', 
            granted_at = NOW(), 
            expires_at = DATE_ADD(NOW(), INTERVAL 90 DAY), 
            modified_by = @OperatorUser,
            modified_on = NOW() 
        WHERE id = @Id;";

    public const string UpdateAccessItemRevoked = @"
        UPDATE workspace.jan_access_items 
        SET status = 'ACCESS_REVOKED', 
            modified_by = @OperatorUser, 
            modified_on = NOW() 
        WHERE id = @Id;";

    public const string GetAllTickets = @"
        SELECT id, req_to AS ReqTo, ticket_number AS TicketNumber, created_by AS CreatedBy, created_on AS CreatedOn, is_active AS IsActive 
        FROM workspace.jan_access_request;";

    public const string GetAllAccessItems = @"
        SELECT id, request_id AS RequestId, folder_path AS FolderPath, access_type AS AccessType, reason_for_access AS ReasonForAccess, confirm_access_type AS ConfirmAccessType, created_by AS CreatedBy, status AS Status, granted_at AS GrantedAt, expires_at AS ExpiresAt, modified_by AS ModifiedBy, modified_on AS ModifiedOn, is_active AS IsActive 
        FROM workspace.jan_access_items;";

    public const string GetApprovalLogsByItem = @"
        SELECT id, item_id AS ItemId, approver_role AS ApproverRole, approved_by AS ApprovedBy, action_taken AS ActionTaken, action_date AS ActionDate, comments AS Comments 
        FROM workspace.jan_approval_log 
        WHERE item_id = @ItemId;";

    public const string GetDistinctAuditFolderPaths = @"
        SELECT DISTINCT FolderPath 
        FROM workspace.jan_ntfs_permissions_audit 
        WHERE FolderPath IS NOT NULL AND FolderPath != '';";
}
