using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GateEntry.Api.Models;

namespace GateEntry.Api.Repositories
{
    public class MockLookupRepository : ILookupRepository
    {
        private static readonly List<SupplierLookupDto> MockSuppliers = new()
        {
            new SupplierLookupDto { VendorId = 5001, SupplierName = "Tata Steel Ltd" },
            new SupplierLookupDto { VendorId = 5002, SupplierName = "Apex Fasteners" },
            new SupplierLookupDto { VendorId = 5003, SupplierName = "Interstate Packers" },
            new SupplierLookupDto { VendorId = 5004, SupplierName = "Bosch Electricals" }
        };

        private static readonly List<CourierLookupDto> MockCouriers = new()
        {
            new CourierLookupDto { CourierId = 1, CourierName = "BlueDart" },
            new CourierLookupDto { CourierId = 2, CourierName = "DTDC" },
            new CourierLookupDto { CourierId = 3, CourierName = "DHL Express" },
            new CourierLookupDto { CourierId = 4, CourierName = "Professional Couriers" }
        };

        private static readonly List<ReasonLookupDto> MockReasons = new()
        {
            new ReasonLookupDto { ReaCode = 42, ReaName = "DC Value Discrepancy", ReaRemark = "DC Value does not match system PO value" },
            new ReasonLookupDto { ReaCode = 43, ReaName = "Damaged Shipment Box", ReaRemark = "Physical box damaged during transport" },
            new ReasonLookupDto { ReaCode = 44, ReaName = "Quantity Shortage", ReaRemark = "Delivered quantity is less than PO quantity" },
            new ReasonLookupDto { ReaCode = 45, ReaName = "E-way Bill Missing", ReaRemark = "E-way bill number required but not provided" },
            new ReasonLookupDto { ReaCode = 46, ReaName = "Incorrect Item Part Number", ReaRemark = "Supplier shipped incorrect item number" },
            new ReasonLookupDto { ReaCode = 999, ReaName = "Administrative Cancel", ReaRemark = "Gate entry cancelled by admin/operator request" }
        };

        private static readonly List<CategoryLookupDto> MockCategories = new()
        {
            new CategoryLookupDto { CatId = 1, Description = "Bought Outs" },
            new CategoryLookupDto { CatId = 2, Description = "Sub-Contract" },
            new CategoryLookupDto { CatId = 3, Description = "Consumables" },
            new CategoryLookupDto { CatId = 4, Description = "Raw Material" }
        };

        public Task<IEnumerable<SupplierLookupDto>> GetSuppliersAsync()
        {
            return Task.FromResult(MockSuppliers.AsEnumerable());
        }

        public Task<IEnumerable<SupplierSiteLookupDto>> GetSupplierSitesAsync(int vendorId)
        {
            var sites = new List<SupplierSiteLookupDto>();
            if (vendorId == 5001)
                sites.Add(new SupplierSiteLookupDto { VendorSiteCode = "MUMBAI-UNIT" });
            else if (vendorId == 5002)
                sites.Add(new SupplierSiteLookupDto { VendorSiteCode = "CHENNAI-UNIT" });
            else if (vendorId == 5003)
                sites.Add(new SupplierSiteLookupDto { VendorSiteCode = "BANGALORE-UNIT" });
            else
                sites.Add(new SupplierSiteLookupDto { VendorSiteCode = "HEAD-OFFICE" });

            return Task.FromResult(sites.AsEnumerable());
        }

        public Task<IEnumerable<OrgLookupDto>> GetOrganizationsAsync(string orgIdList)
        {
            var orgs = new List<OrgLookupDto>
            {
                new OrgLookupDto { OrganizationId = 444, OrganizationCode = "UNIT7" },
                new OrgLookupDto { OrganizationId = 445, OrganizationCode = "UNIT2" },
                new OrgLookupDto { OrganizationId = 446, OrganizationCode = "JAPL" }
            };
            return Task.FromResult(orgs.AsEnumerable());
        }

        public Task<IEnumerable<CourierLookupDto>> GetCouriersAsync()
        {
            return Task.FromResult(MockCouriers.AsEnumerable());
        }

        public Task<IEnumerable<ReasonLookupDto>> GetReasonsAsync()
        {
            return Task.FromResult(MockReasons.AsEnumerable());
        }

        public Task<IEnumerable<CategoryLookupDto>> GetCategoriesAsync()
        {
            return Task.FromResult(MockCategories.AsEnumerable());
        }

        public Task<IEnumerable<ItemLookupDto>> GetItemsAsync(int vendorId)
        {
            var items = new List<ItemLookupDto>();
            if (vendorId == 5001)
            {
                items.Add(new ItemLookupDto { ItemCode = "ITEM-MS-PLATES", Description = "Mild Steel Plates 10mm" });
                items.Add(new ItemLookupDto { ItemCode = "ITEM-AL-BARS", Description = "Aluminum Round Bars 50mm" });
            }
            else if (vendorId == 5002)
            {
                items.Add(new ItemLookupDto { ItemCode = "ITEM-FASTENER-M8", Description = "Fasteners Hex Head M8" });
            }
            else
            {
                items.Add(new ItemLookupDto { ItemCode = "ITEM-OSP-CHALLAN", Description = "Heat Treatment OSP Outward Service" });
            }

            return Task.FromResult(items.AsEnumerable());
        }

        public Task<IEnumerable<PoPendingDto>> GetPoPendingLinesAsync(int vendorId, string? itemCode)
        {
            var lines = new List<PoPendingDto>
            {
                new PoPendingDto
                {
                    PoNo = "PO-45000123",
                    PoLine = 1,
                    PoHeaderId = 12001,
                    PendingQty = 50.0m,
                    ItemCode = "ITEM-MS-PLATES",
                    Description = "Mild Steel Plates 10mm",
                    Uom = "PCS"
                },
                new PoPendingDto
                {
                    PoNo = "PO-45000123",
                    PoLine = 2,
                    PoHeaderId = 12001,
                    PendingQty = 100.0m,
                    ItemCode = "ITEM-AL-BARS",
                    Description = "Aluminum Round Bars 50mm",
                    Uom = "PCS"
                },
                new PoPendingDto
                {
                    PoNo = "PO-45000456",
                    PoLine = 1,
                    PoHeaderId = 12002,
                    PendingQty = 1000.0m,
                    ItemCode = "ITEM-FASTENER-M8",
                    Description = "Fasteners Hex Head M8",
                    Uom = "PCS"
                },
                new PoPendingDto
                {
                    PoNo = "OSP-32000099",
                    PoLine = 1,
                    PoHeaderId = 12003,
                    PendingQty = 5.0m,
                    ItemCode = "ITEM-OSP-CHALLAN",
                    Description = "Heat Treatment OSP Outward Service",
                    Uom = "LOT"
                }
            };

            var query = lines.AsEnumerable();
            if (!string.IsNullOrEmpty(itemCode))
            {
                query = query.Where(l => l.ItemCode == itemCode);
            }

            return Task.FromResult(query.ToList().AsEnumerable());
        }
    }
}
