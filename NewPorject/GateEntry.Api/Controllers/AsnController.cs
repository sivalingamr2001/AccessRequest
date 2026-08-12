using System;
using System.Threading.Tasks;
using GateEntry.Api.Models;
using GateEntry.Api.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace GateEntry.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AsnController : ControllerBase
    {
        private readonly IAsnRepository _asnRepository;

        public AsnController(IAsnRepository asnRepository)
        {
            _asnRepository = asnRepository;
        }

        [HttpGet("{asnNo}")]
        public async Task<IActionResult> GetAsnDetails(string asnNo)
        {
            if (string.IsNullOrWhiteSpace(asnNo))
            {
                return BadRequest("ASN number must be provided");
            }

            var asn = await _asnRepository.GetAsnDetailsAsync(asnNo);
            if (asn == null)
            {
                return NotFound("Advance Shipping Notice (ASN/ADI) not found");
            }

            // Validation Rule: ASN Entry Deleted by Supplier
            if (asn.DelAsn == 1)
            {
                return BadRequest("ADI Entry Deleted by Supplier/Vendor !.., cannot proceed with gate entry.");
            }

            // Inform if already linked to a Gate entry
            if (asn.GateNo.HasValue && asn.GateNo.Value > 0)
            {
                return Ok(new { Asn = asn, Warning = $"This ASN is already linked to Gate Entry #{asn.GateNo}" });
            }

            return Ok(asn);
        }

        [HttpPost("link-gate")]
        public async Task<IActionResult> LinkGate([FromBody] LinkGateRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.AsnNo) || request.GateNo <= 0)
            {
                return BadRequest("Invalid mapping request. Both AsnNo and GateNo are required.");
            }

            bool exists = await _asnRepository.CheckAsnNoExistsAsync(request.AsnNo);
            if (!exists)
            {
                return NotFound("ASN not found");
            }

            try
            {
                bool success = await _asnRepository.LinkGateToAsnAsync(request.AsnNo, request.GateNo);
                if (!success)
                {
                    return BadRequest("Failed to update ASN record with gate details");
                }

                return Ok(new { Success = true, Message = $"ASN {request.AsnNo} successfully linked to Gate Entry #{request.GateNo}" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred linking ASN: {ex.Message}");
            }
        }
    }

    public class LinkGateRequest
    {
        public string AsnNo { get; set; } = null!;
        public int GateNo { get; set; }
    }
}
