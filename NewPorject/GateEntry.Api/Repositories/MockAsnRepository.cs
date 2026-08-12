using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GateEntry.Api.Models;

namespace GateEntry.Api.Repositories
{
    public class MockAsnRepository : IAsnRepository
    {
        private static readonly List<AsnHeader> MockAsns = new()
        {
            new AsnHeader
            {
                AsnNo = "ASN-9001",
                AsnDate = DateTime.Now.AddDays(-1),
                SupplierName = "Tata Steel Ltd",
                DcNo = "DC-90812",
                DcDate = DateTime.Now.AddDays(-1),
                InvoiceVal = 125000.00m,
                AsnType = "PO",
                VehicleDet = "MH-12-PQ-9876",
                CourierName = "BlueDart",
                PodNo = "BD-12345",
                NoOfBox = 5,
                PoWt = 1500.50m,
                RecWt = null,
                DelAsn = 0,
                GateNo = null,
                Lines = new List<AsnLine>
                {
                    new AsnLine
                    {
                        AsnNo = "ASN-9001",
                        LineNo = 1,
                        PoNo = "PO-45000123",
                        Item = "ITEM-MS-PLATES",
                        Description = "Mild Steel Plates 10mm",
                        Rev = "0",
                        PoPend = 50.0m,
                        SupDcQty = 40.0m,
                        Uom = "PCS",
                        Org = "444",
                        PoLine = 1,
                        PoHead = 12001,
                        LocationId = 321,
                        PoQty = 100.0m,
                        RateCat = "TAX-18",
                        PoType = "Bought Outs"
                    }
                }
            },
            new AsnHeader
            {
                AsnNo = "ASN-9002",
                AsnDate = DateTime.Now.AddDays(-2),
                SupplierName = "Apex Fasteners",
                DcNo = "DC-4390",
                DcDate = DateTime.Now.AddDays(-2),
                InvoiceVal = 85000.00m,
                AsnType = "PO",
                VehicleDet = "TN-07-JK-4321",
                DelAsn = 1, // Deleted/Cancelled by supplier
                GateNo = null
            },
            new AsnHeader
            {
                AsnNo = "ASN-9003",
                AsnDate = DateTime.Now.AddDays(-3),
                SupplierName = "Interstate Packers",
                DcNo = "DC-6752",
                DcDate = DateTime.Now.AddDays(-3),
                InvoiceVal = 4000.00m,
                AsnType = "OSP",
                VehicleDet = "KA-03-TR-8811",
                DelAsn = 0,
                GateNo = 10003, // Already linked
                Lines = new List<AsnLine>
                {
                    new AsnLine
                    {
                        AsnNo = "ASN-9003",
                        LineNo = 1,
                        PoNo = "OSP-32000099",
                        Item = "ITEM-OSP-CHALLAN",
                        Description = "Heat Treatment OSP Outward Service",
                        Rev = "0",
                        PoPend = 5.0m,
                        SupDcQty = 5.0m,
                        Uom = "LOT",
                        Org = "444",
                        PoLine = 1,
                        PoHead = 12003,
                        LocationId = 323,
                        PoQty = 5.0m,
                        RateCat = "TAX-0",
                        PoType = "Services"
                    }
                }
            }
        };

        public Task<AsnHeader?> GetAsnDetailsAsync(string asnNo)
        {
            var asn = MockAsns.FirstOrDefault(a => a.AsnNo.Equals(asnNo, StringComparison.OrdinalIgnoreCase));
            return Task.FromResult(asn);
        }

        public Task<bool> LinkGateToAsnAsync(string asnNo, int gateNo)
        {
            var asn = MockAsns.FirstOrDefault(a => a.AsnNo.Equals(asnNo, StringComparison.OrdinalIgnoreCase));
            if (asn == null) return Task.FromResult(false);

            asn.GateNo = gateNo;
            return Task.FromResult(true);
        }

        public Task<bool> CheckAsnNoExistsAsync(string asnNo)
        {
            return Task.FromResult(MockAsns.Any(a => a.AsnNo.Equals(asnNo, StringComparison.OrdinalIgnoreCase)));
        }
    }
}
