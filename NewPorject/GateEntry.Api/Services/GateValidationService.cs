using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GateEntry.Api.Models;
using GateEntry.Api.Repositories;

namespace GateEntry.Api.Services
{
    public class GateValidationService : IGateValidationService
    {
        private readonly IGateRepository _gateRepository;

        public GateValidationService(IGateRepository gateRepository)
        {
            _gateRepository = gateRepository;
        }

        public async Task<(bool IsValid, string Message)> ValidateGateEntryForApprovalAsync(int gateNo, string validatedBy, string? ewayBill)
        {
            // 1. Fetch gate header details
            var header = await _gateRepository.GetGateHeaderAsync(gateNo);
            if (header == null)
            {
                return (false, "Gate entry not found");
            }

            // 2. Check if Oracle ERP Receipt is already made
            bool receiptMade = await _gateRepository.CheckReceiptMadeAsync(gateNo);
            if (receiptMade)
            {
                return (false, "Receipt already created in Oracle ERP. Validation changes are not allowed.");
            }

            // 3. Rule: Received Weight not entered for POD
            if (header.PoWt.HasValue && header.PoWt.Value > 0 && (!header.RecWt.HasValue || header.RecWt.Value == 0))
            {
                return (false, "Received Weight not entered for POD");
            }

            // 4. Rule: Interstate / E-Invoice E-way Bill requirement check
            // E-Invoice registered vendor check
            bool isEInvoiceRegistered = header.VendorId == 5001 || header.VendorId == 5003; 
            decimal invoiceThreshold = 100000.00m;
            
            // Assume site code not matching local site indicates Interstate purchase
            bool isInterstate = header.SupplierSite != null && 
                                !header.SupplierSite.Contains("CHENNAI-UNIT", StringComparison.OrdinalIgnoreCase);

            if (isEInvoiceRegistered && header.InvoiceVal.HasValue && header.InvoiceVal.Value >= invoiceThreshold && isInterstate)
            {
                if (string.IsNullOrWhiteSpace(ewayBill))
                {
                    return (false, "Enter Supplier E-way bill No and proceed. Interstate purchase over Rs. 100,000 requires an E-way Bill.");
                }

                if (ewayBill.Length != 12)
                {
                    return (false, "Enter valid 12-digit E-way bill number and proceed");
                }
            }

            // 5. Fetch and validate item lines
            var lines = await _gateRepository.GetGateLinesAsync(gateNo);
            foreach (var line in lines)
            {
                if (line.SupDcQty.HasValue && line.PoPend.HasValue && line.SupDcQty.Value > line.PoPend.Value)
                {
                    return (false, $"Item {line.Item} quantity ({line.SupDcQty}) exceeds pending PO quantity ({line.PoPend})");
                }
            }

            // If all validation checks pass, update the validation status (VALIDATED = 5 - Supervisor Validated)
            bool updated = await _gateRepository.UpdateValidationStatusAsync(gateNo, 5, validatedBy, ewayBill);
            if (!updated)
            {
                return (false, "Failed to update validation status in database");
            }

            return (true, "Gate entry successfully validated by supervisor");
        }

        public async Task<(bool IsValid, string Message)> ValidateDcQuantityAsync(int vendorId, string dcNo, IEnumerable<GateLine> lines)
        {
            // Rule: DC number duplicate check
            bool dcExists = await _gateRepository.CheckDcNoExistsForSupplierAsync(vendorId, dcNo);
            if (dcExists)
            {
                return (false, "DC No already available for this supplier");
            }

            // Rule: Quantities check against PO pending limit
            foreach (var line in lines)
            {
                if (line.SupDcQty.HasValue && line.PoPend.HasValue && line.SupDcQty.Value > line.PoPend.Value)
                {
                    return (false, $"DcQty Greater Then Po Pend for item {line.Item}");
                }
            }

            return (true, "Valid");
        }
    }
}
