using System;

namespace GateEntry.Api.Models
{
    public class ValidationReason
    {
        public int GateNo { get; set; }
        public int? LineNo { get; set; }
        public int? ReaCode { get; set; }
        public string? ReaName { get; set; }
        public string? ReaRemark { get; set; }
        public DateTime? ReaDt { get; set; }
        public string? ReaSel { get; set; }
        public string? Unit { get; set; }
        public string? UName { get; set; }
        public string? Action { get; set; }
        public string? ActionRemark { get; set; }
        public DateTime? ActionDt { get; set; }
    }
}
