namespace GateEntry.Api.Models
{
    public class SupplierLookupDto
    {
        public int VendorId { get; set; }
        public string? SupplierName { get; set; }
    }

    public class SupplierSiteLookupDto
    {
        public string? VendorSiteCode { get; set; }
    }

    public class OrgLookupDto
    {
        public int OrganizationId { get; set; }
        public string? OrganizationCode { get; set; }
    }

    public class CourierLookupDto
    {
        public int CourierId { get; set; }
        public string? CourierName { get; set; }
    }

    public class ReasonLookupDto
    {
        public int ReaCode { get; set; }
        public string? ReaName { get; set; }
        public string? ReaRemark { get; set; }
    }

    public class CategoryLookupDto
    {
        public int CatId { get; set; }
        public string? Description { get; set; }
    }

    public class ItemLookupDto
    {
        public string? ItemCode { get; set; }
        public string? Description { get; set; }
    }

    public class PoPendingDto
    {
        public string? PoNo { get; set; }
        public int PoLine { get; set; }
        public int PoHeaderId { get; set; }
        public decimal PendingQty { get; set; }
        public string? ItemCode { get; set; }
        public string? Description { get; set; }
        public string? Uom { get; set; }
    }
}
