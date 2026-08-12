using System;
using System.Threading.Tasks;
using GateEntry.Api.Models;
using GateEntry.Api.Repositories;
using GateEntry.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace GateEntry.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GateValidationController : ControllerBase
    {
        private readonly IGateValidationService _validationService;
        private readonly IGateRepository _gateRepository;

        public GateValidationController(IGateValidationService validationService, IGateRepository gateRepository)
        {
            _validationService = validationService;
            _gateRepository = gateRepository;
        }

        [HttpPost("validate")]
        public async Task<IActionResult> ValidateEntry([FromBody] ValidateRequest request)
        {
            if (request == null || request.GateNo <= 0 || string.IsNullOrWhiteSpace(request.ValidatedBy))
            {
                return BadRequest("Invalid validation payload. GateNo and ValidatedBy are required.");
            }

            var result = await _validationService.ValidateGateEntryForApprovalAsync(request.GateNo, request.ValidatedBy, request.EwayBill);
            if (!result.IsValid)
            {
                return BadRequest(result.Message);
            }

            return Ok(new { Success = true, Message = result.Message });
        }

        [HttpPost("reasons")]
        public async Task<IActionResult> SaveReason([FromBody] ValidationReason reason)
        {
            if (reason == null || reason.GateNo <= 0 || string.IsNullOrWhiteSpace(reason.ReaName))
            {
                return BadRequest("Invalid audit reason payload");
            }

            try
            {
                bool success = await _gateRepository.SaveValidationReasonAsync(reason);
                if (!success)
                {
                    return BadRequest("Failed to save audit logs");
                }

                return Ok("Validation reason successfully recorded");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }

    public class ValidateRequest
    {
        public int GateNo { get; set; }
        public string ValidatedBy { get; set; } = null!;
        public string? EwayBill { get; set; }
    }
}
