namespace ACCESSREQUEST.WEB.Services;

public static class WorkflowEngineQueries
{
    public const string InsertRequest = @"
        INSERT INTO jan_access_request (req_to, ticket_number, created_by, created_on, is_active)
        VALUES (@ReqTo, 'PENDING_GENERATION', @CreatedBy, NOW(), 1);
        SELECT LAST_INSERT_ID();";

    public const string UpdateRequestTicket = @"
        UPDATE jan_access_request 
        SET ticket_number = @TicketNumber 
        WHERE id = @Id;";

    public const string InsertAccessItem = @"
        INSERT INTO jan_access_items 
        (request_id, access_type, folder_path, reason_for_access, status, created_by, created_on, is_active)
        VALUES 
        (@RequestId, @AccessType, @FolderPath, @ReasonForAccess, 'PENDING_DEPT_HOD', @CreatedBy, NOW(), 1);";

    public const string InsertAccessItemWithStatus = @"
        INSERT INTO jan_access_items 
        (request_id, access_type, folder_path, reason_for_access, status, created_by, created_on, is_active)
        VALUES 
        (@RequestId, @AccessType, @FolderPath, @ReasonForAccess, @Status, @CreatedBy, NOW(), 1);
        SELECT LAST_INSERT_ID();";

    public const string InsertApprovalLog = @"
        INSERT INTO jan_approval_log (item_id, approver_role, approved_by, action_taken, action_date, comments)
        VALUES (@ItemId, @ApproverRole, @ApprovedBy, @ActionTaken, NOW(), @Comments);";

    public const string InsertMailLog = @"
        INSERT INTO jan_mail_system 
        (mail_date, mail_program, mail_from, mail_to, mail_subject, mail_sent, mail_body, mail_cc)
        VALUES 
        (NOW(), @MailProgram, @MailFrom, @MailTo, @MailSubject, @MailSent, @MailBody, @MailCc);";

    public const string GetFolderMappingByPath = @"
        SELECT primary_folder_owner AS PrimaryFolderOwner, secondary_folder_owner AS SecondaryFolderOwner 
        FROM jan_folder_mapping 
        WHERE LOWER(folder_path) = LOWER(@FolderPath) AND is_active = 1 
        LIMIT 1;";

    public const string GetAllFolderMappings = @"
        SELECT id AS Id, folder_path AS FolderPath, primary_folder_owner AS PrimaryFolderOwner, secondary_folder_owner AS SecondaryFolderOwner, is_active AS IsActive, created_by AS CreatedBy, created_on AS CreatedOn, modified_by AS ModifiedBy, modified_on AS ModifiedOn 
        FROM jan_folder_mapping 
        WHERE is_active = 1;";

    public const string InsertFolderMapping = @"
        INSERT INTO jan_folder_mapping (folder_path, primary_folder_owner, secondary_folder_owner, is_active, created_by, created_on)
        VALUES (@FolderPath, @PrimaryFolderOwner, @SecondaryFolderOwner, 1, @CreatedBy, NOW());
        SELECT LAST_INSERT_ID();";

    public const string UpdateFolderMapping = @"
        UPDATE jan_folder_mapping 
        SET folder_path = @FolderPath, primary_folder_owner = @PrimaryFolderOwner, secondary_folder_owner = @SecondaryFolderOwner, modified_by = @ModifiedBy, modified_on = NOW() 
        WHERE id = @Id;";

    public const string DeleteFolderMapping = @"
        UPDATE jan_folder_mapping 
        SET is_active = 0, modified_on = NOW() 
        WHERE id = @Id;";

    public const string GetUserDeptId = @"
        SELECT DEPT_ID AS DeptId 
        FROM itsr.jan_complaint_login 
        WHERE LOWER(CMPL_USER_NAME) = LOWER(@UserName) 
        LIMIT 1;";

    public const string GetHodUsersByDeptId = @"
        SELECT cl.CMPL_USER_NAME AS UserName
        FROM itsr.jan_complaint_login cl
        JOIN workspace.jan_portal_user pu ON pu.Id = cl.CMPL_USER_ID
        WHERE cl.DEPT_ID = @DeptId
          AND LOWER(pu.Role) = 'hod'
          AND pu.IsActive = 1;";

    public const string CheckIsHodUser = @"
        SELECT COUNT(*) 
        FROM workspace.jan_portal_user pu
        JOIN itsr.jan_complaint_login cl ON cl.CMPL_USER_ID = pu.Id
        WHERE LOWER(cl.CMPL_USER_NAME) = LOWER(@UserName) 
          AND LOWER(pu.Role) = 'hod' 
          AND pu.IsActive = 1;";

    public const string UpdateAccessItemStatus = @"
        UPDATE jan_access_items 
        SET status = @Status, modified_on = NOW() 
        WHERE id = @Id;";

    public const string UpdateAccessItemStatusAndConfirmType = @"
        UPDATE jan_access_items 
        SET status = @Status, 
            confirm_access_type = COALESCE(@ConfirmAccessType, confirm_access_type), 
            modified_on = NOW() 
        WHERE id = @Id;";

    public const string UpdateAccessItemForResubmit = @"
        UPDATE jan_access_items 
        SET folder_path = @FolderPath, 
            access_type = @AccessType, 
            reason_for_access = @ReasonForAccess, 
            status = 'PENDING_DEPT_HOD', 
            modified_by = @ModifiedBy, 
            modified_on = NOW() 
        WHERE id = @Id;";

    public const string GetAccessItem = @"
        SELECT id, request_id AS RequestId, folder_path AS FolderPath, access_type AS AccessType, reason_for_access AS ReasonForAccess, confirm_access_type AS ConfirmAccessType, created_by AS CreatedBy, status AS Status, granted_at AS GrantedAt, expires_at AS ExpiresAt, modified_by AS ModifiedBy, modified_on AS ModifiedOn, is_active AS IsActive
        FROM jan_access_items WHERE id = @Id;";

    public const string GetAccessItemCreatedByAndPath = @"
        SELECT created_by AS CreatedBy, folder_path AS FolderPath, confirm_access_type AS ConfirmAccessType, access_type AS AccessType FROM jan_access_items WHERE id = @Id;";

    public const string UpdateAccessItemOperatorStatus = @"
        UPDATE jan_access_items 
        SET status = @Status, modified_by = @OperatorUser, modified_on = NOW() 
        WHERE id = @Id;";

    public const string UpdateAccessItemGranted = @"
        UPDATE jan_access_items 
        SET status = 'ACCESS_GRANTED', 
            granted_at = NOW(), 
            expires_at = DATE_ADD(NOW(), INTERVAL 90 DAY), 
            modified_by = @OperatorUser,
            modified_on = NOW() 
        WHERE id = @Id;";

    public const string UpdateAccessItemRevoked = @"
        UPDATE jan_access_items 
        SET status = 'ACCESS_REVOKED', 
            modified_by = @OperatorUser, 
            modified_on = NOW() 
        WHERE id = @Id;";

    public const string GetAllTickets = @"
        SELECT id, req_to AS ReqTo, ticket_number AS TicketNumber, created_by AS CreatedBy, created_on AS CreatedOn, is_active AS IsActive 
        FROM jan_access_request;";

    public const string GetAllAccessItems = @"
        SELECT id, request_id AS RequestId, folder_path AS FolderPath, access_type AS AccessType, reason_for_access AS ReasonForAccess, confirm_access_type AS ConfirmAccessType, created_by AS CreatedBy, status AS Status, granted_at AS GrantedAt, expires_at AS ExpiresAt, modified_by AS ModifiedBy, modified_on AS ModifiedOn, is_active AS IsActive 
        FROM jan_access_items;";

    public const string GetApprovalLogsByItem = @"
        SELECT id, item_id AS ItemId, approver_role AS ApproverRole, approved_by AS ApprovedBy, action_taken AS ActionTaken, action_date AS ActionDate, comments AS Comments 
        FROM jan_approval_log 
        WHERE item_id = @ItemId;";

    public const string GetDistinctAuditFolderPaths = @"
        SELECT DISTINCT FolderPath 
        FROM workspace.jan_ntfs_permissions_audit 
        WHERE FolderPath IS NOT NULL 
          AND LENGTH(FolderPath) > 0;";

    public const string GetAllAuditLogs = @"
        SELECT 
            l.id AS LogId,
            l.item_id AS ItemId,
            r.id AS RequestId,
            r.ticket_number AS TicketNumber,
            r.req_to AS ReqTo,
            r.created_by AS Requester,
            r.created_on AS RequestDate,
            i.folder_path AS FolderPath,
            i.access_type AS RequestedAccessType,
            COALESCE(i.confirm_access_type, i.access_type) AS ConfirmedAccessType,
            i.reason_for_access AS ReasonForAccess,
            i.status AS CurrentStatus,
            i.granted_at AS GrantedAt,
            i.expires_at AS ExpiresAt,
            l.approver_role AS ApproverRole,
            l.approved_by AS ActionBy,
            l.action_taken AS ActionTaken,
            l.action_date AS ActionDate,
            l.comments AS Comments
        FROM jan_approval_log l
        INNER JOIN jan_access_items i ON l.item_id = i.id
        INNER JOIN jan_access_request r ON i.request_id = r.id
        ORDER BY l.action_date DESC, l.id DESC;";
}
