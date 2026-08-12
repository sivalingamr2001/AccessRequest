# Reconstructed Database Data Model

This document outlines the database schema reconstructed from SQL query references, mapping key tables, fields, relationships, and access operations.

## 1. Oracle Core Tables

### Table: JAN_GATE_HEADER
- **Description**: Stores primary gate entry log records.
- **Inferred Primary Key**: `GATE_NO` (Integer, generated via sequence `jan_GATE_NO_SEQ.NEXTVAL`)
- **Key Columns Reference in Code**:
  - `GATE_NO`, `GDATE`, `SUPPLIER_NAME`, `DC_NO`, `DC_DATE`, `VEHICLE_DET`, `INV_CATEGORY`, `VALIDATED`, `VALIDATED_BY`, `UNIT`, `ORG`, `VENDOR_ID`, `INVOICE_VAL`, `EINV_FLAG`, `EWAY_NO`
- **CRUD Operations**: SELECT (Gate.vb, Validate.vb), INSERT (Add.vb, non-po.vb), UPDATE (Add.vb, Validate.vb), DELETE (Gate.vb)
- **Relationships**: Parent of `JAN_GATE_LINES` via `GATE_NO`.

### Table: JAN_GATE_LINES
- **Description**: Stores individual itemized gate lines matching delivery challans.
- **Inferred Primary Key**: `GATE_NO` + `LINE_NO`
- **Key Columns**:
  - `GATE_NO`, `LINE_NO`, `ITEM`, `SUPDCQTY`, `LOT_NO`, `ORG_ID`, `PONO`, `POLINE`, `LOCATION_ID`, `VALIDATED`, `FLAG`
- **CRUD Operations**: SELECT, INSERT, UPDATE, DELETE (Add.vb, Validate.vb, gate_lot_print.vb)
- **Relationships**: Child of `JAN_GATE_HEADER` via `GATE_NO`.

### Table: JAN_GATE_NVAL_REASON
- **Description**: Records validation reasons, audit remarks, and supervisor override approvals.
- **Key Columns**:
  - `GATE_NO`, `LINE_NO`, `REA_CODE`, `REA_NAME`, `REA_REMARK`, `REA_DT`, `REA_SEL`, `UNIT`, `UNAME`, `ACTION`, `ACTION_REMARK`, `ACTION_DT`
- **CRUD Operations**: SELECT, INSERT, UPDATE (Validate.vb)

---

## 2. Oracle ERP Integration Tables (Read-Only references)
- **PO_HEADERS_ALL**: Oracle Purchasing Headers. (Joined via `PO_HEADER_ID` to match vendor/supplier data).
- **PO_VENDORS**: Supplier master details. (Used in `Login.vb` and `Add.vb` to fetch vendor list).
- **PO_VENDOR_SITES_ALL**: Supplier location addresses.
- **RCV_SHIPMENT_HEADERS**: Oracle Receipt records. (Joined to verify if a receipt was created for a gate entry).
- **GL_CODE_COMBINATIONS**: General Ledger account mapping.

---

## 3. SQL Server external tables (Supplier Portal)
- **jan_gate_header** (SQL Server `scm` database): Shared supplier table to record submitted ASN/ADI details.
- **jan_gate_lines** (SQL Server `scm` database): Shared supplier table for ASN line items.
- **JAN_PO_BLOCK_IP**: Records administrative computer IPs blocked from operating if there are validation backlogs.