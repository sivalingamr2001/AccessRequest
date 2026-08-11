namespace ACCESSREQUEST.WEB.Models;

public enum AccessStatus
{
    PENDING_DEPT_HOD,
    PENDING_FOLDER_OWNER,
    PENDING_OPERATOR,
    ACCESS_GRANTED,
    REJECTED_BY_DEPT_HOD,
    REJECTED_BY_FOLDER_OWNER,
    REJECTED_BY_OPERATOR,
    ACCESS_REVOKED,
    ACCESS_EXPIRED
}

public class RequestCreationPayload
{
    public string ReqTo { get; set; } = string.Empty;
    public string CreatedBy { get; set; } = string.Empty;
    public List<AccessItemInput> Items { get; set; } = new();
}

public class AccessItemInput
{
    public string FolderPath { get; set; } = string.Empty;
    public string AccessType { get; set; } = string.Empty;
    public string ReasonForAccess { get; set; } = string.Empty;
}

public class AccessItemDto
{
    public int Id { get; set; }
    public int RequestId { get; set; }
    public string FolderPath { get; set; } = string.Empty;
    public string AccessType { get; set; } = string.Empty;
    public string ReasonForAccess { get; set; } = string.Empty;
    public string? ConfirmAccessType { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? GrantedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string? ModifiedBy { get; set; }
    public DateTime? ModifiedOn { get; set; }
}

public class TicketDto
{
    public int Id { get; set; }
    public string ReqTo { get; set; } = string.Empty;
    public string TicketNumber { get; set; } = string.Empty;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedOn { get; set; }
    public int IsActive { get; set; }
    public List<AccessItemDto> Items { get; set; } = new();
}

public class ApprovalLogDto
{
    public int Id { get; set; }
    public int ItemId { get; set; }
    public string ApproverRole { get; set; } = string.Empty;
    public string ApprovedBy { get; set; } = string.Empty;
    public string ActionTaken { get; set; } = string.Empty;
    public DateTime ActionDate { get; set; }
    public string? Comments { get; set; }
}

public class ParsedFolderPathDto
{
    public string FullPath { get; set; } = string.Empty;
    public string DriveName { get; set; } = string.Empty;
    public string ParentFolder { get; set; } = string.Empty;
    public string ChildDepth1 { get; set; } = string.Empty;
    public string ChildDepth2 { get; set; } = string.Empty;
    public string ChildDepth3 { get; set; } = string.Empty;
    public string ChildDepth4 { get; set; } = string.Empty;
}

public class MailLogDto
{
    public string MailDate { get; set; } = string.Empty;
    public string MailProgram { get; set; } = string.Empty;
    public string MailFrom { get; set; } = string.Empty;
    public string MailTo { get; set; } = string.Empty;
    public string MailSubject { get; set; } = string.Empty;
    public bool MailSent { get; set; }
    public string MailBody { get; set; } = string.Empty;
    public string MailCc { get; set; } = string.Empty;
}

public class FolderMappingOwnerDto
{
    public string? PrimaryFolderOwner { get; set; }
    public string? SecondaryFolderOwner { get; set; }
}

public class FolderMappingDto
{
    public int Id { get; set; }
    public string FolderPath { get; set; } = string.Empty;
    public string PrimaryFolderOwner { get; set; } = string.Empty;
    public string? SecondaryFolderOwner { get; set; }
    public int IsActive { get; set; } = 1;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedOn { get; set; }
    public string? ModifiedBy { get; set; }
    public DateTime? ModifiedOn { get; set; }
}

public class AuditLogDetailDto
{
    public int LogId { get; set; }
    public int ItemId { get; set; }
    public int RequestId { get; set; }
    public string TicketNumber { get; set; } = string.Empty;
    public string ReqTo { get; set; } = string.Empty;
    public string Requester { get; set; } = string.Empty;
    public DateTime RequestDate { get; set; }
    public string FolderPath { get; set; } = string.Empty;
    public string RequestedAccessType { get; set; } = string.Empty;
    public string ConfirmedAccessType { get; set; } = string.Empty;
    public string ReasonForAccess { get; set; } = string.Empty;
    public string CurrentStatus { get; set; } = string.Empty;
    public DateTime? GrantedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string ApproverRole { get; set; } = string.Empty;
    public string ActionBy { get; set; } = string.Empty;
    public string ActionTaken { get; set; } = string.Empty;
    public DateTime ActionDate { get; set; }
    public string? Comments { get; set; }
}


