using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using GateEntry.Api.Models;

namespace GateEntry.Api.Repositories
{
    public class DapperGateRepository : IGateRepository
    {
        private readonly DbConnectionFactory _connectionFactory;

        public DapperGateRepository(DbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<IEnumerable<GateHeader>> GetGateEntriesAsync(DateTime? fromDate, DateTime? toDate, string? unit, string? supplierName)
        {
            using var connection = _connectionFactory.CreateOracleConnection();
            string sql = @"
                SELECT 
                    gate_no AS GateNo, gdate AS GDate, supplier_name AS SupplierName, 
                    supplier_site AS SupplierSite, dc_no AS DcNo, dc_date AS DcDate, 
                    vehicle_det AS VehicleDet, validated AS Validated, unit AS Unit, 
                    org AS Org, vendor_id AS VendorId, invoice_val AS InvoiceVal, 
                    eway_no AS EwayNo, validated_by AS ValidatedBy, courier_name AS CourierName,
                    pod_no AS PodNo, no_of_box AS NoOfBox, po_wt AS PoWt, rec_wt AS RecWt
                FROM jan_gate_header 
                WHERE 1=1";

            var parameters = new DynamicParameters();

            if (fromDate.HasValue)
            {
                sql += " AND gdate >= :FromDate";
                parameters.Add("FromDate", fromDate.Value.Date);
            }
            if (toDate.HasValue)
            {
                sql += " AND gdate <= :ToDate";
                parameters.Add("ToDate", toDate.Value.Date.AddDays(1).AddSeconds(-1));
            }
            if (!string.IsNullOrEmpty(unit))
            {
                sql += " AND unit = :Unit";
                parameters.Add("Unit", unit);
            }
            if (!string.IsNullOrEmpty(supplierName))
            {
                sql += " AND supplier_name LIKE :SupplierName";
                parameters.Add("SupplierName", $"%{supplierName}%");
            }

            sql += " ORDER BY gate_no DESC";

            return await connection.QueryAsync<GateHeader>(sql, parameters);
        }

        public async Task<GateHeader?> GetGateHeaderAsync(int gateNo)
        {
            using var connection = _connectionFactory.CreateOracleConnection();
            const string sql = "SELECT * FROM jan_gate_header WHERE gate_no = :GateNo";
            return await connection.QueryFirstOrDefaultAsync<GateHeader>(sql, new { GateNo = gateNo });
        }

        public async Task<IEnumerable<GateLine>> GetGateLinesAsync(int gateNo)
        {
            using var connection = _connectionFactory.CreateOracleConnection();
            const string sql = "SELECT * FROM jan_gate_lines WHERE gate_no = :GateNo ORDER BY line_no";
            return await connection.QueryAsync<GateLine>(sql, new { GateNo = gateNo });
        }

        public async Task<int> CreateGateEntryAsync(GateHeader header, IEnumerable<GateLine> lines)
        {
            using var connection = _connectionFactory.CreateOracleConnection();
            if (connection.State == ConnectionState.Closed) connection.Open();
            using var transaction = connection.BeginTransaction();

            try
            {
                // 1. Get next sequence number
                const string seqSql = "SELECT jan_GATE_NO_SEQ.NEXTVAL FROM DUAL";
                int gateNo = await connection.ExecuteScalarAsync<int>(seqSql, transaction: transaction);
                header.GateNo = gateNo;

                // 2. Insert Header
                const string insertHeaderSql = @"
                    INSERT INTO jan_gate_header (
                        gate_no, gate_id, supplier_name, supplier_site, dc_no, dc_date, 
                        validated, gtype, gdate, vehicle_det, courier_name, pod_no, 
                        no_of_box, po_wt, rec_wt, rec_wt_dt, unit, flag, adi_no, 
                        adi_date, invoice_val, xerox, vendor_id, adi_via, adi_type, 
                        direct_dlyd_flag, adi_reason, org
                    ) VALUES (
                        :GateNo, :GateNo, :SupplierName, :SupplierSite, :DcNo, :DcDate, 
                        :Validated, :GType, :GDate, :VehicleDet, :CourierName, :PodNo, 
                        :NoOfBox, :PoWt, :RecWt, :RecWtDt, :Unit, :Flag, :AdiNo, 
                        :AdiDate, :InvoiceVal, :Xerox, :VendorId, :AdiVia, :AdiType, 
                        :DirectDlydFlag, :AdiReason, :Org
                    )";

                await connection.ExecuteAsync(insertHeaderSql, header, transaction: transaction);

                // 3. Insert Lines
                const string insertLineSql = @"
                    INSERT INTO jan_gate_lines (
                        line_no, gate_no, gate_id, pono, podt, item, description, 
                        rev, popend, supdcqty, uom, job, oper, osp, type, remark, 
                        status, validated, org, flag, poline, pohead, location_id, 
                        poqty, actval, ratecat, potype, tariff, wip_entity_id, 
                        opn_seq, spot_inspection, self_certify
                    ) VALUES (
                        :LineNo, :GateNo, :GateNo, :PoNo, :PoDt, :Item, :Description, 
                        :Rev, :PoPend, :SupDcQty, :Uom, :Job, :Oper, :Osp, :Type, :Remark, 
                        :Status, :Validated, :Org, :Flag, :PoLine, :PoHead, :LocationId, 
                        :PoQty, :ActVal, :RateCat, :PoType, :Tariff, :WipEntityId, 
                        :OpnSeq, :SpotInspection, :SelfCertify
                    )";

                int lineNo = 1;
                foreach (var line in lines)
                {
                    line.GateNo = gateNo;
                    line.LineNo = lineNo++;
                    await connection.ExecuteAsync(insertLineSql, line, transaction: transaction);
                }

                // 4. FIFO Lot Generator Logic (replicated from legacy VB.NET query mapping)
                const string cleanFifoSql = "DELETE FROM jan_fifo_lotno_details WHERE ref_id = :GateNo";
                await connection.ExecuteAsync(cleanFifoSql, new { GateNo = gateNo }, transaction: transaction);

                const string insertFifoSql = @"
                    INSERT INTO jan_fifo_lotno_details (org_id, item_id, item, ref_id, trans_type, lot_no, qty, lot_dt)
                    SELECT 
                        org_id, item_id, item, gh.gate_no, 'Po', 
                        NVL(gl.LOT_NO, gl.item || '_' || TO_CHAR(gh.gdate, 'iyyyiwdhhmi')), 
                        SUM(supdcqty), SYSDATE
                    FROM jan_gate_lines gl
                    JOIN jan_gate_header gh ON gl.gate_no = gh.gate_no
                    WHERE gh.gate_no = :GateNo
                    GROUP BY org_id, item_id, item, gh.gate_no, NVL(gl.LOT_NO, gl.item || '_' || TO_CHAR(gh.gdate, 'iyyyiwdhhmi'))";

                await connection.ExecuteAsync(insertFifoSql, new { GateNo = gateNo }, transaction: transaction);

                transaction.Commit();
                return gateNo;
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        public async Task<bool> UpdateGateEntryAsync(int gateNo, GateHeader header, IEnumerable<GateLine> lines)
        {
            using var connection = _connectionFactory.CreateOracleConnection();
            if (connection.State == ConnectionState.Closed) connection.Open();
            using var transaction = connection.BeginTransaction();

            try
            {
                header.GateNo = gateNo;

                // 1. Update Header
                const string updateHeaderSql = @"
                    UPDATE jan_gate_header SET 
                        supplier_name = :SupplierName, supplier_site = :SupplierSite, 
                        dc_no = :DcNo, dc_date = :DcDate, vehicle_det = :VehicleDet, 
                        courier_name = :CourierName, pod_no = :PodNo, no_of_box = :NoOfBox, 
                        po_wt = :PoWt, rec_wt = :RecWt, rec_wt_dt = :RecWtDt, 
                        unit = :Unit, flag = :Flag, adi_no = :AdiNo, adi_date = :AdiDate, 
                        invoice_val = :InvoiceVal, xerox = :Xerox, vendor_id = :VendorId, 
                        adi_via = :AdiVia, adi_type = :AdiType, direct_dlyd_flag = :DirectDlydFlag, 
                        adi_reason = :AdiReason, org = :Org
                    WHERE gate_no = :GateNo";

                await connection.ExecuteAsync(updateHeaderSql, header, transaction: transaction);

                // 2. Delete Existing Lines
                const string deleteLinesSql = "DELETE FROM jan_gate_lines WHERE gate_no = :GateNo";
                await connection.ExecuteAsync(deleteLinesSql, new { GateNo = gateNo }, transaction: transaction);

                // 3. Insert New Lines
                const string insertLineSql = @"
                    INSERT INTO jan_gate_lines (
                        line_no, gate_no, gate_id, pono, podt, item, description, 
                        rev, popend, supdcqty, uom, job, oper, osp, type, remark, 
                        status, validated, org, flag, poline, pohead, location_id, 
                        poqty, actval, ratecat, potype, tariff, wip_entity_id, 
                        opn_seq, spot_inspection, self_certify
                    ) VALUES (
                        :LineNo, :GateNo, :GateNo, :PoNo, :PoDt, :Item, :Description, 
                        :Rev, :PoPend, :SupDcQty, :Uom, :Job, :Oper, :Osp, :Type, :Remark, 
                        :Status, :Validated, :Org, :Flag, :PoLine, :PoHead, :LocationId, 
                        :PoQty, :ActVal, :RateCat, :PoType, :Tariff, :WipEntityId, 
                        :OpnSeq, :SpotInspection, :SelfCertify
                    )";

                int lineNo = 1;
                foreach (var line in lines)
                {
                    line.GateNo = gateNo;
                    line.LineNo = lineNo++;
                    await connection.ExecuteAsync(insertLineSql, line, transaction: transaction);
                }

                // 4. Refresh FIFO Details
                const string cleanFifoSql = "DELETE FROM jan_fifo_lotno_details WHERE ref_id = :GateNo";
                await connection.ExecuteAsync(cleanFifoSql, new { GateNo = gateNo }, transaction: transaction);

                const string insertFifoSql = @"
                    INSERT INTO jan_fifo_lotno_details (org_id, item_id, item, ref_id, trans_type, lot_no, qty, lot_dt)
                    SELECT 
                        org_id, item_id, item, gh.gate_no, 'Po', 
                        NVL(gl.LOT_NO, gl.item || '_' || TO_CHAR(gh.gdate, 'iyyyiwdhhmi')), 
                        SUM(supdcqty), SYSDATE
                    FROM jan_gate_lines gl
                    JOIN jan_gate_header gh ON gl.gate_no = gh.gate_no
                    WHERE gh.gate_no = :GateNo
                    GROUP BY org_id, item_id, item, gh.gate_no, NVL(gl.LOT_NO, gl.item || '_' || TO_CHAR(gh.gdate, 'iyyyiwdhhmi'))";

                await connection.ExecuteAsync(insertFifoSql, new { GateNo = gateNo }, transaction: transaction);

                transaction.Commit();
                return true;
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        public async Task<bool> DeleteGateEntryAsync(int gateNo, string reason, string actionRemark, string username)
        {
            using var connection = _connectionFactory.CreateOracleConnection();
            if (connection.State == ConnectionState.Closed) connection.Open();
            using var transaction = connection.BeginTransaction();

            try
            {
                // 1. Logically delete by setting validated = 4 (Cancelled / RTV status)
                const string updateSql = "UPDATE jan_gate_header SET validated = 4, reason = :Reason, rearef = :ActionRemark WHERE gate_no = :GateNo";
                int rows = await connection.ExecuteAsync(updateSql, new { GateNo = gateNo, Reason = reason, ActionRemark = actionRemark }, transaction: transaction);

                // 2. Insert audit logging reason
                const string insertReasonSql = @"
                    INSERT INTO jan_gate_nval_reason (
                        gate_no, rea_remark, flag, gdate, uname, rea_code, reason_date, rea_name
                    ) VALUES (
                        :GateNo, :ReaRemark, '4', SYSDATE, :Username, 999, SYSDATE, :ReaName
                    )";

                await connection.ExecuteAsync(insertReasonSql, new {
                    GateNo = gateNo,
                    ReaRemark = actionRemark,
                    Username = username,
                    ReaName = reason
                }, transaction: transaction);

                // 3. Mark lines as validated = 4 (to stop from being validated again)
                const string updateLinesSql = "UPDATE jan_gate_lines SET validated = 4 WHERE gate_no = :GateNo";
                await connection.ExecuteAsync(updateLinesSql, new { GateNo = gateNo }, transaction: transaction);

                transaction.Commit();
                return rows > 0;
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        public async Task<bool> UpdateValidationStatusAsync(int gateNo, int validatedStatus, string validatedBy, string? ewayBill)
        {
            using var connection = _connectionFactory.CreateOracleConnection();
            const string sql = "UPDATE jan_gate_header SET validated = :ValidatedStatus, validated_by = :ValidatedBy, eway_no = :EwayBill WHERE gate_no = :GateNo";
            int rows = await connection.ExecuteAsync(sql, new { GateNo = gateNo, ValidatedStatus = validatedStatus, ValidatedBy = validatedBy, EwayBill = ewayBill });
            return rows > 0;
        }

        public async Task<bool> SaveValidationReasonAsync(ValidationReason reason)
        {
            using var connection = _connectionFactory.CreateOracleConnection();
            const string sql = @"
                INSERT INTO jan_gate_nval_reason (
                    gate_no, line_no, rea_code, rea_name, rea_remark, rea_dt, 
                    rea_sel, unit, uname, action, action_remark, action_dt
                ) VALUES (
                    :GateNo, :LineNo, :ReaCode, :ReaName, :ReaRemark, SYSDATE, 
                    :ReaSel, :Unit, :UName, :Action, :ActionRemark, SYSDATE
                )";

            int rows = await connection.ExecuteAsync(sql, reason);
            return rows > 0;
        }

        public async Task<bool> CheckGateNoExistsAsync(int gateNo)
        {
            using var connection = _connectionFactory.CreateOracleConnection();
            const string sql = "SELECT COUNT(*) FROM jan_gate_header WHERE gate_no = :GateNo";
            int count = await connection.ExecuteScalarAsync<int>(sql, new { GateNo = gateNo });
            return count > 0;
        }

        public async Task<bool> CheckDcNoExistsForSupplierAsync(int vendorId, string dcNo)
        {
            using var connection = _connectionFactory.CreateOracleConnection();
            const string sql = "SELECT COUNT(*) FROM jan_gate_header WHERE vendor_id = :VendorId AND dc_no = :DcNo AND validated <> 4";
            int count = await connection.ExecuteScalarAsync<int>(sql, new { VendorId = vendorId, DcNo = dcNo });
            return count > 0;
        }

        public async Task<bool> CheckReceiptMadeAsync(int gateNo)
        {
            using var connection = _connectionFactory.CreateOracleConnection();
            const string sql = "SELECT COUNT(*) FROM rcv_shipment_headers WHERE packing_slip = TO_CHAR(:GateNo)";
            try
            {
                int count = await connection.ExecuteScalarAsync<int>(sql, new { GateNo = gateNo });
                return count > 0;
            }
            catch
            {
                return false;
            }
        }
    }
}
