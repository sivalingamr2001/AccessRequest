using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GateEntry.Api.Models;

namespace GateEntry.Api.Repositories
{
    public class MockGateRepository : IGateRepository
    {
        private static readonly List<GateHeader> MockHeaders = new()
        {
            new GateHeader
            {
                GateNo = 10001,
                GateId = "10001",
                SupplierName = "Tata Steel Ltd",
                SupplierSite = "MUMBAI-UNIT",
                DcNo = "DC-90812",
                DcDate = DateTime.Now.AddDays(-2),
                Validated = 1, // Gate Created
                GType = "PO",
                GDate = DateTime.Now.AddDays(-2),
                VehicleDet = "MH-12-PQ-9876",
                CourierName = "BlueDart",
                PodNo = "BD-12345",
                NoOfBox = 5,
                PoWt = 1500.50m,
                RecWt = null,
                Unit = "UNIT7",
                Flag = "Y",
                InvoiceVal = 125000.00m,
                VendorId = 5001,
                Org = "444"
            },
            new GateHeader
            {
                GateNo = 10002,
                GateId = "10002",
                SupplierName = "Apex Fasteners",
                SupplierSite = "CHENNAI-UNIT",
                DcNo = "DC-4390",
                DcDate = DateTime.Now.AddDays(-1),
                Validated = 2, // Validation Pending
                GType = "PO",
                GDate = DateTime.Now.AddDays(-1),
                VehicleDet = "TN-07-JK-4321",
                CourierName = null,
                PodNo = null,
                NoOfBox = 2,
                PoWt = 50.00m,
                RecWt = 50.00m,
                Unit = "UNIT7",
                Flag = "Y",
                InvoiceVal = 85000.00m,
                VendorId = 5002,
                Org = "444"
            },
            new GateHeader
            {
                GateNo = 10003,
                GateId = "10003",
                SupplierName = "Interstate Packers",
                SupplierSite = "BANGALORE-UNIT",
                DcNo = "DC-6752",
                DcDate = DateTime.Now.AddDays(-3),
                Validated = 5, // Supervisor Validated
                GType = "OSP",
                GDate = DateTime.Now.AddDays(-3),
                VehicleDet = "KA-03-TR-8811",
                CourierName = "DTDC",
                PodNo = "DT-987",
                NoOfBox = 1,
                PoWt = 10.0m,
                RecWt = 9.8m,
                Unit = "UNIT7",
                Flag = "Y",
                InvoiceVal = 4000.00m,
                VendorId = 5003,
                Org = "444",
                ValidatedBy = "SUPERVISOR-A",
                EwayNo = "EWAY-9988771122"
            }
        };

        private static readonly List<GateLine> MockLines = new()
        {
            new GateLine
            {
                LineNo = 1,
                GateNo = 10001,
                GateId = "10001",
                PoNo = "PO-45000123",
                PoDt = DateTime.Now.AddDays(-30),
                Item = "ITEM-MS-PLATES",
                Description = "Mild Steel Plates 10mm",
                Rev = "0",
                PoPend = 50.0m,
                SupDcQty = 40.0m,
                Uom = "PCS",
                Validated = 1,
                Org = "444",
                PoQty = 100.0m,
                PoType = "Bought Outs"
            },
            new GateLine
            {
                LineNo = 1,
                GateNo = 10002,
                GateId = "10002",
                PoNo = "PO-45000456",
                PoDt = DateTime.Now.AddDays(-15),
                Item = "ITEM-FASTENER-M8",
                Description = "Fasteners Hex Head M8",
                Rev = "1",
                PoPend = 1000.0m,
                SupDcQty = 500.0m,
                Uom = "PCS",
                Validated = 2,
                Org = "444",
                PoQty = 2000.0m,
                PoType = "Bought Outs"
            },
            new GateLine
            {
                LineNo = 1,
                GateNo = 10003,
                GateId = "10003",
                PoNo = "OSP-32000099",
                PoDt = DateTime.Now.AddDays(-10),
                Item = "ITEM-OSP-CHALLAN",
                Description = "Heat Treatment OSP Outward Service",
                Rev = "0",
                PoPend = 5.0m,
                SupDcQty = 5.0m,
                Uom = "LOT",
                Validated = 5,
                Org = "444",
                PoQty = 5.0m,
                PoType = "Services"
            }
        };

        private static readonly List<ValidationReason> MockAuditLogs = new();

        public Task<IEnumerable<GateHeader>> GetGateEntriesAsync(DateTime? fromDate, DateTime? toDate, string? unit, string? supplierName)
        {
            var query = MockHeaders.AsEnumerable();

            if (fromDate.HasValue)
                query = query.Where(h => h.GDate >= fromDate.Value.Date);

            if (toDate.HasValue)
                query = query.Where(h => h.GDate <= toDate.Value.Date.AddDays(1).AddSeconds(-1));

            if (!string.IsNullOrEmpty(unit))
                query = query.Where(h => h.Unit == unit);

            if (!string.IsNullOrEmpty(supplierName))
                query = query.Where(h => h.SupplierName != null && h.SupplierName.Contains(supplierName, StringComparison.OrdinalIgnoreCase));

            return Task.FromResult(query.ToList().AsEnumerable());
        }

        public Task<GateHeader?> GetGateHeaderAsync(int gateNo)
        {
            var header = MockHeaders.FirstOrDefault(h => h.GateNo == gateNo);
            return Task.FromResult(header);
        }

        public Task<IEnumerable<GateLine>> GetGateLinesAsync(int gateNo)
        {
            var lines = MockLines.Where(l => l.GateNo == gateNo);
            return Task.FromResult(lines.ToList().AsEnumerable());
        }

        public Task<int> CreateGateEntryAsync(GateHeader header, IEnumerable<GateLine> lines)
        {
            int nextGateNo = MockHeaders.Any() ? MockHeaders.Max(h => h.GateNo) + 1 : 10001;
            header.GateNo = nextGateNo;
            header.GateId = nextGateNo.ToString();
            header.GDate ??= DateTime.Now;
            header.Validated = 1; // Created

            MockHeaders.Add(header);

            int lineNo = 1;
            foreach (var line in lines)
            {
                line.GateNo = nextGateNo;
                line.GateId = nextGateNo.ToString();
                line.LineNo = lineNo++;
                line.Validated = 1;
                MockLines.Add(line);
            }

            return Task.FromResult(nextGateNo);
        }

        public Task<bool> UpdateGateEntryAsync(int gateNo, GateHeader header, IEnumerable<GateLine> lines)
        {
            var existingHeader = MockHeaders.FirstOrDefault(h => h.GateNo == gateNo);
            if (existingHeader == null) return Task.FromResult(false);

            // Update header fields
            existingHeader.SupplierName = header.SupplierName;
            existingHeader.SupplierSite = header.SupplierSite;
            existingHeader.DcNo = header.DcNo;
            existingHeader.DcDate = header.DcDate;
            existingHeader.VehicleDet = header.VehicleDet;
            existingHeader.CourierName = header.CourierName;
            existingHeader.PodNo = header.PodNo;
            existingHeader.NoOfBox = header.NoOfBox;
            existingHeader.PoWt = header.PoWt;
            existingHeader.RecWt = header.RecWt;
            existingHeader.InvoiceVal = header.InvoiceVal;
            existingHeader.VendorId = header.VendorId;
            existingHeader.Org = header.Org;
            existingHeader.DirectDlydFlag = header.DirectDlydFlag;
            existingHeader.AdiReason = header.AdiReason;

            // Remove existing lines and insert new ones
            MockLines.RemoveAll(l => l.GateNo == gateNo);

            int lineNo = 1;
            foreach (var line in lines)
            {
                line.GateNo = gateNo;
                line.GateId = gateNo.ToString();
                line.LineNo = lineNo++;
                MockLines.Add(line);
            }

            return Task.FromResult(true);
        }

        public Task<bool> DeleteGateEntryAsync(int gateNo, string reason, string actionRemark, string username)
        {
            var header = MockHeaders.FirstOrDefault(h => h.GateNo == gateNo);
            if (header == null) return Task.FromResult(false);

            header.Validated = 4; // Cancelled
            header.Reason = reason;
            header.ReaRef = actionRemark;

            foreach (var line in MockLines.Where(l => l.GateNo == gateNo))
            {
                line.Validated = 4;
            }

            MockAuditLogs.Add(new ValidationReason
            {
                GateNo = gateNo,
                ReaName = reason,
                ReaRemark = actionRemark,
                ReaDt = DateTime.Now,
                UName = username,
                Action = "CANCEL"
            });

            return Task.FromResult(true);
        }

        public Task<bool> UpdateValidationStatusAsync(int gateNo, int validatedStatus, string validatedBy, string? ewayBill)
        {
            var header = MockHeaders.FirstOrDefault(h => h.GateNo == gateNo);
            if (header == null) return Task.FromResult(false);

            header.Validated = validatedStatus;
            header.ValidatedBy = validatedBy;
            header.EwayNo = ewayBill;

            foreach (var line in MockLines.Where(l => l.GateNo == gateNo))
            {
                line.Validated = validatedStatus;
            }

            return Task.FromResult(true);
        }

        public Task<bool> SaveValidationReasonAsync(ValidationReason reason)
        {
            reason.ReaDt = DateTime.Now;
            MockAuditLogs.Add(reason);
            return Task.FromResult(true);
        }

        public Task<bool> CheckGateNoExistsAsync(int gateNo)
        {
            return Task.FromResult(MockHeaders.Any(h => h.GateNo == gateNo));
        }

        public Task<bool> CheckDcNoExistsForSupplierAsync(int vendorId, string dcNo)
        {
            return Task.FromResult(MockHeaders.Any(h => h.VendorId == vendorId && h.DcNo == dcNo && h.Validated != 4));
        }

        public Task<bool> CheckReceiptMadeAsync(int gateNo)
        {
            // Simulate that 10003 has a receipt made and cannot be changed/deleted
            return Task.FromResult(gateNo == 10003);
        }
    }
}
