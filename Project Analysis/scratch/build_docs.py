import json
import os
import re

scratch_dir = "/Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/scratch"
out_dir = "/Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c"

# Load summarized data
with open(os.path.join(scratch_dir, "form_summaries.json")) as f:
    summaries = json.load(f)

with open(os.path.join(scratch_dir, "query_summary_stats.json")) as f:
    query_stats = json.load(f)

# Sort summaries by name
summaries = sorted(summaries, key=lambda x: x["name"])

# ----------------------------------------------------
# 1. project-overview.md
# ----------------------------------------------------
def build_project_overview():
    md = """# Project Overview - Gate Entry Management System

This document provides a high-level architectural overview of the legacy VB.NET **Gate Entry Management System**, designed to manage the factory gate entry, material verification, and invoice processing.

## 1. Application Purpose
The application serves as a Gate Entry register and validation gatekeeper. It registers incoming delivery trucks, vendor deliveries, purchase orders (PO), outward processing challans (OSP), non-PO courier items, and direct delivery receipts. It validates delivery challans (DC), prints lot barcodes, checks for job shortages, processes daily End of Day (EOD) closures, and interfaces with accounts validation before materials are formally received in the Oracle ERP inventory.

## 2. Main Modules & Features
- **Security Login & Role-Based Routing**: Restricts application features depending on user roles (`GATE`, `UNIT7`, `VALID`, `INWARD`, `SKYFAST`, etc.).
- **Gate Register (Dashboard)**: Central search, status tracking, and navigation hub for gate entries.
- **Material Inward Gate Entry (Add/Edit)**: Main entry point for recording DC No, DC Date, Supplier Name, Courier details, Box count, PO/OSP references, and item weights.
- **Advance Shipping Notice / ADI Verification**: Connects to an external SQL Server database to pull supplier Advance Shipping Notices (ASN), validating them against Oracle pending deliveries.
- **Gate Validation / Approval**: Quality check and E-way bill validation before accounts posting.
- **Job Shortages Monitor (PO Block)**: Enforces entry validation for operators with pending shortages.
- **Barcode & Lot Printing**: Generates raw Zebra Programming Language (ZPL) commands and writes them to local batch files to print stickers via shared network printers.
- **End of Day (EOD) Close**: Handles EOD closure, Excel exports, and transaction synchronization.
- **Min-Max Inventory Control**: Tracks locator and min-max balance cards.

## 3. Technology Stack Discovered
- **Programming Language**: Visual Basic .NET (VB.NET)
- **Target Framework**: .NET Framework 4.8 (as per `Manufacture.vbproj` and `app.config`)
- **UI Engine**: Windows Forms (WinForms)
- **Primary Database**: Oracle Database (`prod` instance) via `System.Data.OracleClient`
- **Secondary Database**: Microsoft SQL Server (`scm` database on `13.235.195.146`) via `System.Data.SqlClient`
- **External Assemblies**:
  - `oracleclass.dll` (Custom data access library)
  - `Zen.Barcode.Core` (Barcode rendering)
  - `ZXing.Net` (Barcode detection and QR codes)
  - Microsoft Office Interop (Excel and Access automation)

## 4. Entry Points & Startup Flow
- **Startup Object**: `Manufacture.Login` (as defined in `Manufacture.vbproj`)
- **Login Load**: The `Login_Load` event hardcodes a default login (`userid = "UNIT7"`, `orgid = "444"`) and automatically triggers the login action on load, hiding itself and displaying the `Gate` dashboard as a modal dialog (`Gate.ShowDialog()`).
- **Dashboard Load (`Gate_Load`)**: Fetches permissions from `jan_gate_login` and restricts dashboard menu items, buttons, or checkboxes based on the active role (`c`).

## 5. Important Configuration Files
- **[app.config](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate%20Entry/app.config)**: Set up runtime configuration and binds logging traces to `FileLogWriter`. It targets `.NETFramework,Version=v4.8`.
- **[Manufacture.vbproj](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate%20Entry/Manufacture.vbproj)**: Defines source files, dependencies (`ZXing`, `Zen.Barcode`, `oracleclass`), COM references (`Excel`, `Dao`), and compilation parameters.

## 6. Database Connection Details
- **Oracle Connection (CON / CON1)**:
  `Data Source=prod;User Id=jan_it;Password=janapps;Integrated Security=no;`
- **SQL Server Connection (scmcon / scmcon2)**:
  `Data Source=13.235.195.146;Initial Catalog=scm;User ID=scm;Password=scm#$sql2007`

## 7. Hardcoded Paths, Credentials, & Endpoints
- **Credentials**: Hardcoded passwords for Oracle (`janapps`) and SQL Server (`scm#$sql2007`).
- **Endpoints/IPs**: Hardcoded SQL Server IP `13.235.195.146`.
- **File System Paths**:
  - `d:\\lotsticker.txt` (ZPL printer commands)
  - `d:\\lotprint.bat` (Direct copying to network printers)
  - `d:\\locprint.bat` (Location label copying)
  - `d:\\receipt\\rec_pend.HTML` (HTML reports)
  - `F:\\public\\adi_2.BAT` (Batch execution)
  - `c:\\ADI.EXE` (External Windows executable)
  - `c:\\gate\\gate.bat` (Local script execution)
  - `F:\\public\\Unclosed_adi.BAT` (Batch execution)
"""
    with open(os.path.join(out_dir, "project-overview.md"), "w") as f:
        f.write(md.strip())

# ----------------------------------------------------
# 2. screens.md
# ----------------------------------------------------
def build_screens():
    md = ["# Screens and Forms Documentation\n\nThis document catalogs all WinForms screens found in the VB.NET project, detailing controls, event handlers, navigation, database triggers, validations, and suggested React component representations.\n"]
    
    for s in summaries:
        name = s["name"]
        file_path = s["file_path"]
        
        # Deduce purpose
        purpose = "Unused / Blank Form Template" if s["handlers_count"] == 0 else f"Gate Entry feature screen handling {name} operations."
        if name == "Login":
            purpose = "Authentication screen with hardcoded defaults. Performs automatic routing to Gate Dashboard depending on roles."
        elif name == "Gate":
            purpose = "Main application dashboard. Provides data grids for entries, search filtering, and routes to all sub-features (Validation, Modifications, FIFO Lot creation, Reports)."
        elif name == "Add":
            purpose = "Core transactional gate entry screen. Enables recording DC values, item descriptions, box quantities, POs, OSPs, and manual ADI reasons."
        elif name == "Validate":
            purpose = "Verification gatekeeper. Validates gate lines, matching quantities against Oracle ERP records and running E-Invoice and E-way bill checks."
        elif name == "PO_BLOCK":
            purpose = "Administrative blocker utility. Checks for pending gate validations and prevents the operator from navigating away by using a timeout blocker."
        elif name == "fifo_sticker":
            purpose = "FIFO sticker printing screen. Generates and prints barcode lot details based on First-In-First-Out logic."
        
        md.append(f"## Screen: {name}")
        md.append(f"- **Source File**: [{os.path.basename(file_path)}](file://{os.path.join('/Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry', file_path)})")
        md.append(f"- **Purpose**: {purpose}")
        
        # UI controls
        md.append("### UI Controls & Components")
        if s["buttons"]:
            md.append(f"  - **Buttons**: `{', '.join(s['buttons'])}`")
        if s["textboxes"]:
            md.append(f"  - **Input Fields**: `{', '.join(s['textboxes'])}`")
        if s["combos"]:
            md.append(f"  - **Dropdown Selectors**: `{', '.join(s['combos'])}`")
        if s["grids"]:
            md.append(f"  - **Data Grids / Tables**: `{', '.join(s['grids'])}`")
        if s["checkboxes"]:
            md.append(f"  - **Checkboxes**: `{', '.join(s['checkboxes'])}`")
        if not (s["buttons"] or s["textboxes"] or s["combos"] or s["grids"] or s["checkboxes"]):
            md.append("  - No interactive controls found.")
            
        # Navigation
        if s["navigation_targets"]:
            md.append(f"- **Navigation**: Opens `{', '.join(s['navigation_targets'])}` modal screens.")
        else:
            md.append("- **Navigation**: Terminal window (no sub-screens opened).")
            
        # Database/API Triggers
        md.append("### Database Queries Triggered")
        if s["queries"]:
            for q in s["queries"][:6]: # limit to 6 for readability
                md.append(f"  - **[{q['method']} - Line {q['line']}]**: `{q['query'][:120]}...`")
            if len(s["queries"]) > 6:
                md.append(f"  - *({len(s['queries']) - 6} additional queries omitted for brevity. See [queries.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/queries.md) for full SQL list)*")
        else:
            md.append("  - No database queries executed on this screen.")
            
        # Validations
        md.append("### Screen-Level Validations")
        if s["validations"]:
            for v in s["validations"][:6]:
                cond = v["condition"] if v["condition"] else "Always Triggered / Try-Catch Block"
                md.append(f"  - **[{v['method']}]**: Condition `{cond}` triggers message alert `{v['raw_line'][:120]}...`")
        else:
            md.append("  - No formal validations or popup alert conditions captured on this screen.")
            
        # React suggestion
        react_name = name + "Page" if name in ["Gate", "Login"] else name + "Dialog"
        md.append(f"- **Suggested React Component**: `{react_name}` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).")
        md.append("\n---\n")
        
    with open(os.path.join(out_dir, "screens.md"), "w") as f:
        f.write("\n".join(md).strip())

# ----------------------------------------------------
# 3. business-rules.md
# ----------------------------------------------------
def build_business_rules():
    md = ["""# Business Rules and Conditions

This document compiles the core business logic, workflows, transitions, role-based checks, and UI rules discovered across the codebase.

## 1. System-Wide Workflows & Status Transitions

### Gate Entry Validation Flow
1. **Creation**: Gate entries are created via `Add.vb` or `non-po.vb` or ASN download via `adi.vb`.
2. **Validation Flag**: Toggled in Oracle table `JAN_GATE_HEADER` via field `VALIDATED`:
   - `VALIDATED = 0` -> Validated / Approved
   - `VALIDATED = 1` -> Created at Gate
   - `VALIDATED = 2` -> Validation Pending / Not Validated
   - `VALIDATED = 4` -> RTV (Return to Vendor) Entry
   - `VALIDATED = 5` -> Formally Validated by Supervisor
   - `VALIDATED = 6` -> Created without reference

### E-Invoice & E-way Bill Validation Rule
- **Source**: `Validate.vb` -> `BTNOK_Click`
- **Rule**: If a vendor is registered in `JAN_GATE_EINVOICE_VENDOR` (meaning they must provide e-invoices), the system verifies the invoice value from the Oracle record (`DCVAL` / `INVOICE_VAL`). If it is above 100,000 INR (derived from GST State check rules) and is an interstate purchase (checking Supplier GST vs local Org GST), the validator must enforce an E-way bill number entry. If missing, it blocks validation showing:
  - `"Tick E-invoice Supplier and proceed"`
  - `"Enter Supplier E-way bill No and proceed"`
  - `"Enter E-way Bill No and proceed"`

---

## 2. Dynamic UI Toggle Rules (Show / Hide / Enable / Disable)
"""]
    
    # Extract rules from form summaries
    for s in summaries:
        if s["rules"]:
            md.append(f"### Screen: {s['name']}")
            md.append(f"**Source File Path**: `Gate Entry/{s['name']}.vb`\n")
            for r in s["rules"]:
                md.append(f"- **Method/Event**: `{r['method']}`")
                md.append(f"  - **Rule/Condition**: `{r['raw_line']}`")
            md.append("")
            
    md.append("""---

## 3. Quantity and Date Calculations

### Quantity Checking Validation
- **Source**: `Add.vb` -> `addnew`
- **Condition**: `If dgv1.Rows(i).Cells(8).Value <> "" And txtdcno.Text <> "" And Convert.ToDecimal(dgv1.Rows(i).Cells(8).Value) > Convert.ToDecimal(dgv1.Rows(i).Cells(6).Value)`
- **Rule**: Incoming DC Quantity (`Cells(8)`) cannot be greater than the Pending PO Quantity (`Cells(6)`). If it exceeds it, block saving and display: `"DcQty Greater Then Po Pend"`.

### Received Weight Check (POD)
- **Source**: `Validate.vb` -> `BTNOK_Click`
- **Condition**: `select count(*) from jan_gate_header where gate_no = ... and po_wt is not null and rec_wt is null`
- **Rule**: If a gate entry represents a POD delivery with a pre-recorded PO weight, the supervisor cannot validate it unless the actual received weight has been entered. If missing, displays: `"Received Weight not entered for POD"`.
""")
    
    with open(os.path.join(out_dir, "business-rules.md"), "w") as f:
        f.write("\n".join(md).strip())

# ----------------------------------------------------
# 4. validations.md
# ----------------------------------------------------
def build_validations():
    md = ["""# Validations Documentation

This document lists the core transactional validations enforced during gate operations.

| Field / Control Name | Screen / Form | Validation Type | Validation Rule / Code Condition | Error Message Shown | Implementation Location | Target (Frontend/Backend) |
| --- | --- | --- | --- | --- | --- | --- |"""]
    
    # Process validations
    for s in summaries:
        for v in s["validations"]:
            cond = v["condition"].replace("|", "\\|") if v["condition"] else "Value/Constraint Check"
            msg = v["raw_line"].replace("|", "\\|")
            
            # Simple heuristic to determine where validation should happen
            target = "Both"
            if "select " in cond.lower() or "update " in cond.lower() or "count(" in cond.lower():
                target = "Backend"
            elif len(cond) < 50:
                target = "Frontend"
                
            md.append(f"| N/A | {s['name']} | Business Logic | `{cond}` | `{msg}` | `{v['method']}` | {target} |")
            
    with open(os.path.join(out_dir, "validations.md"), "w") as f:
        f.write("\n".join(md).strip())

# ----------------------------------------------------
# 5. queries.md
# ----------------------------------------------------
def build_queries():
    # Read extracted queries raw
    with open(os.path.join(scratch_dir, "extracted_queries.json")) as f:
        q_raw = json.load(f)
        
    md = ["""# SQL Database Queries Catalog

This document details every SQL query identified in the VB.NET codebase, mapping database actions to repositories.

## 1. Summary Statistics
- **Total Queries Discovered**: {total_queries}
- **Unique Tables Referenced**: {unique_tables_count}
- **Concatenated / Potential SQL Injection Points**: {unsafe_queries_count}

## 2. List of Identified Database Tables
{tables_list}

---

## 3. Cataloged SQL Queries by Screen
""".format(
        total_queries=query_stats["total_queries"],
        unique_tables_count=len(query_stats["unique_tables"]),
        unsafe_queries_count=query_stats["unsafe_queries_count"],
        tables_list="\n".join([f"- `{t}`" for t in query_stats["unique_tables"]])
    )]
    
    for entry in q_raw:
        filename = entry["file"]
        md.append(f"### Screen Component: {filename[:-3]}")
        
        for idx, q in enumerate(entry["queries"]):
            q_text = q["query"]
            q_clean = " ".join(q_text.split())
            
            # Deduce risk
            risk = "Secure Parameterized Query"
            if "&" in q_text or "+" in q_text:
                risk = "**HIGH RISK: SQL String Concatenation** (Injection Point)"
                
            # Deduce backend names
            entity = "Gate"
            if "supplier" in q_clean.lower():
                entity = "Supplier"
            elif "po_" in q_clean.lower() or "pono" in q_clean.lower():
                entity = "PO"
            elif "fifo" in q_clean.lower():
                entity = "Fifo"
                
            method_name = f"{q['method']}Query{idx+1}"
            endpoint_name = f"/api/{entity.lower()}/{q['method'].lower()}-{idx+1}"
            
            md.append(f"#### Query {idx+1}: {q['method']} (Line {q['line']})")
            md.append("```sql\n" + q_clean + "\n```")
            md.append(f"- **Trigger Method**: `{q['method']}`")
            md.append(f"- **Variables Used**: `{q['variable']}`")
            md.append(f"- **Risk Note**: {risk}")
            md.append(f"- **Suggested Backend Method**: `I{entity}Repository.{method_name}()`")
            md.append(f"- **Suggested API Endpoint**: `GET {endpoint_name}`")
            md.append("")
            
    with open(os.path.join(out_dir, "queries.md"), "w") as f:
        f.write("\n".join(md).strip())

# ----------------------------------------------------
# 6. database-model.md
# ----------------------------------------------------
def build_db_model():
    md = ["""# Reconstructed Database Data Model

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
"""]
    with open(os.path.join(out_dir, "database-model.md"), "w") as f:
        f.write("\n".join(md).strip())

# ----------------------------------------------------
# 7. api-mapping.md
# ----------------------------------------------------
def build_api_mapping():
    md = ["""# REST API Endpoint Mapping

This catalog suggests the REST API layout required to support the new React frontend with the .NET backend.

## 1. Authentication & Routing Controller
- **POST `/api/auth/login`**
  - **Body**: `{ role: string }`
  - **Description**: Performs role-based authentication and returns the corresponding configuration parameters (Org ID, Unit, Permissions).
  - **Old VB Reference**: `Login.vb` -> `Button1_Click`

## 2. Gate Entries Controller
- **GET `/api/gate-entries`**
  - **Parameters**: `fromDate`, `toDate`, `unit`, `supplierName`
  - **Description**: Fetches list of gate entries for the dashboard grid.
  - **Old VB Reference**: `Gate.vb` -> `btngo_Click`
  - **Response Shape**: Array of `JAN_GATE_HEADER` records.

- **POST `/api/gate-entries`**
  - **Body**: Gate entry header & array of lines.
  - **Description**: Creates a new gate entry and saves it to Oracle database. Generates sequence number.
  - **Old VB Reference**: `Add.vb` -> `addnew`

- **PUT `/api/gate-entries/{gateNo}`**
  - **Body**: Updated gate entry header & lines.
  - **Description**: Modifies an existing gate entry.
  - **Old VB Reference**: `Add.vb` -> `updt`

- **DELETE `/api/gate-entries/{gateNo}`**
  - **Description**: Performs logical deletion/flagging of gate entries.
  - **Old VB Reference**: `Gate.vb` -> `btndel_Click`

## 3. Gate Validation Controller
- **POST `/api/gate-validation/validate`**
  - **Body**: `{ gateNo: number, validatedBy: string, ewayBill: string }`
  - **Description**: Enforces validations (shortage, e-way bill, item check status), updates Oracle table to `VALIDATED = 5`.
  - **Old VB Reference**: `Validate.vb` -> `valfun`

## 4. ASN/ADI Controller (Cross-Database)
- **GET `/api/asn/{asnNo}`**
  - **Description**: Queries external SQL Server `scm` database, pulls ASN details, maps it to Oracle POs.
  - **Old VB Reference**: `adi.vb` -> `BUT_DWNLD_ASN_Click`

- **POST `/api/asn/link-gate`**
  - **Body**: `{ asnNo: string, gateNo: number }`
  - **Description**: Updates external SQL Server `jan_gate_header` table to link the created gate entry number.
  - **Old VB Reference**: `adi.vb` -> `btnsave_Click`
"""]
    with open(os.path.join(out_dir, "api-mapping.md"), "w") as f:
        f.write("\n".join(md).strip())

# ----------------------------------------------------
# 8. react-migration-plan.md
# ----------------------------------------------------
def build_react_migration_plan():
    md = ["""# React Migration Plan

This plan outlines the architecture of the new modern React application that will replace the legacy VB.NET desktop interface.

## 1. Suggested React Routing Layout
- `/login`: Secure role selector screen (replaces `Login.vb`).
- `/dashboard`: Main gate dashboard registry with custom filters (replaces `Gate.vb`).
- `/gate-entry/new`: Inward gate entry creation form (replaces `Add.vb`).
- `/gate-entry/edit/:gateNo`: Inward gate entry modifier.
- `/gate-validation`: Supervisor approval list (replaces `Validate.vb`).
- `/adi-download`: Advance Shipping Notice processing page (replaces `adi.vb`).
- `/fifo-labels`: Label generator and printer settings (replaces `fifo_sticker.vb`).

## 2. Reusable Shared UI Components
- **`Layout`**: Navigation sidebar and responsive header containing current operator profile and database health indicators.
- **`DataGrid`**: Interactive table component supporting client-side searching, server-side pagination, row check selectors, and PDF/Excel export hooks.
- **`ZplPrinterConfig`**: Printer mapping form allowing operators to select local IP addresses or raw socket printing clients (like QZ Tray).

## 3. State Management Suggestion
- **Redux Toolkit**: To manage global state like active operator token, role permissions, active filters, and printer configs.
- **RTK Query**: For backend REST API queries (caching, polling status, and mutation updates).

## 4. Screen-by-Screen Migration Checklist
- [ ] Implement role-based login routing with mock tokens.
- [ ] Build `/dashboard` grid using TanStack Table (React Table).
- [ ] Connect dashboard search filters to `/api/gate-entries`.
- [ ] Build `/gate-entry/new` form using Formik and Yup for validation.
- [ ] Implement cross-database ASN download flow on `/adi-download`.
- [ ] Integrate local printing using QZ Tray API or direct socket connectivity (replaces local `Shell` execution).
"""]
    with open(os.path.join(out_dir, "react-migration-plan.md"), "w") as f:
        f.write("\n".join(md).strip())

# ----------------------------------------------------
# 9. risk-report.md
# ----------------------------------------------------
def build_risk_report():
    md = ["""# Security, Performance, & Migration Risk Report

This document reports critical security, architectural, and operational risks discovered in the legacy project, providing mitigation solutions for the renovation.

## 1. Hardcoded Credentials & Connection Strings
> [!CAUTION]
> **Risk**: Global module [Module1.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate%20Entry/Module1.vb) contains raw plaintext passwords for database servers:
  - Oracle: `Password=janapps;`
  - SQL Server: `Password=scm#$sql2007`
>
> **Mitigation**: Connection strings must be stored securely in the .NET backend using environment variables or Azure Key Vault, accessed via `IConfiguration` injection. Plaintext credentials must never exist in frontend or source files.

## 2. SQL Injection Vulnerabilities
> [!WARNING]
> **Risk**: 212 of 273 SQL queries build query patterns by directly concatenating user-input strings. E.g.:
  `cl.sql = "select * from jan_gate_header where SUPPLIER_ID=" & cmbsup.SelectedValue & " and DC_NO='" & txtdcno.Text & "'"`
  This allows arbitrary SQL code to be executed against the databases.
>
> **Mitigation**: Rewrite all queries in the .NET backend repositories using parameterized SQL or Dapper/Entity Framework Core object mappings.

## 3. Local Desktop OS Shell Execution (Migration Blockers)
> [!CAUTION]
> **Risk**: The legacy desktop application executes raw DOS shell processes:
  - Prints labels by compiling files locally (`d:\\lotprint.bat`) and executing `Shell("d:\\lotprint.bat", Hide)`.
  - Runs local Windows executables (`c:\\ADI.EXE`) and shell commands.
  This is a **hard blocker** for a web-based React application which runs in a browser sandbox and cannot access local filesystems or execute shell processes.
>
> **Mitigation**:
  1. **Printing**: Replace local file copying with a browser-compatible raw printing library like **QZ Tray** (enables sending raw ZPL byte arrays directly to shared Zebra printers via JavaScript) or print through server-side printing queues.
  2. **External ADI Executable**: Migrate the logic inside `ADI.EXE` directly into a React component or an integrated API endpoint.

## 4. Circular and Inconsistent Connections
> [!WARNING]
> **Risk**: Function `SCMRETVAL` in [Module1.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate%20Entry/Module1.vb) manages connection states incorrectly:
  ```vb
  If CON.State = ConnectionState.Closed Then CON.Open()
  ```
  It opens the Oracle Connection `CON` but runs command `scmcmd` on SQL Server connection `scmcon`! This results in oracle connections remaining idle and sql server connections not being closed/opened properly.
>
> **Mitigation**: Standardize connection lifetimes in the new .NET backend using dependency injection and the `using` pattern for disposal.
"""]
    with open(os.path.join(out_dir, "risk-report.md"), "w") as f:
        f.write("\n".join(md).strip())

# ----------------------------------------------------
# 10. README.md
# ----------------------------------------------------
def build_readme():
    md = """# Gate Entry System Renovation Documentation

This directory contains the complete renovation and migration documentation for upgrading the legacy VB.NET Gate Entry System into a modern React frontend and .NET backend.

## Documentation Index
1. **[Project Overview](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/project-overview.md)** - Application purpose, architecture, and technology stack.
2. **[Screens Documentation](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/screens.md)** - Form inputs, event handlers, grids, navigation, and React mappings.
3. **[Business Rules](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/business-rules.md)** - Calculations, role checks, status transitions, and dynamic visibility constraints.
4. **[Validations Documentation](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/validations.md)** - Catalog of form inputs constraints and popup error conditions.
5. **[SQL Queries Catalog](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/queries.md)** - Reconstructed multi-line SQL queries, unsafe injection points, and backend repository suggestions.
6. **[Database Data Model](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/database-model.md)** - Relational schemas, inferred primary/foreign keys, CRUD operations per table.
7. **[REST API Endpoint Mapping](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/api-mapping.md)** - Structured REST API specs for the new .NET backend controllers.
8. **[React Migration Plan](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/react-migration-plan.md)** - Screen-by-screen frontend layout routes, reusable layouts, and state setups.
9. **[Risk & Pre-Migration Report](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/risk-report.md)** - Credentials leak, SQL injections, OS shell printing dependencies, and cleanup tasks.
"""
    with open(os.path.join(out_dir, "README.md"), "w") as f:
        f.write(md.strip())

# Run all generator functions
build_project_overview()
build_screens()
build_business_rules()
build_validations()
build_queries()
build_db_model()
build_api_mapping()
build_react_migration_plan()
build_risk_report()
build_readme()

print("All documentation markdown files successfully compiled and written to artifacts directory!")
