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
    public string CreatedBy { get; set; } = string.Empty;
}
