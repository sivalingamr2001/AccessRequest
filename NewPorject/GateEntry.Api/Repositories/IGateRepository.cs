using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using GateEntry.Api.Models;

namespace GateEntry.Api.Repositories
{
    public interface IGateRepository
    {
        Task<IEnumerable<GateHeader>> GetGateEntriesAsync(DateTime? fromDate, DateTime? toDate, string? unit, string? supplierName);
        Task<GateHeader?> GetGateHeaderAsync(int gateNo);
        Task<IEnumerable<GateLine>> GetGateLinesAsync(int gateNo);
        Task<int> CreateGateEntryAsync(GateHeader header, IEnumerable<GateLine> lines);
        Task<bool> UpdateGateEntryAsync(int gateNo, GateHeader header, IEnumerable<GateLine> lines);
        Task<bool> DeleteGateEntryAsync(int gateNo, string reason, string actionRemark, string username);
        Task<bool> UpdateValidationStatusAsync(int gateNo, int validatedStatus, string validatedBy, string? ewayBill);
        Task<bool> SaveValidationReasonAsync(ValidationReason reason);
        Task<bool> CheckGateNoExistsAsync(int gateNo);
        Task<bool> CheckDcNoExistsForSupplierAsync(int vendorId, string dcNo);
        Task<bool> CheckReceiptMadeAsync(int gateNo);
    }
}
