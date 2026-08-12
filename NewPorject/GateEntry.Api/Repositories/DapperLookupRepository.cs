using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using GateEntry.Api.Models;

namespace GateEntry.Api.Repositories
{
    public class DapperLookupRepository : ILookupRepository
    {
        private readonly DbConnectionFactory _connectionFactory;

        public DapperLookupRepository(DbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<IEnumerable<SupplierLookupDto>> GetSuppliersAsync()
        {
            using var connection = _connectionFactory.CreateOracleConnection();
            const string sql = @"
                SELECT vendor_id AS VendorId, REPLACE(vendor_name, '''', '''''') AS SupplierName 
                FROM po_vendors 
                WHERE vendor_type_lookup_code <> 'EMPLOYEE' 
                ORDER BY vendor_name";
            return await connection.QueryAsync<SupplierLookupDto>(sql);
        }

        public async Task<IEnumerable<SupplierSiteLookupDto>> GetSupplierSitesAsync(int vendorId)
        {
            using var connection = _connectionFactory.CreateOracleConnection();
            const string sql = @"
                SELECT vendor_site_code AS VendorSiteCode 
                FROM po_vendor_sites_all 
                WHERE vendor_id = :VendorId AND inactive_date IS NULL";
            return await connection.QueryAsync<SupplierSiteLookupDto>(sql, new { VendorId = vendorId });
        }

        public async Task<IEnumerable<OrgLookupDto>> GetOrganizationsAsync(string orgIdList)
        {
            using var connection = _connectionFactory.CreateOracleConnection();
            
            // Clean up the comma separated list
            var ids = orgIdList.Split(',')
                               .Select(s => s.Trim())
                               .Where(s => int.TryParse(s, out _))
                               .Select(int.Parse)
                               .ToList();

            if (!ids.Any()) return Enumerable.Empty<OrgLookupDto>();

            const string sql = @"
                SELECT organization_id AS OrganizationId, organization_code AS OrganizationCode 
                FROM org_organization_definitions 
                WHERE organization_id IN :Ids 
                ORDER BY organization_code";

            return await connection.QueryAsync<OrgLookupDto>(sql, new { Ids = ids });
        }

        public async Task<IEnumerable<CourierLookupDto>> GetCouriersAsync()
        {
            using var connection = _connectionFactory.CreateOracleConnection();
            const string sql = "SELECT courier_id AS CourierId, courier_name AS CourierName FROM jan_gate_courier ORDER BY courier_name";
            return await connection.QueryAsync<CourierLookupDto>(sql);
        }

        public async Task<IEnumerable<ReasonLookupDto>> GetReasonsAsync()
        {
            using var connection = _connectionFactory.CreateOracleConnection();
            const string sql = "SELECT rea_code AS ReaCode, rea_name AS ReaName FROM jan_gate_reason WHERE live_flag = 'Y' ORDER BY rea_code";
            return await connection.QueryAsync<ReasonLookupDto>(sql);
        }

        public async Task<IEnumerable<CategoryLookupDto>> GetCategoriesAsync()
        {
            using var connection = _connectionFactory.CreateOracleConnection();
            const string sql = "SELECT description FROM jan_open_challan_category WHERE cat_for_gate = 1 and live_flag = 1";
            var result = await connection.QueryAsync<string>(sql);
            
            int id = 1;
            return result.Select(desc => new CategoryLookupDto { CatId = id++, Description = desc });
        }

        public async Task<IEnumerable<ItemLookupDto>> GetItemsAsync(int vendorId)
        {
            using var connection = _connectionFactory.CreateOracleConnection();
            const string sql = @"
                SELECT DISTINCT item AS ItemCode, description AS Description 
                FROM jan_po_pending_bought_outs 
                WHERE vendor_id = :VendorId 
                ORDER BY item";
            return await connection.QueryAsync<ItemLookupDto>(sql, new { VendorId = vendorId });
        }

        public async Task<IEnumerable<PoPendingDto>> GetPoPendingLinesAsync(int vendorId, string? itemCode)
        {
            using var connection = _connectionFactory.CreateOracleConnection();
            string sql = @"
                SELECT 
                    pono AS PoNo, poline AS PoLine, pohead AS PoHeaderId, 
                    nvl(po_qty - recd, 0) AS PendingQty, item AS ItemCode, 
                    description AS Description, uom AS Uom 
                FROM jan_po_pending_bought_outs 
                WHERE vendor_id = :VendorId";

            var parameters = new DynamicParameters();
            parameters.Add("VendorId", vendorId);

            if (!string.IsNullOrEmpty(itemCode))
            {
                sql += " AND item = :ItemCode";
                parameters.Add("ItemCode", itemCode);
            }

            return await connection.QueryAsync<PoPendingDto>(sql, parameters);
        }
    }
}
