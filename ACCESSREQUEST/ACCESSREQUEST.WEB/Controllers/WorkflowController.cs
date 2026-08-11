using Microsoft.AspNetCore.Mvc;
using ACCESSREQUEST.WEB.Services;
using ACCESSREQUEST.WEB.Models;
using ACCESSREQUEST.WEB.Interfaces;

namespace ACCESSREQUEST.WEB.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WorkflowController : ControllerBase
{
    private readonly IWorkflowEngine _workflowEngine;

    public WorkflowController(IWorkflowEngine workflowEngine)
    {
        _workflowEngine = workflowEngine;
    }

    [HttpPost("requests")]
    public async Task<IActionResult> CreateRequest([FromBody] RequestCreationPayload payload)
    {
        if (payload == null || string.IsNullOrWhiteSpace(payload.CreatedBy))
        {
            return BadRequest("Invalid request payload.");
        }

        try
        {
            var ticketNumber = await _workflowEngine.CreateRequestAsync(payload);
            return Ok(new { TicketNumber = ticketNumber });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while creating the request: {ex.Message}");
        }
    }

    [HttpPost("items/{itemId}/hod-approval")]
    public async Task<IActionResult> HandleHodApproval(int itemId, [FromBody] ApprovalRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Approver))
        {
            return BadRequest("Invalid approval request.");
        }

        try
        {
            await _workflowEngine.HandleHodApprovalAsync(itemId, request.Approver, request.IsApproved, request.Comments, request.ConfirmAccessType);
            return Ok(new { Message = "HOD approval processed successfully." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred: {ex.Message}");
        }
    }

    [HttpPost("items/{itemId}/folder-owner-approval")]
    public async Task<IActionResult> HandleFolderOwnerApproval(int itemId, [FromBody] ApprovalRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Approver))
        {
            return BadRequest("Invalid approval request.");
        }

        try
        {
            await _workflowEngine.HandleFolderOwnerApprovalAsync(itemId, request.Approver, request.IsApproved, request.Comments, request.ConfirmAccessType);
            return Ok(new { Message = "Folder owner approval processed successfully." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred: {ex.Message}");
        }
    }

    [HttpPost("items/{itemId}/operator-action")]
    public async Task<IActionResult> HandleOperatorAction(int itemId, [FromBody] ApprovalRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Approver))
        {
            return BadRequest("Invalid approval request.");
        }

        try
        {
            await _workflowEngine.HandleOperatorActionAsync(itemId, request.Approver, request.IsApproved, request.Comments);
            return Ok(new { Message = "Operator action processed successfully." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred: {ex.Message}");
        }
    }

    [HttpPost("items/{itemId}/revoke")]
    public async Task<IActionResult> HandleRevokeAccess(int itemId, [FromBody] RevokeRequestDto request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.OperatorUser) || string.IsNullOrWhiteSpace(request.Comments))
        {
            return BadRequest("Operator username and comments are required for revocation.");
        }

        try
        {
            var success = await _workflowEngine.HandleRevokeAccessAsync(itemId, request.OperatorUser, request.Comments);
            return Ok(new { Success = success, Message = "Access revoked successfully." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while revoking access: {ex.Message}");
        }
    }

    [HttpGet("tickets")]
    public async Task<IActionResult> GetAllTickets()
    {
        try
        {
            var tickets = await _workflowEngine.GetAllTicketsAsync();
            return Ok(tickets);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred: {ex.Message}");
        }
    }

    [HttpGet("items/{itemId}/logs")]
    public async Task<IActionResult> GetApprovalLogs(int itemId)
    {
        try
        {
            var logs = await _workflowEngine.GetApprovalLogsAsync(itemId);
            return Ok(logs);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred: {ex.Message}");
        }
    }

    [HttpGet("audit-logs")]
    public async Task<IActionResult> GetAllAuditLogs()
    {
        try
        {
            var logs = await _workflowEngine.GetAllAuditLogsAsync();
            return Ok(logs);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while fetching audit logs: {ex.Message}");
        }
    }

    [HttpGet("folder-paths")]
    public async Task<IActionResult> GetFolderPaths()
    {
        try
        {
            var paths = await _workflowEngine.GetParsedFolderPathsAsync();
            return Ok(paths);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while fetching folder paths: {ex.Message}");
        }
    }

    [HttpPost("items/{itemId}/resubmit")]
    public async Task<IActionResult> ResubmitItem(int itemId, [FromBody] ResubmitRequestDto request)
    {
        try
        {
            var success = await _workflowEngine.ResubmitItemAsync(itemId, request.FolderPath, request.AccessType, request.ReasonForAccess, request.Username);
            return Ok(new { Success = success });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while resubmitting item: {ex.Message}");
        }
    }

    [HttpGet("folder-mappings")]
    public async Task<IActionResult> GetFolderMappings()
    {
        try
        {
            var mappings = await _workflowEngine.GetAllFolderMappingsAsync();
            return Ok(mappings);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while fetching folder mappings: {ex.Message}");
        }
    }

    [HttpPost("folder-mappings")]
    public async Task<IActionResult> AddFolderMapping([FromBody] FolderMappingDto mapping)
    {
        try
        {
            var id = await _workflowEngine.AddFolderMappingAsync(mapping);
            return Ok(new { Success = true, Id = id });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while adding folder mapping: {ex.Message}");
        }
    }

    [HttpPut("folder-mappings/{id}")]
    public async Task<IActionResult> UpdateFolderMapping(int id, [FromBody] FolderMappingDto mapping)
    {
        try
        {
            mapping.Id = id;
            var success = await _workflowEngine.UpdateFolderMappingAsync(mapping);
            return Ok(new { Success = success });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while updating folder mapping: {ex.Message}");
        }
    }

    [HttpDelete("folder-mappings/{id}")]
    public async Task<IActionResult> DeleteFolderMapping(int id)
    {
        try
        {
            var success = await _workflowEngine.DeleteFolderMappingAsync(id);
            return Ok(new { Success = success });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while deleting folder mapping: {ex.Message}");
        }
    }

    [HttpPost("mail-logs")]
    public async Task<IActionResult> InsertMailLog([FromBody] MailLogDto mailDto)
    {
        try
        {
            var success = await _workflowEngine.InsertMailLogAsync(mailDto);
            return Ok(new { Success = success });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while inserting mail log: {ex.Message}");
        }
    }
}

public class ApprovalRequest
{
    public string Approver { get; set; } = string.Empty;
    public bool IsApproved { get; set; }
    public string? Comments { get; set; }
    public string? ConfirmAccessType { get; set; }
}

public class ResubmitRequestDto
{
    public string FolderPath { get; set; } = string.Empty;
    public string AccessType { get; set; } = string.Empty;
    public string ReasonForAccess { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
}

public class RevokeRequestDto
{
    public string OperatorUser { get; set; } = string.Empty;
    public string Comments { get; set; } = string.Empty;
}
