using System;

namespace GateEntry.Api.Models
{
    public class GateHeader
    {
        public int GateNo { get; set; }
        public string? GateId { get; set; }
        public string? SupplierName { get; set; }
        public string? SupplierSite { get; set; }
        public string? DcNo { get; set; }
        public DateTime? DcDate { get; set; }
        public int Validated { get; set; } // 0=Validated, 1=GateCreated, 2=ValPending, 4=RTV, 5=SupervisorValidated, 6=NoRef
        public string? GType { get; set; } // PO, OSP, Non-PO, Direct Delivery
        public DateTime? GDate { get; set; }
        public string? VehicleDet { get; set; }
        public string? CourierName { get; set; }
        public string? PodNo { get; set; }
        public int? NoOfBox { get; set; }
        public decimal? PoWt { get; set; }
        public decimal? RecWt { get; set; }
        public DateTime? RecWtDt { get; set; }
        public string? Unit { get; set; }
        public string? Flag { get; set; }
        public string? AdiNo { get; set; }
        public DateTime? AdiDate { get; set; }
        public decimal? InvoiceVal { get; set; }
        public string? Xerox { get; set; }
        public int? VendorId { get; set; }
        public string? AdiVia { get; set; }
        public string? AdiType { get; set; }
        public string? DirectDlydFlag { get; set; }
        public string? AdiReason { get; set; }
        public string? Reason { get; set; } // Cancellation reason
        public string? ReaRef { get; set; }
        public string? Org { get; set; }
        public string? ValidatedBy { get; set; }
        public string? EwayNo { get; set; }
    }
}
