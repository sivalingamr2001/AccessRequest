using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using GateEntry.Api.Models;

namespace GateEntry.Api.Repositories
{
    public class DapperAsnRepository : IAsnRepository
    {
        private readonly DbConnectionFactory _connectionFactory;

        public DapperAsnRepository(DbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<AsnHeader?> GetAsnDetailsAsync(string asnNo)
        {
            using var connection = _connectionFactory.CreateSqlServerConnection();
            
            const string headerSql = @"
                SELECT 
                    asn_no AS AsnNo, asn_date AS AsnDate, supplier_name AS SupplierName, 
                    dc_no AS DcNo, dc_date AS DcDate, invoice_val AS InvoiceVal, 
                    asn_type AS AsnType, vehicle_det AS VehicleDet, courier_name AS CourierName, 
                    pod_no AS PodNo, no_of_box AS NoOfBox, po_wt AS PoWt, rec_wt AS RecWt, 
                    delasn AS DelAsn, gate_no AS GateNo
                FROM jan_gate_header 
                WHERE asn_no = @AsnNo";

            var header = await connection.QueryFirstOrDefaultAsync<AsnHeader>(headerSql, new { AsnNo = asnNo });
            if (header == null) return null;

            const string linesSql = @"
                SELECT 
                    asn_no AS AsnNo, line_no AS LineNo, pono AS PoNo, item AS Item, 
                    description AS Description, rev AS Rev, popend AS PoPend, 
                    supdcqty AS SupDcQty, uom AS Uom, job AS Job, oper AS Oper, 
                    osp AS Osp, type AS Type, org AS Org, poline AS PoLine, 
                    pohead AS PoHead, location_id AS LocationId, poqty AS PoQty, 
                    ratecat AS RateCat, potype AS PoType, tariff AS Tariff, 
                    wip_entity_id AS WipEntityId, opn_seq AS OpnSeq
                FROM jan_gate_lines 
                WHERE asn_no = @AsnNo 
                ORDER BY line_no";

            var lines = await connection.QueryAsync<AsnLine>(linesSql, new { AsnNo = asnNo });
            header.Lines = lines.ToList();

            return header;
        }

        public async Task<bool> LinkGateToAsnAsync(string asnNo, int gateNo)
        {
            using var connection = _connectionFactory.CreateSqlServerConnection();
            const string sql = "UPDATE jan_gate_header SET gate_no = @GateNo WHERE asn_no = @AsnNo";
            int rows = await connection.ExecuteAsync(sql, new { GateNo = gateNo, AsnNo = asnNo });
            return rows > 0;
        }

        public async Task<bool> CheckAsnNoExistsAsync(string asnNo)
        {
            using var connection = _connectionFactory.CreateSqlServerConnection();
            const string sql = "SELECT COUNT(*) FROM jan_gate_header WHERE asn_no = @AsnNo";
            int count = await connection.ExecuteScalarAsync<int>(sql, new { AsnNo = asnNo });
            return count > 0;
        }
    }
}
