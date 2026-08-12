using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GateEntry.Api.Models;
using GateEntry.Api.Repositories;
using GateEntry.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace GateEntry.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GateEntriesController : ControllerBase
    {
        private readonly IGateRepository _gateRepository;
        private readonly IGateValidationService _validationService;

        public GateEntriesController(IGateRepository gateRepository, IGateValidationService validationService)
        {
            _gateRepository = gateRepository;
            _validationService = validationService;
        }

        [HttpGet]
        public async Task<IActionResult> GetList([FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, [FromQuery] string? unit, [FromQuery] string? supplierName)
        {
            var entries = await _gateRepository.GetGateEntriesAsync(fromDate, toDate, unit, supplierName);
            return Ok(entries);
        }

        [HttpGet("{gateNo}")]
        public async Task<IActionResult> GetDetails(int gateNo)
        {
            var header = await _gateRepository.GetGateHeaderAsync(gateNo);
            if (header == null)
            {
                return NotFound("Gate entry header not found");
            }

            var lines = await _gateRepository.GetGateLinesAsync(gateNo);
            var result = new GateEntryDto
            {
                Header = header,
                Lines = lines.ToList()
            };

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] GateEntryDto dto)
        {
            if (dto == null || dto.Header == null || dto.Lines == null || !dto.Lines.Any())
            {
                return BadRequest("Invalid gate entry payload");
            }

            // Enforce basic business validations
            var valResult = await _validationService.ValidateDcQuantityAsync(dto.Header.VendorId ?? 0, dto.Header.DcNo ?? "", dto.Lines);
            if (!valResult.IsValid)
            {
                return BadRequest(valResult.Message);
            }

            try
            {
                int gateNo = await _gateRepository.CreateGateEntryAsync(dto.Header, dto.Lines);
                return CreatedAtAction(nameof(GetDetails), new { gateNo = gateNo }, new { GateNo = gateNo, Message = "Gate Entry successfully created!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred during gate creation: {ex.Message}");
            }
        }

        [HttpPut("{gateNo}")]
        public async Task<IActionResult> Update(int gateNo, [FromBody] GateEntryDto dto)
        {
            if (dto == null || dto.Header == null || dto.Lines == null || !dto.Lines.Any())
            {
                return BadRequest("Invalid gate entry payload");
            }

            bool exists = await _gateRepository.CheckGateNoExistsAsync(gateNo);
            if (!exists)
            {
                return NotFound("Gate entry not found");
            }

            // Check if receipt has been made in ERP. If so, updates are blocked.
            bool receiptMade = await _gateRepository.CheckReceiptMadeAsync(gateNo);
            if (receiptMade)
            {
                return BadRequest("Receipt already created in Oracle ERP. Gate entry details cannot be modified.");
            }

            try
            {
                bool success = await _gateRepository.UpdateGateEntryAsync(gateNo, dto.Header, dto.Lines);
                if (!success)
                {
                    return BadRequest("Failed to update gate entry");
                }

                return Ok(new { GateNo = gateNo, Message = "Gate entry updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred during update: {ex.Message}");
            }
        }

        [HttpDelete("{gateNo}")]
        public async Task<IActionResult> Delete(int gateNo, [FromQuery] string reason, [FromQuery] string remark, [FromQuery] string username)
        {
            if (string.IsNullOrWhiteSpace(reason) || string.IsNullOrWhiteSpace(username))
            {
                return BadRequest("Reason and Username parameters are required for cancellation");
            }

            bool exists = await _gateRepository.CheckGateNoExistsAsync(gateNo);
            if (!exists)
            {
                return NotFound("Gate entry not found");
            }

            // Check if receipt made in ERP
            bool receiptMade = await _gateRepository.CheckReceiptMadeAsync(gateNo);
            if (receiptMade)
            {
                return BadRequest("Receipt already created in Oracle ERP. Gate entry cannot be deleted.");
            }

            try
            {
                bool success = await _gateRepository.DeleteGateEntryAsync(gateNo, reason, remark, username);
                if (!success)
                {
                    return BadRequest("Cancellation request failed");
                }

                return Ok($"Gate entry number {gateNo} successfully cancelled");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred during cancellation: {ex.Message}");
            }
        }
    }

    public class GateEntryDto
    {
        public GateHeader Header { get; set; } = null!;
        public List<GateLine> Lines { get; set; } = new();
    }
}
