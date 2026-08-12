using System.Collections.Generic;
using System.Threading.Tasks;
using GateEntry.Api.Models;

namespace GateEntry.Api.Services
{
    public interface IGateValidationService
    {
        Task<(bool IsValid, string Message)> ValidateGateEntryForApprovalAsync(int gateNo, string validatedBy, string? ewayBill);
        Task<(bool IsValid, string Message)> ValidateDcQuantityAsync(int vendorId, string dcNo, IEnumerable<GateLine> lines);
    }
}
