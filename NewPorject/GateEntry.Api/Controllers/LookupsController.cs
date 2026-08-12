using System.Threading.Tasks;
using GateEntry.Api.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace GateEntry.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LookupsController : ControllerBase
    {
        private readonly ILookupRepository _lookupRepository;

        public LookupsController(ILookupRepository lookupRepository)
        {
            _lookupRepository = lookupRepository;
        }

        [HttpGet("suppliers")]
        public async Task<IActionResult> GetSuppliers()
        {
            var suppliers = await _lookupRepository.GetSuppliersAsync();
            return Ok(suppliers);
        }

        [HttpGet("supplier-sites/{vendorId}")]
        public async Task<IActionResult> GetSupplierSites(int vendorId)
        {
            var sites = await _lookupRepository.GetSupplierSitesAsync(vendorId);
            return Ok(sites);
        }

        [HttpGet("organizations")]
        public async Task<IActionResult> GetOrganizations([FromQuery] string orgIdList)
        {
            if (string.IsNullOrWhiteSpace(orgIdList))
            {
                return BadRequest("orgIdList query parameter is required (comma-separated list of IDs)");
            }
            var orgs = await _lookupRepository.GetOrganizationsAsync(orgIdList);
            return Ok(orgs);
        }

        [HttpGet("couriers")]
        public async Task<IActionResult> GetCouriers()
        {
            var couriers = await _lookupRepository.GetCouriersAsync();
            return Ok(couriers);
        }

        [HttpGet("reasons")]
        public async Task<IActionResult> GetReasons()
        {
            var reasons = await _lookupRepository.GetReasonsAsync();
            return Ok(reasons);
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _lookupRepository.GetCategoriesAsync();
            return Ok(categories);
        }

        [HttpGet("items/{vendorId}")]
        public async Task<IActionResult> GetItems(int vendorId)
        {
            var items = await _lookupRepository.GetItemsAsync(vendorId);
            return Ok(items);
        }

        [HttpGet("po-pending/{vendorId}")]
        public async Task<IActionResult> GetPoPending(int vendorId, [FromQuery] string? itemCode)
        {
            var pendingPos = await _lookupRepository.GetPoPendingLinesAsync(vendorId, itemCode);
            return Ok(pendingPos);
        }
    }
}
