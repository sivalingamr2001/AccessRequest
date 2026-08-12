using System;

namespace GateEntry.Api.Models
{
    public class GateLine
    {
        public int LineNo { get; set; }
        public int GateNo { get; set; }
        public string? GateId { get; set; }
        public string? PoNo { get; set; }
        public DateTime? PoDt { get; set; }
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
        public string? Remark { get; set; }
        public int? Status { get; set; }
        public int Validated { get; set; }
        public string? Org { get; set; }
        public string? Flag { get; set; }
        public int? PoLine { get; set; }
        public int? PoHead { get; set; }
        public int? LocationId { get; set; }
        public decimal? PoQty { get; set; }
        public decimal? ActVal { get; set; }
        public string? RateCat { get; set; }
        public string? PoType { get; set; }
        public string? Tariff { get; set; }
        public int? WipEntityId { get; set; }
        public string? OpnSeq { get; set; }
        public string? SpotInspection { get; set; }
        public string? SelfCertify { get; set; }
    }
}
