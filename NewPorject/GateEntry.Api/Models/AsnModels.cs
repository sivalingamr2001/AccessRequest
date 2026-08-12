using System;
using System.Collections.Generic;

namespace GateEntry.Api.Models
{
    public class AsnHeader
    {
        public string AsnNo { get; set; } = null!;
        public DateTime? AsnDate { get; set; }
        public string? SupplierName { get; set; }
        public string? DcNo { get; set; }
        public DateTime? DcDate { get; set; }
        public decimal? InvoiceVal { get; set; }
        public string? AsnType { get; set; } // PO, OSP, etc.
        public string? VehicleDet { get; set; }
        public string? CourierName { get; set; }
        public string? PodNo { get; set; }
        public int? NoOfBox { get; set; }
        public decimal? PoWt { get; set; }
        public decimal? RecWt { get; set; }
        public int DelAsn { get; set; } // 0 = Active, 1 = Deleted by Supplier
        public int? GateNo { get; set; } // Linked Oracle gate entry number
        public List<AsnLine> Lines { get; set; } = new();
    }

    public class AsnLine
    {
        public string AsnNo { get; set; } = null!;
        public int LineNo { get; set; }
        public string? PoNo { get; set; }
        public string? Item { get; set; }
        public string? Description { get; set; }
        public string? Rev { get; set; }
        public decimal? PoPend { get; set; }
        public decimal? SupDcQty { get; set; }
        public string? Uom { get; set; }
        public string? Job { get; set; }
        public string? Oper { get; set; }
        public string? Osp { get; set; }
        public string? Type { get; set; }
        public string? Org { get; set; }
        public int? PoLine { get; set; }
        public int? PoHead { get; set; }
        public int? LocationId { get; set; }
        public decimal? PoQty { get; set; }
        public string? RateCat { get; set; }
        public string? PoType { get; set; }
        public string? Tariff { get; set; }
        public int? WipEntityId { get; set; }
        public string? OpnSeq { get; set; }
    }
}
