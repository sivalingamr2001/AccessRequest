using System.Collections.Generic;
using System.Threading.Tasks;
using GateEntry.Api.Models;

namespace GateEntry.Api.Repositories
{
    public interface ILookupRepository
    {
        Task<IEnumerable<SupplierLookupDto>> GetSuppliersAsync();
        Task<IEnumerable<SupplierSiteLookupDto>> GetSupplierSitesAsync(int vendorId);
        Task<IEnumerable<OrgLookupDto>> GetOrganizationsAsync(string orgIdList);
        Task<IEnumerable<CourierLookupDto>> GetCouriersAsync();
        Task<IEnumerable<ReasonLookupDto>> GetReasonsAsync();
        Task<IEnumerable<CategoryLookupDto>> GetCategoriesAsync();
        Task<IEnumerable<ItemLookupDto>> GetItemsAsync(int vendorId);
        Task<IEnumerable<PoPendingDto>> GetPoPendingLinesAsync(int vendorId, string? itemCode);
    }
}
