# Gate Entry System - Full Project Analysis Report

Consolidated from the generated project analysis Markdown files for the legacy VB.NET Gate Entry System renovation to React and .NET.

Generated on: 2026-08-12 19:37:34

## Consolidated Documents
1. [Project Overview](#project-overview) - `project-overview.md`
2. [Screens And Forms](#screens-and-forms) - `screens.md`
3. [Business Rules](#business-rules) - `business-rules.md`
4. [Validations](#validations) - `validations.md`
5. [SQL Queries](#sql-queries) - `queries.md`
6. [Database Model](#database-model) - `database-model.md`
7. [API Mapping](#api-mapping) - `api-mapping.md`
8. [React Migration Plan](#react-migration-plan) - `react-migration-plan.md`
9. [Risk Report](#risk-report) - `risk-report.md`
10. [Implementation Plan](#implementation-plan) - `implementation_plan.md`
11. [Walkthrough](#walkthrough) - `walkthrough.md`
12. [Original Task](#original-task) - `task.md`
13. [Original Documentation Index](#original-documentation-index) - `README.md`

---

## Project Overview

Source file: `/Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Project Analysis/project-overview.md`

### Project Overview - Gate Entry Management System

This document provides a high-level architectural overview of the legacy VB.NET **Gate Entry Management System**, designed to manage the factory gate entry, material verification, and invoice processing.

#### 1. Application Purpose
The application serves as a Gate Entry register and validation gatekeeper. It registers incoming delivery trucks, vendor deliveries, purchase orders (PO), outward processing challans (OSP), non-PO courier items, and direct delivery receipts. It validates delivery challans (DC), prints lot barcodes, checks for job shortages, processes daily End of Day (EOD) closures, and interfaces with accounts validation before materials are formally received in the Oracle ERP inventory.

#### 2. Main Modules & Features
- **Security Login & Role-Based Routing**: Restricts application features depending on user roles (`GATE`, `UNIT7`, `VALID`, `INWARD`, `SKYFAST`, etc.).
- **Gate Register (Dashboard)**: Central search, status tracking, and navigation hub for gate entries.
- **Material Inward Gate Entry (Add/Edit)**: Main entry point for recording DC No, DC Date, Supplier Name, Courier details, Box count, PO/OSP references, and item weights.
- **Advance Shipping Notice / ADI Verification**: Connects to an external SQL Server database to pull supplier Advance Shipping Notices (ASN), validating them against Oracle pending deliveries.
- **Gate Validation / Approval**: Quality check and E-way bill validation before accounts posting.
- **Job Shortages Monitor (PO Block)**: Enforces entry validation for operators with pending shortages.
- **Barcode & Lot Printing**: Generates raw Zebra Programming Language (ZPL) commands and writes them to local batch files to print stickers via shared network printers.
- **End of Day (EOD) Close**: Handles EOD closure, Excel exports, and transaction synchronization.
- **Min-Max Inventory Control**: Tracks locator and min-max balance cards.

#### 3. Technology Stack Discovered
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

#### 4. Entry Points & Startup Flow
- **Startup Object**: `Manufacture.Login` (as defined in `Manufacture.vbproj`)
- **Login Load**: The `Login_Load` event hardcodes a default login (`userid = "UNIT7"`, `orgid = "444"`) and automatically triggers the login action on load, hiding itself and displaying the `Gate` dashboard as a modal dialog (`Gate.ShowDialog()`).
- **Dashboard Load (`Gate_Load`)**: Fetches permissions from `jan_gate_login` and restricts dashboard menu items, buttons, or checkboxes based on the active role (`c`).

#### 5. Important Configuration Files
- **[app.config](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate%20Entry/app.config)**: Set up runtime configuration and binds logging traces to `FileLogWriter`. It targets `.NETFramework,Version=v4.8`.
- **[Manufacture.vbproj](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate%20Entry/Manufacture.vbproj)**: Defines source files, dependencies (`ZXing`, `Zen.Barcode`, `oracleclass`), COM references (`Excel`, `Dao`), and compilation parameters.

#### 6. Database Connection Details
- **Oracle Connection (CON / CON1)**:
  `Data Source=prod;User Id=jan_it;Password=janapps;Integrated Security=no;`
- **SQL Server Connection (scmcon / scmcon2)**:
  `Data Source=13.235.195.146;Initial Catalog=scm;User ID=scm;Password=scm#$sql2007`

#### 7. Hardcoded Paths, Credentials, & Endpoints
- **Credentials**: Hardcoded passwords for Oracle (`janapps`) and SQL Server (`scm#$sql2007`).
- **Endpoints/IPs**: Hardcoded SQL Server IP `13.235.195.146`.
- **File System Paths**:
  - `d:\lotsticker.txt` (ZPL printer commands)
  - `d:\lotprint.bat` (Direct copying to network printers)
  - `d:\locprint.bat` (Location label copying)
  - `d:\receipt\rec_pend.HTML` (HTML reports)
  - `F:\public\adi_2.BAT` (Batch execution)
  - `c:\ADI.EXE` (External Windows executable)
  - `c:\gate\gate.bat` (Local script execution)
  - `F:\public\Unclosed_adi.BAT` (Batch execution)

---

## Screens And Forms

Source file: `/Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Project Analysis/screens.md`

### Screens and Forms Documentation

This document catalogs all WinForms screens found in the VB.NET project, detailing controls, event handlers, navigation, database triggers, validations, and suggested React component representations.

#### Screen: Add
- **Source File**: [Add.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/Add.vb)
- **Purpose**: Core transactional gate entry screen. Enables recording DC values, item descriptions, box quantities, POs, OSPs, and manual ADI reasons.
##### UI Controls & Components
  - **Buttons**: `btnsave, btnmod, btnupdt`
  - **Input Fields**: `txtsite, txtdcno, TextBox1, txttype, txtgno, txtorg, TXTUSER, txtrole, txt_adi_no, txtinv, txtadirea, txtnorg, txtveh, txtrwt, txtpodwt, txtbox, txtpod, txtper, txtjper`
  - **Dropdown Selectors**: `cmbitem, cmbpo, cmbsup, cmbtype, TXTREF, cmbcat, cmbcr, cmbres, ddltranp, ddldept`
  - **Data Grids / Tables**: `dgv12, dgv1`
  - **Checkboxes**: `chk_adi, xerox, chkref, chkogt`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - **[cmbsup_SelectedIndexChanged - Line 108]**: `select vendor_site_code from po_vendor_sites_all where vendor_id= '" & cmbsup.SelectedValue & "' and inactive_Date is nu...`
  - **[cmbsup_SelectedIndexChanged - Line 118]**: `select supplier_name from jan_gate_supplier where supplier_name='" & cmbsup.Text.ToString.Replace("'", "") & "' and type...`
  - **[cmbitem_SelectedIndexChanged - Line 258]**: `select ((select SEGMENT1 from PO_HEADERS_ALL where PO_HEADER_ID=B.PO_HEADER_ID) || '|---|'|| B.PO_LINE_ID) PONO,PO_LINE_...`
  - **[cmbitem_SelectedIndexChanged - Line 285]**: `SELECT (TRUNC(EXEMPTION_VALIDITY_TILL)-TRUNC(sysdate))CNT  FROM jan_gate_adi_exempt WHERE VENDOR_ID=" & cmbsup.SelectedV...`
  - **[cmbpo_SelectedIndexChanged - Line 359]**: `select nvl(sum(po_qty-recd),0) po from jan_po_pending_bought_outs where po_header_id=(select po_header_id from po_header...`
  - **[cmbpo_SelectedIndexChanged - Line 365]**: `select nvl(sum(supdcqty),0) po from jan_gate_lines  where pono='" & f & "'  and item ='" & b & "' and validated<>'4'  an...`
  - *(57 additional queries omitted for brevity. See [queries.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/queries.md) for full SQL list)*
##### Screen-Level Validations
  - **[cmbsup_SelectedIndexChanged]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `'  MessageBox.Show(cl.sql)...`
  - **[cmbitem_SelectedIndexChanged]**: Condition `If ds.Tables("VALID").Rows(0).Item("cnt") >= 0 Then` triggers message alert `MessageBox.Show("No Provision to add Manual Gate Entry ... ,ADI Required", "Gate Register")...`
  - **[cmbitem_SelectedIndexChanged]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("No Provision to add Manual Gate Entry ... ,ADI Required", "Gate Register")...`
  - **[cmbitem_SelectedIndexChanged]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("Vendor Not in Exempted list", "Gate Register")...`
  - **[cmbitem_SelectedIndexChanged]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `' MessageBox.Show("Vendor Not in Exempted list", "Gate Register")...`
  - **[cmbpo_SelectedIndexChanged]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `'        MessageBox.Show("No Gate Entry is allowed for the PO " & f & " ", "Gate Register")...`
- **Suggested React Component**: `AddDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: ApplicationEvents
- **Source File**: [ApplicationEvents.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/ApplicationEvents.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - No interactive controls found.
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - No database queries executed on this screen.
##### Screen-Level Validations
  - No formal validations or popup alert conditions captured on this screen.
- **Suggested React Component**: `ApplicationEventsDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: Class1
- **Source File**: [Class1.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/Class1.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - No interactive controls found.
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - No database queries executed on this screen.
##### Screen-Level Validations
  - No formal validations or popup alert conditions captured on this screen.
- **Suggested React Component**: `Class1Dialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: Class2
- **Source File**: [Class2.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/Class2.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - No interactive controls found.
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - No database queries executed on this screen.
##### Screen-Level Validations
  - **[dataacs]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `'  MsgBox(ex.Message)...`
- **Suggested React Component**: `Class2Dialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: Class3
- **Source File**: [Class3.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/Class3.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - No interactive controls found.
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - No database queries executed on this screen.
##### Screen-Level Validations
  - No formal validations or popup alert conditions captured on this screen.
- **Suggested React Component**: `Class3Dialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: CycleCount
- **Source File**: [CycleCount.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/CycleCount.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - **Buttons**: `btnpri, btngo`
  - **Input Fields**: `txtitem`
  - **Dropdown Selectors**: `cmbitem, cmbinv, cmbmb, cmborg`
  - **Data Grids / Tables**: `dgcycle`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - No database queries executed on this screen.
##### Screen-Level Validations
  - **[btngo_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.StackTrace)...`
- **Suggested React Component**: `CycleCountDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: Form1
- **Source File**: [Form1.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/Form1.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - **Buttons**: `Button1`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - **[Button1_Click - Line 5]**: `SELECT 0 gate1_Rating,round( JAN_individual_rate_summary ('122021',A.Last_name,'Rating',A.location,'AML',A.EMPloyee_NUMB...`
##### Screen-Level Validations
  - No formal validations or popup alert conditions captured on this screen.
- **Suggested React Component**: `Form1Dialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: Gate
- **Source File**: [Gate.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/Gate.vb)
- **Purpose**: Main application dashboard. Provides data grids for entries, search filtering, and routes to all sub-features (Validation, Modifications, FIFO Lot creation, Reports).
##### UI Controls & Components
  - **Buttons**: `btnval, btnadd, btnmod, btnsta, glist, ADIbt, btncan, btnrecpt, btnnonpo, btngo, btnxs, Button1, UNBLOCK, btnreport, mmcard, bprint, btnview, btndel, btnitem, btnwop, btngacc, btntag, job_shrt`
  - **Input Fields**: `txtlog, txtrole, txtinw`
  - **Dropdown Selectors**: `cmbsup, cmbval, cmborg, gtype, TXTREF`
  - **Data Grids / Tables**: `dgv1, dgv, dgvcr, dgvr`
  - **Checkboxes**: `CheckBox1`
- **Navigation**: Opens `Gate_Password, gate_lot_print, headerval, del, re, receipt_prepared, ADD, f, gacc, gatelist, excess_release, gt_checked, non_po, cancelentry, adi, direct_delivery, vou, Add, Report, rtvreason, valreason, st, GateUpdate, suplist` modal screens.
##### Database Queries Triggered
  - **[Gate_Load - Line 94]**: `select REPLACE(vendor_name,'''','''''')supplier,vendor_id from po_vendors where vendor_type_lookup_code <>'EMPLOYEE' AND...`
  - **[Gate_Load - Line 101]**: `select organization_code  from org_organization_definitions where organization_id in (" & orgid & " ) order by organizat...`
  - **[Gate_Load - Line 110]**: `SELECT REA_NAME FROM JAN_GATE_REASON WHERE REA_CODE IN (42,43,44,45,46)...`
  - **[Gate_Load - Line 123]**: `SELECT REA_NAME FROM JAN_GATE_REASON WHERE REA_CODE IN (42,43,44,45,46)...`
  - **[Gate_Load - Line 133]**: `SELECT REA_NAME FROM JAN_GATE_REASON WHERE REA_CODE IN (42,43,44,45,46)...`
  - **[btngo_Click - Line 235]**: `select   a.gate_no,a.gdate,a.supplier_name,a.supplier_site,(select registration_number from  JAN_GST_REG_DETAILS_VIEW wh...`
  - *(15 additional queries omitted for brevity. See [queries.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/queries.md) for full SQL list)*
##### Screen-Level Validations
  - **[Gate_Load]**: Condition `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` triggers message alert `MessageBox.Show(ex.Message, "GATE ENTRY")...`
  - **[Gate_Load]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[btngo_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[btndel_Click]**: Condition `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` triggers message alert `dr = MessageBox.Show("Do You Want to delete?", "Gate Entry", MessageBoxButtons.YesNo, MessageBoxIcon.Exclamation)...`
  - **[btndel_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[btnval_Click]**: Condition `If IsDBNull(cl.ds.Tables("resultab").Rows(0).Item("dcval")) Then` triggers message alert `MessageBox.Show("View Tax Values", "Gate Register")...`
- **Suggested React Component**: `GatePage` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: Gate Status Login
- **Source File**: [Gate Status Login.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/Gate Status Login.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - **Buttons**: `btncan, btnlog`
  - **Input Fields**: `txtuname, txtpwd`
- **Navigation**: Opens `gateStatus` modal screens.
##### Database Queries Triggered
  - No database queries executed on this screen.
##### Screen-Level Validations
  - **[btnlog_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("Invalid Login", "Kardex")...`
- **Suggested React Component**: `Gate Status LoginDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: GateUpdate
- **Source File**: [GateUpdate.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/GateUpdate.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - **Buttons**: `btnupdt, btndel`
  - **Input Fields**: `txtgate, txtline, txtqty, txtwt, txtrole, txtpodwt, txtpod`
  - **Dropdown Selectors**: `cmbcat, cmbres, cmbcr`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - **[btndel_Click - Line 66]**: `select receipt_num from rcv_shipment_headers where packing_slip='" & txtgate.Text & "'...`
  - **[btndel_Click - Line 76]**: `SELECT * FROM JAN_GATe_LINES WHERE GATE_NO=" & txtgate.Text & "...`
  - **[btndel_Click - Line 81]**: `SELECT * FROM JAN_GATe_LINES WHERE GATE_NO=" & txtgate.Text & "...`
  - **[btndel_Click - Line 101]**: `select count(*) from jan_gate_lines where checked_by is not null  and gate_no=" & txtgate.Text & "...`
  - **[GateUpdate_Load - Line 153]**: `select description from jan_open_challan_Category where CAT_FOR_GATE=1 and live_Flag=1...`
  - **[GateUpdate_Load - Line 165]**: `select * from jan_gate_courier...`
##### Screen-Level Validations
  - **[btnupdt_Click]**: Condition `If unit.Contains("SPM") = True And cmbres.Text <> "" Then` triggers message alert `MessageBox.Show("Gate Value Updated", " Gate Register")...`
  - **[btndel_Click]**: Condition `If (dar.HasRows = True) Then` triggers message alert `MessageBox.Show("Receipt Made,Gate Can't be updated", "Gate Register")...`
  - **[btndel_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("Gate No:  " & txtgate.Text & "deleted", "Gate Register")...`
- **Suggested React Component**: `GateUpdateDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: Gate_Password
- **Source File**: [Gate_Password.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/Gate_Password.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - **Buttons**: `updt, Button1`
  - **Input Fields**: `txtrole, txtcpwd, txtpwd, txtuname, txtper`
  - **Data Grids / Tables**: `DGV1`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - No database queries executed on this screen.
##### Screen-Level Validations
  - **[updt_Click]**: Condition `If CON.State = ConnectionState.Closed Then CON.Open()` triggers message alert `MessageBox.Show("Password Changed", "Gate Register")...`
  - **[updt_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
- **Suggested React Component**: `Gate_PasswordDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: Login
- **Source File**: [Login.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/Login.vb)
- **Purpose**: Authentication screen with hardcoded defaults. Performs automatic routing to Gate Dashboard depending on roles.
##### UI Controls & Components
  - **Buttons**: `Button1, Button2, Button3`
  - **Input Fields**: `txtuser, txtpwd`
- **Navigation**: Opens `Gate` modal screens.
##### Database Queries Triggered
  - **[Button1_Click - Line 22]**: `select * from jan_gate_login where   role ='" & userid & "'...`
##### Screen-Level Validations
  - **[Button1_Click]**: Condition `If Not IsDBNull(.Item("modify_Flag")) Then modify_Flag = .Item("modify_Flag")` triggers message alert `MessageBox.Show("Login Mismatch !!!", "Gate Register")...`
  - **[Button1_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `'    ErrorProvider1.SetError(txtuser, "Invalid Username")...`
  - **[Button1_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `'    ErrorProvider1.SetError(txtpwd, "Invalid Pwd")...`
- **Suggested React Component**: `LoginPage` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: Login.designer
- **Source File**: [Login.designer.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/Login.designer.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - No interactive controls found.
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - No database queries executed on this screen.
##### Screen-Level Validations
  - **[InitializeComponent]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `Me.ErrorProvider1 = New System.Windows.Forms.ErrorProvider(Me.components)...`
  - **[InitializeComponent]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `CType(Me.ErrorProvider1, System.ComponentModel.ISupportInitialize).BeginInit()...`
  - **[InitializeComponent]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `'ErrorProvider1...`
  - **[InitializeComponent]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `Me.ErrorProvider1.ContainerControl = Me...`
  - **[InitializeComponent]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `CType(Me.ErrorProvider1, System.ComponentModel.ISupportInitialize).EndInit()...`
  - **[Global]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `Friend WithEvents ErrorProvider1 As System.Windows.Forms.ErrorProvider...`
- **Suggested React Component**: `Login.designerDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: Module1
- **Source File**: [Module1.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/Module1.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - No interactive controls found.
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - No database queries executed on this screen.
##### Screen-Level Validations
  - No formal validations or popup alert conditions captured on this screen.
- **Suggested React Component**: `Module1Dialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: MyGroupBox
- **Source File**: [MyGroupBox.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/MyGroupBox.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - No interactive controls found.
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - No database queries executed on this screen.
##### Screen-Level Validations
  - No formal validations or popup alert conditions captured on this screen.
- **Suggested React Component**: `MyGroupBoxDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: NOTVALIDATELIST
- **Source File**: [NOTVALIDATELIST.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/NOTVALIDATELIST.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - **Buttons**: `btnshow, btnfm, btnto, btnprint`
  - **Input Fields**: `txtqpto, txtqpfm`
  - **Dropdown Selectors**: `cmbsup, cmborg`
  - **Data Grids / Tables**: `dgvdetails, dgvlines`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - No database queries executed on this screen.
##### Screen-Level Validations
  - **[btnshow_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.ToString)...`
  - **[NOTVALIDATELIST_Load]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.ToString)...`
  - **[dgvdetails_CellClick]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.ToString)...`
  - **[btnprint_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.ToString)...`
- **Suggested React Component**: `NOTVALIDATELISTDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: PO_BLOCK
- **Source File**: [PO_BLOCK.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/PO_BLOCK.vb)
- **Purpose**: Administrative blocker utility. Checks for pending gate validations and prevents the operator from navigating away by using a timeout blocker.
##### UI Controls & Components
  - **Data Grids / Tables**: `dgvlist`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - No database queries executed on this screen.
##### Screen-Level Validations
  - **[PO_BLOCK_Load]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `' MessageBox.Show(sql)...`
  - **[PO_BLOCK_Load]**: Condition `If ds.Tables("RESULT").Rows.Count > 0 Then` triggers message alert `'MessageBox.Show(ds.Tables("RESULT").Rows.Count)...`
- **Suggested React Component**: `PO_BLOCKDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: PO_BLOCK.designer
- **Source File**: [PO_BLOCK.designer.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/PO_BLOCK.designer.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - No interactive controls found.
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - No database queries executed on this screen.
##### Screen-Level Validations
  - No formal validations or popup alert conditions captured on this screen.
- **Suggested React Component**: `PO_BLOCK.designerDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: ProjectInstaller
- **Source File**: [ProjectInstaller.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/ProjectInstaller.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - No interactive controls found.
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - No database queries executed on this screen.
##### Screen-Level Validations
  - No formal validations or popup alert conditions captured on this screen.
- **Suggested React Component**: `ProjectInstallerDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: Report
- **Source File**: [Report.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/Report.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - **Buttons**: `Button1, po, Button2, Button3, Button4, btnprintnew, btngt, btnnval`
  - **Input Fields**: `TextBox1, txtrole`
  - **Dropdown Selectors**: `cmbval, cmborg, cmbcat`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - No database queries executed on this screen.
##### Screen-Level Validations
  - **[po_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[Button5_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[btngt_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[btnnval_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[btnnoref_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
- **Suggested React Component**: `ReportDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: Service1
- **Source File**: [Service1.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/Service1.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - No interactive controls found.
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - No database queries executed on this screen.
##### Screen-Level Validations
  - No formal validations or popup alert conditions captured on this screen.
- **Suggested React Component**: `Service1Dialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: Service2
- **Source File**: [Service2.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/Service2.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - No interactive controls found.
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - No database queries executed on this screen.
##### Screen-Level Validations
  - No formal validations or popup alert conditions captured on this screen.
- **Suggested React Component**: `Service2Dialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: Status
- **Source File**: [Status.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/Status.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - **Buttons**: `Button1, Button2, Button3, Button4, Button5, Button6, btn_short`
  - **Input Fields**: `TextBox1, txtrole`
  - **Dropdown Selectors**: `cmborg, cmbsup, cmbcr`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - **[Status_Load - Line 20]**: `select REPLACE(vendor_name,'''','''''')supplier,vendor_id from po_vendors where vendor_type_lookup_code <>'EMPLOYEE' AND...`
  - **[Status_Load - Line 27]**: `select organization_code  from org_organization_definitions where organization_id   in(" & orgid & " )order by organizat...`
  - **[Status_Load - Line 34]**: `select * from jan_gate_courier...`
  - **[Button3_Click - Line 54]**: `select gate_no,gdate,dc_no,dc_Date,supplier_name,courier_name,pod_no,po_wt,no_of_box,rec_Wt,rec_wt_dt from jan_gatE_head...`
  - **[Button4_Click - Line 134]**: `select  Gate_no , GDate, (SELECT LISTAGG   ( distinct org, ', ' ) WITHIN GROUP (ORDER BY line_no) from jan_gate_lines wh...`
  - **[Button5_Click - Line 230]**: `select DISTINCT a.gate_no,a.gdate,a.supplier_name,a.dc_no,a.dc_date,(case when (SELECT DECODE(POTYPE,'Services',potype,t...`
  - *(2 additional queries omitted for brevity. See [queries.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/queries.md) for full SQL list)*
##### Screen-Level Validations
  - **[Button5_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
- **Suggested React Component**: `StatusDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: Validate
- **Source File**: [Validate.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/Validate.vb)
- **Purpose**: Verification gatekeeper. Validates gate lines, matching quantities against Oracle ERP records and running E-Invoice and E-way bill checks.
##### UI Controls & Components
  - **Buttons**: `btnok`
  - **Input Fields**: `txtpo, txtitem, txtgno, TXTLINE, txtlog, txttypt, txtrole, txtorg, txtgst`
  - **Dropdown Selectors**: `cmbval`
  - **Data Grids / Tables**: `dgv, dgv1, dgval`
  - **Checkboxes**: `chkeinv`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - **[VALIDATE_Load - Line 34]**: `SELECT pono,ITEM , STATUS  FROM  (SELECT  pono,LOCATION_ID,ITEM ,(select case when (quantity-(quantity_received+quantity...`
  - **[VALIDATE_Load - Line 50]**: `SELECT pono,ITEM , STATUS  FROM  (SELECT  pono,LOCATION_ID,ITEM ,(select case when (quantity-(quantity_received+quantity...`
  - **[RBTNV_CheckedChanged - Line 114]**: `SELECT REA_CODE,REA_NAME,REA_REMARK,ACTION,ACTION_REMARK,TO_CHAR(ACTION_DT)ACTION_DT,REA_SEL FROM JAN_GATE_NVAL_REASON W...`
  - **[RBTNNV_CheckedChanged - Line 194]**: `select nvl(eway_no,(select eway_bill from jan_gate_del where gate_no=" & txtgno.Text & " and  DEL_FOR='Header' and eway_...`
  - **[RBTNNV_CheckedChanged - Line 203]**: `SELECT REA_CODE,REA_NAME FROM JAN_GATE_REASON  WHERE LIVE_FLAG='Y'   ORDER BY REA_CODE...`
  - **[RBTNNV_CheckedChanged - Line 268]**: `SELECT REA_REMARK,REAson_Date,TO_CHAR(ACTION)ACTION,TO_CHAR(ACTION_REMARK)ACTION_REMARK,ACTION_DT,rea_sel FROM JAN_GATE_...`
  - *(25 additional queries omitted for brevity. See [queries.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/queries.md) for full SQL list)*
##### Screen-Level Validations
  - **[RBTNNV_CheckedChanged]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message, "Gate Entry")...`
  - **[BTNOK_Click]**: Condition `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` triggers message alert `MessageBox.Show(.Item(0))...`
  - **[BTNOK_Click]**: Condition `If dswt.Tables("cnt").Rows(0).Item(0) > 0 Then` triggers message alert `MessageBox.Show("Received Weight not entered for POD", "Gate Entry")...`
  - **[BTNOK_Click]**: Condition `If dsgt.Tables("gate_Cnt").Rows.Count <> dscnt.Tables("tax_cnt").Rows.Count Then` triggers message alert `MessageBox.Show("Tax not available for all lines as in gate entry", "Gate Register")...`
  - **[BTNOK_Click]**: Condition `If val = 0 And val1 = 0 Then` triggers message alert `MessageBox.Show("Tick E-invoice Supplier and proceed", "Gate Register")...`
  - **[BTNOK_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("Enter Supplier E-way bill No and proceed", "Gate Register")...`
- **Suggested React Component**: `ValidateDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: Voucher
- **Source File**: [Voucher.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/Voucher.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - **Buttons**: `Button2, Button1`
  - **Input Fields**: `txtvou, txtdc, txtsup, txtgate`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - No database queries executed on this screen.
##### Screen-Level Validations
  - **[Button1_Click]**: Condition `If cl.oracon.State = ConnectionState.Closed Then` triggers message alert `MessageBox.Show("Voucher No Added", "Gate Entry")...`
  - **[Button1_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("Enter Voucher Number", "Gate Entry")...`
  - **[Button1_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
- **Suggested React Component**: `VoucherDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: adi
- **Source File**: [adi.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/adi.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - **Buttons**: `BUT_DWNLD_ASN, btnclose, btnupdt, btnmod, btnsave`
  - **Input Fields**: `txtrwt, txtpodwt, txtbox, txtpod, txtveh, Txt_inv_val, txtrole, TXT_ASN_NO, TXTUSER, txtorg, txtgno, TextBox1, txtdcno, txttype, txtsite`
  - **Dropdown Selectors**: `cmbcr, cmbtype, cmbsup, cmbpo, cmbitem`
  - **Data Grids / Tables**: `asn_grid, dgv1, dgv12`
  - **Checkboxes**: `chkoadi, nval_cb`
- **Navigation**: Opens `add_frm` modal screens.
##### Database Queries Triggered
  - **[btnsave_Click - Line 18]**: `select NVL(MAX(gate_no),0)GATE_NO from jan_gate_header WHERE UNIT='UNIT2'...`
  - **[btnsave_Click - Line 35]**: `select jan_GATE_NO_SEQ.NEXTVAL FROM DUAL...`
  - **[btnsave_Click - Line 50]**: `SELECT TO_CHAR(JAN_FYR_DATE,'yyyy') FROM DUAL...`
  - **[btnsave_Click - Line 58]**: `select NVL(MAX(gate_no),0)GATE_NO from jan_gate_header WHERE UNIT='" & txtrole.Text & "'  AND GDATE>JAN_FYR_DATE...`
  - **[btnsave_Click - Line 74]**: `SELECT TO_CHAR(JAN_FYR_DATE,'yyyy') FROM DUAL...`
  - **[btnsave_Click - Line 82]**: `select NVL(MAX(gate_no),0)GATE_NO from jan_gate_header WHERE UNIT='JAPL'  AND GDATE>JAN_FYR_DATE...`
  - *(36 additional queries omitted for brevity. See [queries.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/queries.md) for full SQL list)*
##### Screen-Level Validations
  - **[btnsave_Click]**: Condition `If ds1.Tables("resultab").Rows(i).Item("gate_no") = txtgno.Text Then` triggers message alert `MessageBox.Show("Gate Number Already Exists!", "Gate Entry")...`
  - **[btnsave_Click]**: Condition `If ds.Tables("resultab").Rows(i).Item("dc_no").ToString = txtdcno.Text Then` triggers message alert `MessageBox.Show(sql, "Gate Entry")...`
  - **[btnsave_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `'                MsgBox("Tariff No Not Empty !..")...`
  - **[btnsave_Click]**: Condition `If dgv1.Rows(i).Cells(0).Value <> "" And txtdcno.Text <> "" And dgv1.Rows(i).Cells(8).Value <> "" And Convert.ToDecimal(dgv1.Rows(i).Cells(8).Value) > Convert.ToDecimal(dgv1.Rows(i).Cells(6).Value) Then` triggers message alert `MessageBox.Show("DcQty Greater Then Po Pend", "Gate Entry")...`
  - **[btnsave_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("Saved Successfully !!-Gate Number is: " & head & "", "Gate Entry")...`
  - **[btnsave_Click]**: Condition `If B = True Then` triggers message alert `MessageBox.Show("Enter Dcno,DCqty,Remark To Save Gate Values", "Gate Entry")...`
- **Suggested React Component**: `adiDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: adi_exemption
- **Source File**: [adi_exemption.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/adi_exemption.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - **Buttons**: `btngo, Button1`
  - **Dropdown Selectors**: `cmbsup`
  - **Data Grids / Tables**: `dgv`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - No database queries executed on this screen.
##### Screen-Level Validations
  - **[btngo_Click]**: Condition `If CON.State = ConnectionState.Closed Then CON.Open()` triggers message alert `MessageBox.Show("Exemption for ADI Saved")...`
- **Suggested React Component**: `adi_exemptionDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: cancelentry
- **Source File**: [cancelentry.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/cancelentry.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - **Buttons**: `Button1`
  - **Input Fields**: `txtref, txtrole`
  - **Dropdown Selectors**: `cmborg, cmbrea`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - **[Button1_Click - Line 10]**: `update  jan_gate_header set reason='" & cmbrea.SelectedItem & "',rearef='" & txtref.Text & "' ,org='" & cmborg.SelectedI...`
  - **[Button1_Click - Line 31]**: `insert into jan_gatE_nval_reason (gate_no,rea_remark,rea_dt,flag,gdate,UNAME,rea_code,reason_date) values (" & Gate.dgv....`
  - **[Button1_Click - Line 35]**: `select reason from jan_gatE_header where gatE_no=" & Gate.dgv.Rows(Gate.dgv.CurrentRow.Index).Cells(1).Value & "...`
  - **[Button1_Click - Line 46]**: `update jan_gate_header set validated='4' where gate_no= " & Gate.dgv.Rows(Gate.dgv.CurrentRow.Index).Cells(1).Value & "...`
  - **[cancelentry_Load - Line 59]**: `select organization_code  from org_organization_definitions where organization_id     in(" & orgid & " )order by organiz...`
  - **[cancelentry_Load - Line 67]**: `SELECT REASON,REAREF,ORG FROM JAN_GAte_HEADER WHERE GATe_NO=" & Gate.dgv.Rows(Gate.dgv.CurrentRow.Index).Cells(1).Value ...`
##### Screen-Level Validations
  - **[Button1_Click]**: Condition `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` triggers message alert `MessageBox.Show("Gate No Cancelled", "Gate Register")...`
  - **[Button1_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.ToString)...`
- **Suggested React Component**: `cancelentryDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: del
- **Source File**: [del.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/del.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - **Buttons**: `Button1, Button2`
  - **Input Fields**: `TextBox1, TextBox2, TextBox3, TextBox4, TextBox5, TextBox6`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - No database queries executed on this screen.
##### Screen-Level Validations
  - **[Button1_Click]**: Condition `If CON.State = ConnectionState.Closed Then` triggers message alert `'MessageBox.Show("Delete Reason Saved", "Gate Entry")...`
  - **[Button1_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
- **Suggested React Component**: `delDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: direct_delivery
- **Source File**: [direct_delivery.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/direct_delivery.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - **Buttons**: `btnshow, Button1`
  - **Input Fields**: `txtitem`
  - **Dropdown Selectors**: `cmborg, cmbven, cmbcri`
  - **Data Grids / Tables**: `dgv1`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - **[btnshow_Click - Line 101]**: `select asn_no from jan_gate_lines_v where job='...`
  - **[btnshow_Click - Line 101]**: `select asn_no from jan_gate_lines_v where job='" & DV(i)("jobno...`
  - **[btnshow_Click - Line 103]**: `select asn_no from jan_gate_lines_v where job='...`
  - **[btnshow_Click - Line 103]**: `select asn_no from jan_gate_lines_v where job='" & DV(i)("jobno...`
##### Screen-Level Validations
  - No formal validations or popup alert conditions captured on this screen.
- **Suggested React Component**: `direct_deliveryDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: eod
- **Source File**: [eod.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/eod.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - **Buttons**: `Button1, Button2`
  - **Dropdown Selectors**: `cmbprc, txtres, cmbp, cmbou`
  - **Data Grids / Tables**: `dgv1`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - **[eod_Load - Line 39]**: `Select  name,organization_id from hr_operating_units WHERE ORGANIZATION_ID In (" & ORG_ID & ")...`
  - **[Button1_Click - Line 82]**: `select *  from jan_eod_excel_list a where 1=1 and operating_unit=" & cmbou.SelectedValue & "    and a.process_id =" & cm...`
  - **[cmbprc_SelectedIndexChanged - Line 204]**: `Select distinct prime_responsibility from jan_eod_process_master where live_flag=1 and org_id=" & cmbou.SelectedValue & ...`
  - **[cmbprc_SelectedIndexChanged - Line 223]**: `Select distinct process_name,idno from jan_eod_process_master where live_flag=1 and org_id=" & cmbou.SelectedValue & "  ...`
  - **[txtres_SelectedIndexChanged - Line 246]**: `Select distinct process_name,idno from jan_eod_process_master where live_flag=1 and org_id=" & cmbou.SelectedValue & "  ...`
  - **[Button2_Click - Line 293]**: `Select C.*,Case When PENDING_DAYS> 0 Then'OVER DUE' ELSE'DUE' END STATUS,(SELECT DECODE(PLANNING_MAKE_BUY_CODE,1,'Make',...`
##### Screen-Level Validations
  - **[releaseObject]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("Exception Occured while releasing object " + ex.ToString())...`
  - **[Button2_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("Over")...`
- **Suggested React Component**: `eodDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: excess-release
- **Source File**: [excess-release.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/excess-release.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - **Buttons**: `btnsave, btnclose, Button1, BTNPRINT`
  - **Input Fields**: `txtrem, txtgate, txtrole`
  - **Dropdown Selectors**: `cmbsup, cmborg`
  - **Data Grids / Tables**: `dgv, DGVLINE`
  - **Checkboxes**: `CheckBox1`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - No database queries executed on this screen.
##### Screen-Level Validations
  - **[btnsave_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("Remark Saved", "Gate Register")...`
  - **[btnsave_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("Enter Remark", "Gate Register")...`
  - **[btnsave_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[Button1_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[dgv_CellClick]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[BTNPRINT_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
- **Suggested React Component**: `excess-releaseDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: fifo_login
- **Source File**: [fifo_login.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/fifo_login.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - **Buttons**: `bnlogin, btncpwd`
  - **Input Fields**: `txtuname, txtpwd`
- **Navigation**: Opens `fifo_sticker` modal screens.
##### Database Queries Triggered
  - No database queries executed on this screen.
##### Screen-Level Validations
  - **[bnlogin_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("Invalid Login", "FIFO Sticker Print")...`
- **Suggested React Component**: `fifo_loginDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: fifo_sticker
- **Source File**: [fifo_sticker.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/fifo_sticker.vb)
- **Purpose**: FIFO sticker printing screen. Generates and prints barcode lot details based on First-In-First-Out logic.
##### UI Controls & Components
  - **Buttons**: `btnshow, btnprint, bntjob, btncshow, btn_jstk, btncprint, btnslist, btnship, Button1`
  - **Input Fields**: `txtgno, txtjob, txtjitem, txtcitem, txtitem, txtsitem, txtship, txtto, txtloc, txtfrm`
  - **Dropdown Selectors**: `cmborg, cmbjorg, cmbsub, cmbcorg, cmbsorg`
  - **Data Grids / Tables**: `dgv, dgvjob, dgvcstk, dgvs, DataGridView1`
  - **Checkboxes**: `chkpend, chkspend, chkjpend, chkptc`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - **[btnshow_Click - Line 116]**: `select ORG,GATE_NO,	ITEM,	ITEM_DESC	,SUPPLIER_NAME,	ACTUAL_LOT	,ITEM_ID	,QTY,	ORG_ID	,LOT_SUFFIX_CURRENT,	START_AUTO_LOT...`
  - **[btnshow_Click - Line 123]**: `select sum(qty_dlyd) from jan_pur_listing where gate_no= '...`
  - **[btnshow_Click - Line 123]**: `SELECT SUM(QTY_DLYD) FROM JAN_PUR_LISTING WHERE GATE_NO= '" & DV(i)("GATE_NO...`
  - **[btnprint_Click - Line 206]**: `select count(*) from JAN_FIFO_LOTNO_DETAILS where ORGANIZATION_ID=" & dgv.Rows(i).Cells(9).Value & " and item_no='" & dg...`
  - **[btnprint_Click - Line 242]**: `select SYS_CONTEXT('USERENV','IP_ADDRESS') IP from DUAL...`
  - **[bntjob_Click - Line 295]**: `select y.*,case when PRINT_FLAG >0 then (select lot_no from JAN_FIFO_LOTNO_DETAILS where ref_id=y.wip_entity_id and orga...`
  - *(8 additional queries omitted for brevity. See [queries.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/queries.md) for full SQL list)*
##### Screen-Level Validations
  - **[btnshow_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("Select org", "FIFO")...`
  - **[btnshow_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[btnprint_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("No of packet should be greater than 0")...`
  - **[bntjob_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("Select org", "FIFO")...`
  - **[bntjob_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[btn_jstk_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("No of packet should be greater than 0")...`
- **Suggested React Component**: `fifo_stickerDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: gacc
- **Source File**: [gacc.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/gacc.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - **Buttons**: `Button4, Button1`
  - **Input Fields**: `TextBox1, txtrole`
  - **Data Grids / Tables**: `dgv`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - **[Button4_Click - Line 10]**: `select gate_no,gdate,supplier_name,dc_no,dc_date,gtype,vehicle_det ,inv_category,case when validated=1 then 'Gate' when ...`
  - **[Button1_Click - Line 39]**: `select MIN(GATE_NO),MAX(GATE_NO),count(*)cnt,SUM(CASE WHEN GTYPE='PO' THEN 1 ELSE 0 END) PO_CNT,SUM(cASE WHEN GTYPE='OSP...`
  - **[Button1_Click - Line 108]**: `select count(*),inv_category from jan_Gate_header a where  a.gdate>=TO_DATE('" & Format(inwdtf.Value, "dd/MM/yyyy") & " ...`
##### Screen-Level Validations
  - No formal validations or popup alert conditions captured on this screen.
- **Suggested React Component**: `gaccDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: gate_lot_print
- **Source File**: [gate_lot_print.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/gate_lot_print.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - **Buttons**: `btnprint, btnshow`
  - **Input Fields**: `txtgno`
  - **Dropdown Selectors**: `cmborg, cmbtype`
  - **Data Grids / Tables**: `dgv`
  - **Checkboxes**: `chkpend`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - No database queries executed on this screen.
##### Screen-Level Validations
  - **[btnshow_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
- **Suggested React Component**: `gate_lot_printDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: gatelist
- **Source File**: [gatelist.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/gatelist.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - **Buttons**: `btngo`
  - **Input Fields**: `txtpo, txtitem`
  - **Data Grids / Tables**: `dgv1, dgv2, dgv3`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - **[btngo_Click - Line 18]**: `select  gate_no,receipt_num,receipt_date,pono,podt,item_description,quantity_received,qty_appd,inv_no from jan_pur_listi...`
  - **[btngo_Click - Line 24]**: `select description,pono,podt,po_qty,recd,po_pend,gate_receipt from jan_po_pending_bought_outs where pono='" & txtpo.Text...`
  - **[btngo_Click - Line 30]**: `select gatE_no,pono,podt,description,popend,supdcqty from jan_gatE_lines where type='PO' and   pono='" & txtpo.Text & "'...`
  - **[btngo_Click - Line 37]**: `select gate_no,receipt_num,receipt_date,pono,podt,partname as item_description,quantity_received,qty_appd,inv_no from ja...`
  - **[btngo_Click - Line 43]**: `select partname as description,pono,podt,po_qty,recd,po_pend,gate_receipt from jan_po_pending_osp where partno='" & txti...`
  - **[btngo_Click - Line 49]**: `select gate_no,pono,podt,description,popend,supdcqty from jan_gatE_lines where type='OSP' and  pono='" & txtpo.Text & "'...`
##### Screen-Level Validations
  - **[btngo_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
- **Suggested React Component**: `gatelistDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: gatestatus
- **Source File**: [gatestatus.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/gatestatus.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - **Buttons**: `Button2, Button5, Button1`
  - **Dropdown Selectors**: `cmborder, ComboBox1`
  - **Checkboxes**: `CheckBox1`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - **[Button5_Click - Line 274]**: `select * from   a    where  a.gdate>=TO_DATE('" & Format(inwdtf.Value, "dd/MM/yyyy") & " 00:00:00','DD/MM/YYYY HH24:MI:S...`
##### Screen-Level Validations
  - No formal validations or popup alert conditions captured on this screen.
- **Suggested React Component**: `gatestatusDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: gt_checked
- **Source File**: [gt_checked.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/gt_checked.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - **Buttons**: `btngo, btnpack`
  - **Input Fields**: `txtqty, txtgate, txt_oth, txtshtr, cmbchk1, txtchk, txtpqty, txtstby`
  - **Dropdown Selectors**: `cmborg, cmbitem, cmbpack, cmbpitem`
  - **Data Grids / Tables**: `dgvpack`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - **[gt_checked_Load - Line 13]**: `select organization_code  from MTL_PARAMETERS where organization_id in (select org_id from jan_gatE_lines where gate_no=...`
  - **[gt_checked_Load - Line 31]**: `select  item,sum(supdcqty)qty  from jan_gate_lines where  gate_no=" & txtgate.Text & "  group by item...`
  - **[gt_checked_Load - Line 48]**: `select count(*) from jan_gate_lines where  gate_no=" & txtgate.Text & "  and item_check_by is not null...`
  - **[gt_checked_Load - Line 55]**: `select item_check_by,CHECKED_BY   from jan_gate_lines where  gate_no=" & txtgate.Text & "  and rownum=1...`
  - **[gt_checked_Load - Line 64]**: `select ITEM_NO, GATE_QTY, PACK_METHOD, NO_OF_PACK, PACK_QTY, pack_qty total_qty , STATUS from jan_gate_pack_Details a wh...`
  - **[btngo_Click - Line 101]**: `select count(*)  from jan_gate_lines where  gate_no=" & txtgate.Text & "  and item_check_by is not null...`
  - *(13 additional queries omitted for brevity. See [queries.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/queries.md) for full SQL list)*
##### Screen-Level Validations
  - **[btngo_Click]**: Condition `If ds.Tables("namecnt").Rows(0).Item(0) = 0 Then` triggers message alert `MessageBox.Show("Invalid Name", "Gate Register")...`
  - **[btngo_Click]**: Condition `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` triggers message alert `MessageBox.Show("Start time For Item Counting Saved", "Gate Register")...`
  - **[btngo_Click]**: Condition `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` triggers message alert `MessageBox.Show("Item Checked Details Added", "Gate Entry")...`
  - **[btngo_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("Enter location To proceed", "Gate Entry")...`
  - **[txtshtr_Leave]**: Condition `If txtshtr.Text > gqty Then` triggers message alert `MessageBox.Show("Shortage Qty entered is more than received qty for the line,correct qty and proceed", "Gate Register")...`
  - **[btnpack_Click]**: Condition `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` triggers message alert `MessageBox.Show(ex.Message)...`
- **Suggested React Component**: `gt_checkedDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: headerval
- **Source File**: [headerval.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/headerval.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - **Buttons**: `btnsave`
  - **Dropdown Selectors**: `rea1, rea2`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - No database queries executed on this screen.
##### Screen-Level Validations
  - **[btnsave_Click]**: Condition `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` triggers message alert `MessageBox.Show("Validate Values Saved", "Gate Register")...`
- **Suggested React Component**: `headervalDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: kanban_scan
- **Source File**: [kanban_scan.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/kanban_scan.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - **Buttons**: `Button1, Button2`
  - **Input Fields**: `txtitem`
  - **Dropdown Selectors**: `cmborg, cmbsup, cmbcat`
  - **Data Grids / Tables**: `dgv`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - **[kanban_scan_Load - Line 69]**: `select REPLACE(vendor_name,'''','''''')supplier,vendor_id from po_vendors where vendor_type_lookup_code <>'EMPLOYEE' AND...`
  - **[kanban_scan_Load - Line 76]**: `select organization_code  from jan_organization_list_view where unit_name='UNIT7' order by organization_code...`
  - **[Button2_Click - Line 106]**: `select kanban_card_number,jan_itemname(inventory_item_id)item_no,jan_itemdesc(jan_itemname(inventory_item_id)) item_Desc...`
##### Screen-Level Validations
  - No formal validations or popup alert conditions captured on this screen.
- **Suggested React Component**: `kanban_scanDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: minmax
- **Source File**: [minmax.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/minmax.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - **Buttons**: `btngo, btnpri, btngo1, btnpri1`
  - **Input Fields**: `txtitem, txtitem1`
  - **Dropdown Selectors**: `cmborg, cmbitem, cmbtyp, cmbinv, cmbfc, cmborg1`
  - **Data Grids / Tables**: `dgmm, dgfc`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - **[btngo_Click - Line 284]**: `[s]   and  min_minmax_quantity >  (nvl(on_hand,0)+nvl(decode(conversion_Rate,null,(1*po_pend),(po_pend* conversion_rate)...`
##### Screen-Level Validations
  - **[btngo_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[dgmm_CellFormatting]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.StackTrace)...`
  - **[btngo1_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
- **Suggested React Component**: `minmaxDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: mmcard
- **Source File**: [mmcard.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/mmcard.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - **Buttons**: `btnprint, Button1, btnshow`
  - **Input Fields**: `txtgfm, txtgto, txtrole, txtgate`
  - **Dropdown Selectors**: `cmbven, cmborg`
  - **Data Grids / Tables**: `dgv1`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - **[mmcard_Load - Line 198]**: `select vendor_name from po_vendors where vendor_type_lookup_code <>'EMPLOYEE' order by vendor_name asc...`
  - **[mmcard_Load - Line 205]**: `select organization_code  from org_organization_definitions where organization_id not in(105,112 )order by organization_...`
  - **[btnshow_Click - Line 679]**: `(select   a.gate_no,a.ORG, C.item_NO,C.ITEM_description description,C.pono,substr(supplier_name,0,30)sup ,SUM(c.quantity...`
##### Screen-Level Validations
  - **[Button1_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message, " GATE")...`
- **Suggested React Component**: `mmcardDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: newreport
- **Source File**: [newreport.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/newreport.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - **Buttons**: `btnconsolidate, btnfm, btnto, btndaily, btncancel, btnrtv, btnpoamend, btninward, btntime, btnadi, btnurg, btnskip, Button1, btngt, btnlong, btnper, xerox, delayaccount, adimanual, btninv, btnprep, btnm2o, btnvallist`
  - **Input Fields**: `txtfm, txtto, txtrole, txt_miss, txtgfm, txtgto, TextBox1`
  - **Dropdown Selectors**: `cmbsup, cmborg`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - No database queries executed on this screen.
##### Screen-Level Validations
  - **[btnconsolidate_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[btndaily_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[btncancel_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[btnrtv_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[btnpoamend_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[btninward_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
- **Suggested React Component**: `newreportDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: non-po
- **Source File**: [non-po.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/non-po.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - **Buttons**: `btnsave, btnrep, btnprint`
  - **Input Fields**: `txtsup, txtdcno, txtveh, txtgno, txtrole, txtogno, txtper, txtjper, txtbin, TextBox1`
  - **Dropdown Selectors**: `cmbcat, cmbsup, cmbres, ddltranp, ddldept, ComboBox1`
  - **Checkboxes**: `chknon, chkogt`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - **[btnsave_Click - Line 15]**: `SELECT TO_CHAR(JAN_FYR_DATE,'yyyy') FROM DUAL...`
  - **[btnsave_Click - Line 26]**: `select jan_GATE_NO_SEQ.NEXTVAL FROM DUAL...`
  - **[btnsave_Click - Line 41]**: `select NVL(MAX(gate_no),0)GATE_NO from jan_gate_header WHERE UNIT='POLYMER'  AND GDATE>JAN_FYR_DATE...`
  - **[btnsave_Click - Line 61]**: `select NVL(MAX(gate_no),0)GATE_NO from jan_gate_header WHERE UNIT='SKYFAST'  AND GDATE>JAN_FYR_DATE...`
  - **[btnsave_Click - Line 81]**: `select NVL(MAX(gate_no),0)GATE_NO from jan_gate_header WHERE UNIT='UNIT1'  AND GDATE>JAN_FYR_DATE...`
  - **[btnsave_Click - Line 103]**: `select NVL(MAX(gate_no),0)GATE_NO from jan_gate_header WHERE UNIT='SPM'  AND GDATE>JAN_FYR_DATE...`
  - *(9 additional queries omitted for brevity. See [queries.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/queries.md) for full SQL list)*
##### Screen-Level Validations
  - **[btnsave_Click]**: Condition `If ds.Tables("resultab").Rows(0).Item(0) > 0 Then` triggers message alert `MessageBox.Show("DCNo already available for the supplier", "Gate Entry")...`
  - **[btnsave_Click]**: Condition `If cmbcat.SelectedIndex = 0 And txtbin.Text = "" Then` triggers message alert `MessageBox.Show("Enter Bin Qty and Proceed", "Gate Entry")...`
  - **[btnsave_Click]**: Condition `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` triggers message alert `MessageBox.Show("Saved Successfully !!-Gate Number is: " & txtgno.Text & "", "Gate Entry")...`
- **Suggested React Component**: `non-poDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: operation_eod_exception
- **Source File**: [operation_eod_exception.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/operation_eod_exception.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - **Data Grids / Tables**: `DataGridView1, DataGridView2, DataGridView3`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - **[operation_eod_exception_Load - Line 14]**: `["select PROC_ID,MAJOR_PROCESS,PROCESSNAME,PROCESS_DESCRIPTION,PHASE_OF_IMPLEMENTATION_OF_V2K_INITIATIVES,nvl(eod_id,exc...`
  - **[DataGridView1_CellClick - Line 55]**: `select process_id,(select process_name from jan_eod_process_master where idno=a.process_id and rownum=1)process_name,cou...`
  - **[DataGridView3_CellClick - Line 70]**: `select  org,item_no,item_Desc,vendor_name,ref_id,ref_dt,target_date,responsible_person from jan_eod_excel_list a  where ...`
  - **[DataGridView3_CellClick - Line 87]**: `select jan_orgcode(org_id)org,jan_itemname(item_id)item_no,jan_itemdesc(jan_itemname(item_id))item_desc,job_qty  from ja...`
##### Screen-Level Validations
  - No formal validations or popup alert conditions captured on this screen.
- **Suggested React Component**: `operation_eod_exceptionDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: pocheck
- **Source File**: [pocheck.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/pocheck.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - **Buttons**: `btngo, BTLCALTAX, btnsave, Button3`
  - **Input Fields**: `txtpo, txtpodate, txtvendor, txtlocation, txt1, TXTITEM, TXTPQTY, TXTPOOSP, TXTGNO, txtdc, txtrate, txtrole, txtline, txtvendorid, txtcur`
  - **Data Grids / Tables**: `dgv1, dgv2, dgv3, dgvtax, dgvtaxdetails`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - **[btngo_Click - Line 43]**: `SELECT B.pono,B.po_date,B.vendor_name,B.sh_location,B.line_type,A.item ,B.item_description,B.uom,B.line_qty,b.pend_qty,A...`
  - **[btngo_Click - Line 57]**: `SELECT B.pono,B.po_date,B.vendor_name,B.sh_location,B.line_type,A.item ,B.item_description,B.uom,B.line_qty,b.pend_qty,A...`
  - **[btngo_Click - Line 76]**: `select  b.pono,B.need_by_date,B.approved_flag ,to_char(B.approved_date,'dd/mm/yyyy') approved_date,B.PRICE from jan_po_p...`
  - **[pocheck_Load - Line 177]**: `select  SUM(NVL(freigHt,0))FREIGHT,SUM(NVL(rate,0))RATE from jan_gatE_lines where   gatE_no='" & TXTGNO.Text & "'...`
  - **[pocheck_Load - Line 190]**: `update jan_gate_header set dcval='" & lbldctotval.Text & "' where gate_no=" & TXTGNO.Text & "...`
  - **[pocheck_Load - Line 197]**: `update jan_gate_header set dcval='" & lbldctotval.Text & "' where gate_no=" & TXTGNO.Text & "...`
  - *(9 additional queries omitted for brevity. See [queries.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/queries.md) for full SQL list)*
##### Screen-Level Validations
  - **[btngo_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.ToString)...`
  - **[BTNCALTAX_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message, "Gate Entry")...`
  - **[btnsave_Click]**: Condition `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` triggers message alert `MessageBox.Show("Rate Values added", "Gate Register")...`
- **Suggested React Component**: `pocheckDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: pocheck.designer
- **Source File**: [pocheck.designer.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/pocheck.designer.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - No interactive controls found.
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - No database queries executed on this screen.
##### Screen-Level Validations
  - No formal validations or popup alert conditions captured on this screen.
- **Suggested React Component**: `pocheck.designerDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: qc_block
- **Source File**: [qc_block.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/qc_block.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - **Data Grids / Tables**: `dgvlist`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - No database queries executed on this screen.
##### Screen-Level Validations
  - No formal validations or popup alert conditions captured on this screen.
- **Suggested React Component**: `qc_blockDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: receipt-prepared
- **Source File**: [receipt-prepared.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/receipt-prepared.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - **Buttons**: `btngo, btnprint`
  - **Dropdown Selectors**: `gtype, cmborg`
  - **Data Grids / Tables**: `dgv, dgv1`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - No database queries executed on this screen.
##### Screen-Level Validations
  - **[receipt_prepared_Load]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[btngo_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[btnprint_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
- **Suggested React Component**: `receipt-preparedDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: rtvreason
- **Source File**: [rtvreason.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/rtvreason.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - **Buttons**: `btnsave, btnupdt, btndel`
  - **Input Fields**: `txttrans, txtamt, txtterm, txtwt, txtqty, txtdoc, txtgate, txtremark`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - No database queries executed on this screen.
##### Screen-Level Validations
  - **[btnsave_Click]**: Condition `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` triggers message alert `MessageBox.Show("RTV Details saved for " & txtgate.Text & "", "Gate Register")...`
  - **[btncan_Click]**: Condition `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` triggers message alert `MessageBox.Show(" RTV Details for " & txtgate.Text & " Updated", "Gate Register")...`
  - **[btndel_Click]**: Condition `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` triggers message alert `MessageBox.Show(" RTV Details for " & txtgate.Text & " Deleted", "Gate Register")...`
- **Suggested React Component**: `rtvreasonDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: suplist
- **Source File**: [suplist.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/suplist.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - **Buttons**: `btnsave, btncan`
  - **Input Fields**: `txtitem, txtname`
  - **Dropdown Selectors**: `cmbsup`
  - **Checkboxes**: `sealed`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - No database queries executed on this screen.
##### Screen-Level Validations
  - **[btnsave_Click]**: Condition `If cmbsup.SelectedItem <> "" And txtitem.Text <> "" And txtname.Text <> "" Then` triggers message alert `MessageBox.Show("Enter Supplier,Item no,follower name", "Gate Register")...`
  - **[btnsave_Click]**: Condition `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` triggers message alert `MessageBox.Show("Supplier Details added", "Gate Register")...`
  - **[btncan_Click]**: Condition `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` triggers message alert `MessageBox.Show("Urgent List deleted", "Gate Register")...`
- **Suggested React Component**: `suplistDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

#### Screen: valreason
- **Source File**: [valreason.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/valreason.vb)
- **Purpose**: Unused / Blank Form Template
##### UI Controls & Components
  - **Buttons**: `save, cancel`
  - **Input Fields**: `gate, line, reason`
- **Navigation**: Terminal window (no sub-screens opened).
##### Database Queries Triggered
  - No database queries executed on this screen.
##### Screen-Level Validations
  - **[save_Click]**: Condition `If reason.Text <> "" Then` triggers message alert `MessageBox.Show("Reason Saved", "Gate Entry")...`
  - **[save_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("Enter Reason", "Gate Entry")...`
  - **[save_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
- **Suggested React Component**: `valreasonDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

---

## Business Rules

Source file: `/Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Project Analysis/business-rules.md`

### Business Rules and Conditions

This document compiles the core business logic, workflows, transitions, role-based checks, and UI rules discovered across the codebase.

#### 1. System-Wide Workflows & Status Transitions

##### Gate Entry Validation Flow
1. **Creation**: Gate entries are created via `Add.vb` or `non-po.vb` or ASN download via `adi.vb`.
2. **Validation Flag**: Toggled in Oracle table `JAN_GATE_HEADER` via field `VALIDATED`:
   - `VALIDATED = 0` -> Validated / Approved
   - `VALIDATED = 1` -> Created at Gate
   - `VALIDATED = 2` -> Validation Pending / Not Validated
   - `VALIDATED = 4` -> RTV (Return to Vendor) Entry
   - `VALIDATED = 5` -> Formally Validated by Supervisor
   - `VALIDATED = 6` -> Created without reference

##### E-Invoice & E-way Bill Validation Rule
- **Source**: `Validate.vb` -> `BTNOK_Click`
- **Rule**: If a vendor is registered in `JAN_GATE_EINVOICE_VENDOR` (meaning they must provide e-invoices), the system verifies the invoice value from the Oracle record (`DCVAL` / `INVOICE_VAL`). If it is above 100,000 INR (derived from GST State check rules) and is an interstate purchase (checking Supplier GST vs local Org GST), the validator must enforce an E-way bill number entry. If missing, it blocks validation showing:
  - `"Tick E-invoice Supplier and proceed"`
  - `"Enter Supplier E-way bill No and proceed"`
  - `"Enter E-way Bill No and proceed"`

---

#### 2. Dynamic UI Toggle Rules (Show / Hide / Enable / Disable)

##### Screen: Add
**Source File Path**: `Gate Entry/Add.vb`

- **Method/Event**: `clear`
  - **Rule/Condition**: `If txtadirea.Visible = True Then Label17.Visible = False : txtadirea.Visible = False`
- **Method/Event**: `cmbsup_SelectedIndexChanged`
  - **Rule/Condition**: `Label15.Visible = True`
- **Method/Event**: `cmbtype_SelectedIndexChanged`
  - **Rule/Condition**: `If cmbtype.SelectedItem = "PO" Then Label16.Visible = True : txtinv.Visible = True`
- **Method/Event**: `addnew`
  - **Rule/Condition**: `If txtadirea.Visible = True Then cl.sql &= " ,adi_reason" ''''for manual ADI entry`
- **Method/Event**: `addnew`
  - **Rule/Condition**: `If txtadirea.Visible = True Then cl.sql &= " ,'" & txtadirea.Text & "'" ''''for manual ADI entry`
- **Method/Event**: `addnew`
  - **Rule/Condition**: `If txtper.Visible = True Then`
- **Method/Event**: `btnmod_Click`
  - **Rule/Condition**: `If ds.Tables("resultab").Rows(0).Item("ADI_REASON").ToString <> "" Then Label17.Visible = True : txtadirea.Visible = True : txtadirea.Text = ds.Tables("resultab").Rows(0).Item("ADI_REASON")`
- **Method/Event**: `updt`
  - **Rule/Condition**: `If txtadirea.Visible = True Then cl.sql &= " ,ADI_REASON= '" & txtadirea.Text & "'"`
- **Method/Event**: `txtdcno_Leave`
  - **Rule/Condition**: `If ds1.Tables("resultab").Rows.Count > 0 Then Label17.Visible = True : txtadirea.Visible = True`
- **Method/Event**: `Add_Load`
  - **Rule/Condition**: `'    Label20.Visible = True : Label21.Visible = True : Label22.Visible = True : Label23.Visible = True : Label24.Visible = True : cmbcr.Visible = True : txtpod.Visible = True : txtpodwt.Visible = True : txtbox.Visible = True : txtrwt.Visible = True`
- **Method/Event**: `Add_Load`
  - **Rule/Condition**: `cmbres.Visible = True`
- **Method/Event**: `Add_Load`
  - **Rule/Condition**: `'If txtrole.Text = "UNIT7" Or txtrole.Text = "U7_ADD" Or txtrole.Text = "ADD" Or txtrole.Text = "SKYFAST" Or txtrole.Text = "SKY_ADD" Or txtrole.Text = "JAPL" Then chkogt.Visible = True : Else chkogt.Visible = False`
- **Method/Event**: `Add_Load`
  - **Rule/Condition**: `If txttype.Text = "PO" Then Label16.Visible = True : txtinv.Visible = True`
- **Method/Event**: `Add_Load`
  - **Rule/Condition**: `'    If txtrole.Text = "UNIT1" Or txtrole.Text = "INWARD" Then Label10.Visible = True : Label13.Visible = True : Label14.Visible = True : cmborg.Visible = True : txtref.Visible = True : cmbrea.Visible = True`

##### Screen: Gate
**Source File Path**: `Gate Entry/Gate.vb`

- **Method/Event**: `Gate_Load`
  - **Rule/Condition**: `If OP_ID = 103 Then job_shrt.Visible = True`
- **Method/Event**: `Gate_Load`
  - **Rule/Condition**: `'            btnadd.Enabled = False ' Gate.btnvou.Enabled = False`
- **Method/Event**: `Gate_Load`
  - **Rule/Condition**: `'                mmcarcl.ds.Visible = True`
- **Method/Event**: `btnadd_Click`
  - **Rule/Condition**: `ADD.txtgno.Visible = False`
- **Method/Event**: `btnval_Click`
  - **Rule/Condition**: `'            btnval.Enabled = False`
- **Method/Event**: `btnval_Click`
  - **Rule/Condition**: `'                If DR = Windows.Forms.DialogResult.Yes Then btnval.Enabled = True : val()`
- **Method/Event**: `btnval_Click`
  - **Rule/Condition**: `'                If DR = Windows.Forms.DialogResult.No Or DR = Windows.Forms.DialogResult.Cancel Then btnval.Enabled = False`
- **Method/Event**: `dgv_CellClick`
  - **Rule/Condition**: `'        btndel.Enabled = False`
- **Method/Event**: `dgv_CellClick`
  - **Rule/Condition**: `'    If cl.ds.Tables("resultab").Rows.Count > 0 Then btnval.Enabled = False : DR = MessageBox.Show("Gate No : " & dgv.Rows(i).Cells(0).Value & " can't be validated", "Gate Register", MessageBoxButtons.YesNoCancel)`
- **Method/Event**: `dgv_CellClick`
  - **Rule/Condition**: `'        btnval.Enabled = True`
- **Method/Event**: `dgv_CellClick`
  - **Rule/Condition**: `'        btnval.Enabled = False`
- **Method/Event**: `dgv_CellClick`
  - **Rule/Condition**: `'    If cl.ds.Tables("resultab").Rows.Count > 0 Then btnval.Enabled = False Else btnval.Enabled = True`
- **Method/Event**: `dgv_CellClick`
  - **Rule/Condition**: `'            Label29.Visible = True`
- **Method/Event**: `dgv_CellClick`
  - **Rule/Condition**: `'    Label29.Visible = False`
- **Method/Event**: `dgv_CellClick`
  - **Rule/Condition**: `btndel.Enabled = False`
- **Method/Event**: `lbupdt_LinkClicked`
  - **Rule/Condition**: `' If txtrole.Text = "UNIT2" Then GateUpdate.btndel.Enabled = False`

##### Screen: GateUpdate
**Source File Path**: `Gate Entry/GateUpdate.vb`

- **Method/Event**: `GateUpdate_Load`
  - **Rule/Condition**: `btndel.Visible = False`
- **Method/Event**: `GateUpdate_Load`
  - **Rule/Condition**: `cmbres.Visible = True`

##### Screen: Login
**Source File Path**: `Gate Entry/Login.vb`

- **Method/Event**: `Button1_Click`
  - **Rule/Condition**: `Gate.btnadd.Enabled = False ' Gate.btnvou.Enabled = False`
- **Method/Event**: `Button1_Click`
  - **Rule/Condition**: `If c = "U7" Or c = "U7VIEW" Then Gate.btnmod.Enabled = True Else Gate.btnmod.Enabled = False`
- **Method/Event**: `Button1_Click`
  - **Rule/Condition**: `If c = "U7_VIEW" Then Gate.btnitem.Enabled = True : Gate.lbupdt.Visible = True`
- **Method/Event**: `Button1_Click`
  - **Rule/Condition**: `'  If c = "USER" Or c = "USER1" And (ip = "192.168.12.157" Or ip = "192.168.0.178" Or ip = "192.168.12.11") Then Gate.btnxs.Visible = True`
- **Method/Event**: `Button1_Click`
  - **Rule/Condition**: `Gate.btnadd.Enabled = False ' Gate.btnvou.Enabled = False`
- **Method/Event**: `Button1_Click`
  - **Rule/Condition**: `Gate.btnadd.Enabled = False ' Gate.btnvou.Enabled = False`
- **Method/Event**: `Button1_Click`
  - **Rule/Condition**: `Gate.btnadd.Enabled = False ' Gate.btnvou.Enabled = False`
- **Method/Event**: `Button1_Click`
  - **Rule/Condition**: `Gate.txtlog.Text = txtuser.Text : Gate.mmcard.Visible = True`
- **Method/Event**: `Button1_Click`
  - **Rule/Condition**: `If c = "U7_ADD" Then Gate.btnsta.Enabled = True`
- **Method/Event**: `Button1_Click`
  - **Rule/Condition**: `'Gate.btnvou.Enabled = False : Gate.btngtlot.Visible = True`

##### Screen: Validate
**Source File Path**: `Gate Entry/Validate.vb`

- **Method/Event**: `VALIDATE_Load`
  - **Rule/Condition**: `If gtpur = "Entry" Or txtrole.Text = "U7_VIEW" Then btnok.Visible = True Else btnok.Visible = False`
- **Method/Event**: `VALIDATE_Load`
  - **Rule/Condition**: `'  If control = "VIEW" Then btnok.Visible = False Else btnok.Visible = True`
- **Method/Event**: `VALIDATE_Load`
  - **Rule/Condition**: `'    rbtnv.Enabled = False`
- **Method/Event**: `VALIDATE_Load`
  - **Rule/Condition**: `'    GroupBox1.Enabled = False`
- **Method/Event**: `VALIDATE_Load`
  - **Rule/Condition**: `'        btnok.Visible = True`

##### Screen: adi
**Source File Path**: `Gate Entry/adi.vb`

- **Method/Event**: `adi_Load`
  - **Rule/Condition**: `chkoadi.Visible = True`

##### Screen: excess-release
**Source File Path**: `Gate Entry/excess-release.vb`

- **Method/Event**: `excess_release_Load`
  - **Rule/Condition**: `'    If  And (Or ip = "192.168.0.178") Then btnsave.Enabled = True Else btnsave.Enabled = False Or ip = "192.168.13.11"`
- **Method/Event**: `Label5_Click`
  - **Rule/Condition**: `dgv.Rows(i).Visible = True`

##### Screen: fifo_sticker
**Source File Path**: `Gate Entry/fifo_sticker.vb`

- **Method/Event**: `fifo_sticker_Load`
  - **Rule/Condition**: `If orgid.Contains("I23") = True Then chkptc.Visible = True Else chkptc.Visible = False`

##### Screen: gt_checked
**Source File Path**: `Gate Entry/gt_checked.vb`

- **Method/Event**: `gt_checked_Load`
  - **Rule/Condition**: `GroupBox3.Visible = True`
- **Method/Event**: `txtchk_Leave`
  - **Rule/Condition**: `'    txt_oth.Visible = True`

##### Screen: non-po
**Source File Path**: `Gate Entry/non-po.vb`

- **Method/Event**: `btnsave_Click`
  - **Rule/Condition**: `If txtper.Visible = True Then`
- **Method/Event**: `non_po_Load`
  - **Rule/Condition**: `cmbres.Visible = True`
- **Method/Event**: `non_po_Load`
  - **Rule/Condition**: `chkogt.Visible = True`
- **Method/Event**: `chknon_CheckedChanged`
  - **Rule/Condition**: `txtsup.Visible = True`

##### Screen: pocheck
**Source File Path**: `Gate Entry/pocheck.vb`

- **Method/Event**: `btngo_Click`
  - **Rule/Condition**: `lblcval.Visible = True`
- **Method/Event**: `pocheck_Load`
  - **Rule/Condition**: `Label17.Visible = False : Label23.Visible = False : txtrate.Visible = False : txtdc.Visible = False : btnsave.Visible = False : Label29.Visible = False : txtline.Visible = False`
- **Method/Event**: `dgv1_CellClick`
  - **Rule/Condition**: `Panel1.Visible = True`
- **Method/Event**: `dgv2_CellClick`
  - **Rule/Condition**: `.Columns(3).Visible = False`

##### Screen: suplist
**Source File Path**: `Gate Entry/suplist.vb`

- **Method/Event**: `rdadi_CheckedChanged`
  - **Rule/Condition**: `txtname.Enabled = False : txtitem.Enabled = False`

---

#### 3. Quantity and Date Calculations

##### Quantity Checking Validation
- **Source**: `Add.vb` -> `addnew`
- **Condition**: `If dgv1.Rows(i).Cells(8).Value <> "" And txtdcno.Text <> "" And Convert.ToDecimal(dgv1.Rows(i).Cells(8).Value) > Convert.ToDecimal(dgv1.Rows(i).Cells(6).Value)`
- **Rule**: Incoming DC Quantity (`Cells(8)`) cannot be greater than the Pending PO Quantity (`Cells(6)`). If it exceeds it, block saving and display: `"DcQty Greater Then Po Pend"`.

##### Received Weight Check (POD)
- **Source**: `Validate.vb` -> `BTNOK_Click`
- **Condition**: `select count(*) from jan_gate_header where gate_no = ... and po_wt is not null and rec_wt is null`
- **Rule**: If a gate entry represents a POD delivery with a pre-recorded PO weight, the supervisor cannot validate it unless the actual received weight has been entered. If missing, displays: `"Received Weight not entered for POD"`.

---

## Validations

Source file: `/Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Project Analysis/validations.md`

### Validations Documentation

This document lists the core transactional validations enforced during gate operations.

| Field / Control Name | Screen / Form | Validation Type | Validation Rule / Code Condition | Error Message Shown | Implementation Location | Target (Frontend/Backend) |
| --- | --- | --- | --- | --- | --- | --- |
| N/A | Add | Business Logic | `Value/Constraint Check` | `'  MessageBox.Show(cl.sql)` | `cmbsup_SelectedIndexChanged` | Frontend |
| N/A | Add | Business Logic | `If ds.Tables("VALID").Rows(0).Item("cnt") >= 0 Then` | `MessageBox.Show("No Provision to add Manual Gate Entry ... ,ADI Required", "Gate Register")` | `cmbitem_SelectedIndexChanged` | Both |
| N/A | Add | Business Logic | `Value/Constraint Check` | `MessageBox.Show("No Provision to add Manual Gate Entry ... ,ADI Required", "Gate Register")` | `cmbitem_SelectedIndexChanged` | Frontend |
| N/A | Add | Business Logic | `Value/Constraint Check` | `MessageBox.Show("Vendor Not in Exempted list", "Gate Register")` | `cmbitem_SelectedIndexChanged` | Frontend |
| N/A | Add | Business Logic | `Value/Constraint Check` | `' MessageBox.Show("Vendor Not in Exempted list", "Gate Register")` | `cmbitem_SelectedIndexChanged` | Frontend |
| N/A | Add | Business Logic | `Value/Constraint Check` | `'        MessageBox.Show("No Gate Entry is allowed for the PO " & f & " ", "Gate Register")` | `cmbpo_SelectedIndexChanged` | Frontend |
| N/A | Add | Business Logic | `Value/Constraint Check` | `'        MessageBox.Show("No Gate Entry is allowed for the PO " & f & " ", "Gate Register")` | `cmbpo_SelectedIndexChanged` | Frontend |
| N/A | Add | Business Logic | `Value/Constraint Check` | `MessageBox.Show("Select Next Row", "Gate Entry")` | `cmbpo_SelectedIndexChanged` | Frontend |
| N/A | Add | Business Logic | `Value/Constraint Check` | `'        MessageBox.Show("Select Next Row", "Gate Entry")` | `cmbpo_SelectedIndexChanged` | Frontend |
| N/A | Add | Business Logic | `Value/Constraint Check` | `'        MessageBox.Show("Receipt Made,Gate Can't be updated", "Gate Register")` | `btnsave_Click` | Frontend |
| N/A | Add | Business Logic | `Value/Constraint Check` | `'    MessageBox.Show("Enter Dcno,DCqty,Tariff No To Save Gate Values", "Gate Entry")` | `btnsave_Click` | Frontend |
| N/A | Add | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `btnsave_Click` | Frontend |
| N/A | Add | Business Logic | `If TextBox1.Text <> "" And txtdcno.Text <> "" Then '' And dgv1.Rows(0).Cells(22).Value <> ""` | `MessageBox.Show("Enter Dcno /supplier To Save Gate Values", "Gate Entry")` | `addnew` | Both |
| N/A | Add | Business Logic | `If ds1.Tables("resultab").Rows(i).Item("gate_no") = txtgno.Text Then` | `MessageBox.Show("Gate Number Already Exists!", "Gate Entry")` | `addnew` | Both |
| N/A | Add | Business Logic | `If ds.Tables("resultab").Rows(0).Item(0) > 0 Then` | `MessageBox.Show("DCNo already available for the supplier", "Gate Entry")` | `addnew` | Frontend |
| N/A | Add | Business Logic | `If dgv1.Rows(i).Cells(0).Value <> "" And txtdcno.Text <> "" And dgv1.Rows(i).Cells(8).Value <> "" And Convert.ToDecimal(dgv1.Rows(i).Cells(8).Value) > Convert.ToDecimal(dgv1.Rows(i).Cells(6).Value) Then` | `MessageBox.Show("DcQty Greater Then Po Pend", "Gate Entry")` | `addnew` | Both |
| N/A | Add | Business Logic | `Value/Constraint Check` | `'MessageBox.Show("Saved Successfully !!-Gate Number is: " & head & "", "Gate Entry")` | `addnew` | Frontend |
| N/A | Add | Business Logic | `Value/Constraint Check` | `MessageBox.Show("Saved Successfully !!-Gate Number is: " & txtgno.Text & "", "Gate Entry")` | `addnew` | Frontend |
| N/A | Add | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `btnmod_Click` | Frontend |
| N/A | Add | Business Logic | `Value/Constraint Check` | `MessageBox.Show("Gate Number is: " & txtgno.Text & " Updated", "Gate Entry")` | `updt` | Frontend |
| N/A | Add | Business Logic | `If b = True Then` | `MessageBox.Show("Gate Validated,Can't Add New Values", "Gate Entry")` | `updt` | Frontend |
| N/A | Add | Business Logic | `If b = True Then` | `MessageBox.Show(ex.Message)` | `updt` | Frontend |
| N/A | Add | Business Logic | `If scmcon2.State = ConnectionState.Closed Then scmcon2.Open()` | `MessageBox.Show("No Internet Connection !...")` | `chkadi` | Both |
| N/A | Add | Business Logic | `If mds.Tables("asn_det").Rows.Count > 0 Then` | `MessageBox.Show("ADI Entry Found for this DC No !..,")` | `chkadi` | Frontend |
| N/A | Add | Business Logic | `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` | `MessageBox.Show(ex.Message)` | `Add_Load` | Both |
| N/A | Add | Business Logic | `If dgv1.Rows(i).Cells(8).Value <> "" Then` | `': MessageBox.Show("Can't update DC Value", "Gate Register")` | `Add_Load` | Frontend |
| N/A | Add | Business Logic | `If FLG <> False Then` | `'  MessageBox.Show(cl.sql)` | `Add_Load` | Frontend |
| N/A | Class2 | Business Logic | `Value/Constraint Check` | `'  MsgBox(ex.Message)` | `dataacs` | Frontend |
| N/A | CycleCount | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.StackTrace)` | `btngo_Click` | Frontend |
| N/A | Gate | Business Logic | `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` | `MessageBox.Show(ex.Message, "GATE ENTRY")` | `Gate_Load` | Both |
| N/A | Gate | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `Gate_Load` | Frontend |
| N/A | Gate | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `btngo_Click` | Frontend |
| N/A | Gate | Business Logic | `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` | `dr = MessageBox.Show("Do You Want to delete?", "Gate Entry", MessageBoxButtons.YesNo, MessageBoxIcon.Exclamation)` | `btndel_Click` | Both |
| N/A | Gate | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `btndel_Click` | Frontend |
| N/A | Gate | Business Logic | `If IsDBNull(cl.ds.Tables("resultab").Rows(0).Item("dcval")) Then` | `MessageBox.Show("View Tax Values", "Gate Register")` | `btnval_Click` | Both |
| N/A | Gate | Business Logic | `Value/Constraint Check` | `'                Dim DR As DialogResult = MessageBox.Show("Diff between Invoice & DC Value is more than Rs.5", "Gate Register", MessageBoxButtons.YesNoCancel)` | `btnval_Click` | Frontend |
| N/A | Gate | Business Logic | `If ds.Tables("cnt").Rows(0).Item(0) > 0 Then` | `DR1 = MessageBox.Show("Do you want to start counting the item", "Gate Register", MessageBoxButtons.YesNo, MessageBoxIcon.Question)` | `dgv_CellClick` | Frontend |
| N/A | Gate | Business Logic | `Value/Constraint Check` | `'    If cl.ds.Tables("resultab").Rows.Count > 0 Then btnval.Enabled = False : DR = MessageBox.Show("Gate No : " & dgv.Rows(i).Cells(0).Value & " can't be validated", "Gate Register", MessageBoxButtons.YesNoCancel)` | `dgv_CellClick` | Frontend |
| N/A | Gate | Business Logic | `Value/Constraint Check` | `'    MessageBox.Show(ex.Message, "Gate Entry")` | `dgv_CellClick` | Frontend |
| N/A | Gate | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.ToString)` | `dgv_CellClick` | Frontend |
| N/A | Gate | Business Logic | `Value/Constraint Check` | `'        MessageBox.Show(ex.Message, "Gate Entry")` | `Global` | Frontend |
| N/A | Gate | Business Logic | `Value/Constraint Check` | `'    MessageBox.Show(ex.StackTrace, "Gate Entry")` | `dgv1_CellFormatting` | Frontend |
| N/A | Gate | Business Logic | `If Not IsDBNull(dgv.Rows(dgv.CurrentRow.Index).Cells(13).Value) And modify_Flag <> 1 Then` | `MessageBox.Show("Modifying the Gate No With ADI is not allowed", "Gate Entry")` | `btnmod_Click` | Both |
| N/A | Gate | Business Logic | `If cl.ds.Tables("resultab").Rows(0).Item(0) = "PO" And cl.ds.Tables("resultab").Rows(0).Item(1) > 0 Then` | `MessageBox.Show("Gate entry editing not allowed for Blanket suppliers")` | `btnmod_Click` | Both |
| N/A | Gate Status Login | Business Logic | `Value/Constraint Check` | `MessageBox.Show("Invalid Login", "Kardex")` | `btnlog_Click` | Frontend |
| N/A | GateUpdate | Business Logic | `If unit.Contains("SPM") = True And cmbres.Text <> "" Then` | `MessageBox.Show("Gate Value Updated", " Gate Register")` | `btnupdt_Click` | Both |
| N/A | GateUpdate | Business Logic | `If (dar.HasRows = True) Then` | `MessageBox.Show("Receipt Made,Gate Can't be updated", "Gate Register")` | `btndel_Click` | Frontend |
| N/A | GateUpdate | Business Logic | `Value/Constraint Check` | `MessageBox.Show("Gate No:  " & txtgate.Text & "deleted", "Gate Register")` | `btndel_Click` | Frontend |
| N/A | Gate_Password | Business Logic | `If CON.State = ConnectionState.Closed Then CON.Open()` | `MessageBox.Show("Password Changed", "Gate Register")` | `updt_Click` | Both |
| N/A | Gate_Password | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `updt_Click` | Frontend |
| N/A | Login | Business Logic | `If Not IsDBNull(.Item("modify_Flag")) Then modify_Flag = .Item("modify_Flag")` | `MessageBox.Show("Login Mismatch !!!", "Gate Register")` | `Button1_Click` | Both |
| N/A | Login | Business Logic | `Value/Constraint Check` | `'    ErrorProvider1.SetError(txtuser, "Invalid Username")` | `Button1_Click` | Frontend |
| N/A | Login | Business Logic | `Value/Constraint Check` | `'    ErrorProvider1.SetError(txtpwd, "Invalid Pwd")` | `Button1_Click` | Frontend |
| N/A | Login.designer | Business Logic | `Value/Constraint Check` | `Me.ErrorProvider1 = New System.Windows.Forms.ErrorProvider(Me.components)` | `InitializeComponent` | Frontend |
| N/A | Login.designer | Business Logic | `Value/Constraint Check` | `CType(Me.ErrorProvider1, System.ComponentModel.ISupportInitialize).BeginInit()` | `InitializeComponent` | Frontend |
| N/A | Login.designer | Business Logic | `Value/Constraint Check` | `'ErrorProvider1` | `InitializeComponent` | Frontend |
| N/A | Login.designer | Business Logic | `Value/Constraint Check` | `Me.ErrorProvider1.ContainerControl = Me` | `InitializeComponent` | Frontend |
| N/A | Login.designer | Business Logic | `Value/Constraint Check` | `CType(Me.ErrorProvider1, System.ComponentModel.ISupportInitialize).EndInit()` | `InitializeComponent` | Frontend |
| N/A | Login.designer | Business Logic | `Value/Constraint Check` | `Friend WithEvents ErrorProvider1 As System.Windows.Forms.ErrorProvider` | `Global` | Frontend |
| N/A | NOTVALIDATELIST | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.ToString)` | `btnshow_Click` | Frontend |
| N/A | NOTVALIDATELIST | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.ToString)` | `NOTVALIDATELIST_Load` | Frontend |
| N/A | NOTVALIDATELIST | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.ToString)` | `dgvdetails_CellClick` | Frontend |
| N/A | NOTVALIDATELIST | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.ToString)` | `btnprint_Click` | Frontend |
| N/A | PO_BLOCK | Business Logic | `Value/Constraint Check` | `' MessageBox.Show(sql)` | `PO_BLOCK_Load` | Frontend |
| N/A | PO_BLOCK | Business Logic | `If ds.Tables("RESULT").Rows.Count > 0 Then` | `'MessageBox.Show(ds.Tables("RESULT").Rows.Count)` | `PO_BLOCK_Load` | Frontend |
| N/A | Report | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `po_Click` | Frontend |
| N/A | Report | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `Button5_Click` | Frontend |
| N/A | Report | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `btngt_Click` | Frontend |
| N/A | Report | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `btnnval_Click` | Frontend |
| N/A | Report | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `btnnoref_Click` | Frontend |
| N/A | Status | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `Button5_Click` | Frontend |
| N/A | Validate | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message, "Gate Entry")` | `RBTNNV_CheckedChanged` | Frontend |
| N/A | Validate | Business Logic | `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` | `MessageBox.Show(.Item(0))` | `BTNOK_Click` | Both |
| N/A | Validate | Business Logic | `If dswt.Tables("cnt").Rows(0).Item(0) > 0 Then` | `MessageBox.Show("Received Weight not entered for POD", "Gate Entry")` | `BTNOK_Click` | Frontend |
| N/A | Validate | Business Logic | `If dsgt.Tables("gate_Cnt").Rows.Count <> dscnt.Tables("tax_cnt").Rows.Count Then` | `MessageBox.Show("Tax not available for all lines as in gate entry", "Gate Register")` | `BTNOK_Click` | Both |
| N/A | Validate | Business Logic | `If val = 0 And val1 = 0 Then` | `MessageBox.Show("Tick E-invoice Supplier and proceed", "Gate Register")` | `BTNOK_Click` | Frontend |
| N/A | Validate | Business Logic | `Value/Constraint Check` | `MessageBox.Show("Enter Supplier E-way bill No and proceed", "Gate Register")` | `BTNOK_Click` | Frontend |
| N/A | Validate | Business Logic | `If val = 0 And val2 = 1 And val1 = 0 And cmbval.SelectedIndex > 0 Then` | `MessageBox.Show("Select validated By and proceed validation", "Gate Register")` | `BTNOK_Click` | Both |
| N/A | Validate | Business Logic | `Value/Constraint Check` | `MessageBox.Show("Enter Item checked by details To proceed validation", "Gate Register")` | `BTNOK_Click` | Frontend |
| N/A | Validate | Business Logic | `Value/Constraint Check` | `MessageBox.Show("Tick E-invoice Supplier and proceed", "Gate Register")` | `BTNOK_Click` | Frontend |
| N/A | Validate | Business Logic | `Value/Constraint Check` | `MessageBox.Show("Enter E-way Bill No and proceed", "Gate Register")` | `BTNOK_Click` | Frontend |
| N/A | Validate | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message, "Gate Entry")` | `BTNOK_Click` | Frontend |
| N/A | Validate | Business Logic | `If txtgst.Text.ToString.Length = 12 And txtgst.Text <> "" Then` | `MessageBox.Show("Enter valid Eway bill no and proceed", "Gate Register")` | `valfun` | Both |
| N/A | Validate | Business Logic | `Value/Constraint Check` | `'        MessageBox.Show("Receipt Made,Validation Not allowed", "Gate Register")` | `valfun` | Frontend |
| N/A | Validate | Business Logic | `If a = True Then` | `MessageBox.Show("VALIDATED", "Gate Entry")` | `valfun` | Frontend |
| N/A | Validate | Business Logic | `If a = True Then` | `MessageBox.Show("REASON SAVED", "Gate Entry")` | `valfun` | Frontend |
| N/A | Validate | Business Logic | `Value/Constraint Check` | `MessageBox.Show("REASON SAVED", "Gate Entry")` | `valfun` | Frontend |
| N/A | Validate | Business Logic | `Value/Constraint Check` | `MessageBox.Show("ACTION ENTERED", "Gate Entry")` | `valfun` | Frontend |
| N/A | Validate | Business Logic | `Value/Constraint Check` | `'                MessageBox.Show("Excess Qty Inwarded Than Required Qty!!! Line Can't Be Validated", "Gate Register")` | `dgv1_CellClick` | Frontend |
| N/A | Voucher | Business Logic | `If cl.oracon.State = ConnectionState.Closed Then` | `MessageBox.Show("Voucher No Added", "Gate Entry")` | `Button1_Click` | Frontend |
| N/A | Voucher | Business Logic | `Value/Constraint Check` | `MessageBox.Show("Enter Voucher Number", "Gate Entry")` | `Button1_Click` | Frontend |
| N/A | Voucher | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `Button1_Click` | Frontend |
| N/A | adi | Business Logic | `If ds1.Tables("resultab").Rows(i).Item("gate_no") = txtgno.Text Then` | `MessageBox.Show("Gate Number Already Exists!", "Gate Entry")` | `btnsave_Click` | Both |
| N/A | adi | Business Logic | `If ds.Tables("resultab").Rows(i).Item("dc_no").ToString = txtdcno.Text Then` | `MessageBox.Show(sql, "Gate Entry")` | `btnsave_Click` | Both |
| N/A | adi | Business Logic | `Value/Constraint Check` | `'                MsgBox("Tariff No Not Empty !..")` | `btnsave_Click` | Frontend |
| N/A | adi | Business Logic | `If dgv1.Rows(i).Cells(0).Value <> "" And txtdcno.Text <> "" And dgv1.Rows(i).Cells(8).Value <> "" And Convert.ToDecimal(dgv1.Rows(i).Cells(8).Value) > Convert.ToDecimal(dgv1.Rows(i).Cells(6).Value) Then` | `MessageBox.Show("DcQty Greater Then Po Pend", "Gate Entry")` | `btnsave_Click` | Both |
| N/A | adi | Business Logic | `Value/Constraint Check` | `MessageBox.Show("Saved Successfully !!-Gate Number is: " & head & "", "Gate Entry")` | `btnsave_Click` | Frontend |
| N/A | adi | Business Logic | `If B = True Then` | `MessageBox.Show("Enter Dcno,DCqty,Remark To Save Gate Values", "Gate Entry")` | `btnsave_Click` | Frontend |
| N/A | adi | Business Logic | `If B = True Then` | `MessageBox.Show(ex.Message)` | `btnsave_Click` | Frontend |
| N/A | adi | Business Logic | `If dgv1.Rows(i).Cells(20).Value = TXT_ASN_NO.Text Then` | `MsgBox("This A D I No Already Exists !..,")` | `BUT_DWNLD_ASN_Click` | Both |
| N/A | adi | Business Logic | `If MDS.Tables("ASN_dET").Rows.Count = 0 Then` | `MsgBox("ADI Not Available!..,")` | `BUT_DWNLD_ASN_Click` | Frontend |
| N/A | adi | Business Logic | `If MDS.Tables("asn_det").Rows(0).Item("DELASN") = 1 Then` | `MsgBox("ADI Entry Deleted by Supplier/Vendor !..,")` | `BUT_DWNLD_ASN_Click` | Both |
| N/A | adi | Business Logic | `Value/Constraint Check` | `'                MsgBox("Without Process ADI !.." & vbNewLine & vbNewLine & vbNewLine & "PO : [ " & .Item("PONO").ToString & " ] Price Must be Zero !.." & vbNewLine & vbNewLine)` | `BUT_DWNLD_ASN_Click` | Frontend |
| N/A | adi | Business Logic | `Value/Constraint Check` | `'            MessageBox.Show("po pending not avail")` | `BUT_DWNLD_ASN_Click` | Frontend |
| N/A | adi | Business Logic | `Value/Constraint Check` | `'    '    MessageBox.Show("ADI has direct delivery items ,Amend the po and proceed")` | `BUT_DWNLD_ASN_Click` | Frontend |
| N/A | adi | Business Logic | `Value/Constraint Check` | `'        MessageBox.Show("ADI has items with need by date more than 1 month, Gate entry Can't be made get approval for inwarding the items")` | `BUT_DWNLD_ASN_Click` | Frontend |
| N/A | adi | Business Logic | `Value/Constraint Check` | `'        MessageBox.Show("Blanket schedule is more than 7 days, Gate entry Can't be made get approval for inwarding the items")` | `BUT_DWNLD_ASN_Click` | Frontend |
| N/A | adi | Business Logic | `Value/Constraint Check` | `'    '    MessageBox.Show("ADI has direct delivery items ,Amend the po and proceed")` | `BUT_DWNLD_ASN_Click` | Frontend |
| N/A | adi | Business Logic | `Value/Constraint Check` | `'        MessageBox.Show("Blanket schedule is more than 7 days, Gate entry Can't be made get approval for inwarding the items")` | `BUT_DWNLD_ASN_Click` | Frontend |
| N/A | adi | Business Logic | `If txtdcno.Text <> .Item("DC_NO") Then` | `MsgBox("Different Supplier DC Nos Occured !..," & vbNewLine & vbNewLine & "Rule : One Supplier DC No = One ASN No")` | `BUT_DWNLD_ASN_Click` | Frontend |
| N/A | adi | Business Logic | `Value/Constraint Check` | `MessageBox.Show("Select Next Row", "Gate Entry")` | `DWNLD_ASN` | Frontend |
| N/A | adi | Business Logic | `Value/Constraint Check` | `MessageBox.Show("Select Next Row", "Gate Entry")` | `DWNLD_ASN` | Frontend |
| N/A | adi | Business Logic | `If ASNCNT = 0 Then adcnt = 1` | `MessageBox.Show("Line no : " & adcnt & " in ADI is not in Pending purchase order")` | `DWNLD_ASN` | Frontend |
| N/A | adi | Business Logic | `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` | `MessageBox.Show(ex.Message)` | `adi_Load` | Both |
| N/A | adi | Business Logic | `If TXT_ASN_NO.Text <> "" Then` | `MsgBox(ex.Message)` | `adi_Load` | Frontend |
| N/A | adi_exemption | Business Logic | `If CON.State = ConnectionState.Closed Then CON.Open()` | `MessageBox.Show("Exemption for ADI Saved")` | `btngo_Click` | Both |
| N/A | cancelentry | Business Logic | `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` | `MessageBox.Show("Gate No Cancelled", "Gate Register")` | `Button1_Click` | Both |
| N/A | cancelentry | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.ToString)` | `Button1_Click` | Frontend |
| N/A | del | Business Logic | `If CON.State = ConnectionState.Closed Then` | `'MessageBox.Show("Delete Reason Saved", "Gate Entry")` | `Button1_Click` | Frontend |
| N/A | del | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `Button1_Click` | Frontend |
| N/A | eod | Business Logic | `Value/Constraint Check` | `MessageBox.Show("Exception Occured while releasing object " + ex.ToString())` | `releaseObject` | Frontend |
| N/A | eod | Business Logic | `Value/Constraint Check` | `MessageBox.Show("Over")` | `Button2_Click` | Frontend |
| N/A | excess-release | Business Logic | `Value/Constraint Check` | `MessageBox.Show("Remark Saved", "Gate Register")` | `btnsave_Click` | Frontend |
| N/A | excess-release | Business Logic | `Value/Constraint Check` | `MessageBox.Show("Enter Remark", "Gate Register")` | `btnsave_Click` | Frontend |
| N/A | excess-release | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `btnsave_Click` | Frontend |
| N/A | excess-release | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `Button1_Click` | Frontend |
| N/A | excess-release | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `dgv_CellClick` | Frontend |
| N/A | excess-release | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `BTNPRINT_Click` | Frontend |
| N/A | fifo_login | Business Logic | `Value/Constraint Check` | `MessageBox.Show("Invalid Login", "FIFO Sticker Print")` | `bnlogin_Click` | Frontend |
| N/A | fifo_sticker | Business Logic | `Value/Constraint Check` | `MessageBox.Show("Select org", "FIFO")` | `btnshow_Click` | Frontend |
| N/A | fifo_sticker | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `btnshow_Click` | Frontend |
| N/A | fifo_sticker | Business Logic | `Value/Constraint Check` | `MessageBox.Show("No of packet should be greater than 0")` | `btnprint_Click` | Frontend |
| N/A | fifo_sticker | Business Logic | `Value/Constraint Check` | `MessageBox.Show("Select org", "FIFO")` | `bntjob_Click` | Frontend |
| N/A | fifo_sticker | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `bntjob_Click` | Frontend |
| N/A | fifo_sticker | Business Logic | `Value/Constraint Check` | `MessageBox.Show("No of packet should be greater than 0")` | `btn_jstk_Click` | Frontend |
| N/A | fifo_sticker | Business Logic | `Value/Constraint Check` | `MessageBox.Show("Lot Generated For PTC items", "FIFO Sticker")` | `chkptc_CheckedChanged` | Frontend |
| N/A | fifo_sticker | Business Logic | `Value/Constraint Check` | `MessageBox.Show("Select org", "FIFO")` | `btncshow_Click` | Frontend |
| N/A | fifo_sticker | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `btncshow_Click` | Frontend |
| N/A | fifo_sticker | Business Logic | `Value/Constraint Check` | `MessageBox.Show("Select Org")` | `btnship_Click` | Frontend |
| N/A | gate_lot_print | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `btnshow_Click` | Frontend |
| N/A | gatelist | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `btngo_Click` | Frontend |
| N/A | gt_checked | Business Logic | `If ds.Tables("namecnt").Rows(0).Item(0) = 0 Then` | `MessageBox.Show("Invalid Name", "Gate Register")` | `btngo_Click` | Frontend |
| N/A | gt_checked | Business Logic | `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` | `MessageBox.Show("Start time For Item Counting Saved", "Gate Register")` | `btngo_Click` | Both |
| N/A | gt_checked | Business Logic | `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` | `MessageBox.Show("Item Checked Details Added", "Gate Entry")` | `btngo_Click` | Both |
| N/A | gt_checked | Business Logic | `Value/Constraint Check` | `MessageBox.Show("Enter location To proceed", "Gate Entry")` | `btngo_Click` | Frontend |
| N/A | gt_checked | Business Logic | `If txtshtr.Text > gqty Then` | `MessageBox.Show("Shortage Qty entered is more than received qty for the line,correct qty and proceed", "Gate Register")` | `txtshtr_Leave` | Frontend |
| N/A | gt_checked | Business Logic | `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` | `MessageBox.Show(ex.Message)` | `btnpack_Click` | Both |
| N/A | headerval | Business Logic | `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` | `MessageBox.Show("Validate Values Saved", "Gate Register")` | `btnsave_Click` | Both |
| N/A | minmax | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `btngo_Click` | Frontend |
| N/A | minmax | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.StackTrace)` | `dgmm_CellFormatting` | Frontend |
| N/A | minmax | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `btngo1_Click` | Frontend |
| N/A | mmcard | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message, " GATE")` | `Button1_Click` | Frontend |
| N/A | newreport | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `btnconsolidate_Click` | Frontend |
| N/A | newreport | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `btndaily_Click` | Frontend |
| N/A | newreport | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `btncancel_Click` | Frontend |
| N/A | newreport | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `btnrtv_Click` | Frontend |
| N/A | newreport | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `btnpoamend_Click` | Frontend |
| N/A | newreport | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `btninward_Click` | Frontend |
| N/A | newreport | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `Button9_Click` | Frontend |
| N/A | newreport | Business Logic | `Value/Constraint Check` | `'   MessageBox.Show(ex.Message)` | `btnadi_Click` | Frontend |
| N/A | newreport | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `btnurg_Click` | Frontend |
| N/A | newreport | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `btnskip_Click` | Frontend |
| N/A | newreport | Business Logic | `Value/Constraint Check` | `'MessageBox.Show("inserted")` | `Button1_Click` | Frontend |
| N/A | newreport | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `Button1_Click` | Frontend |
| N/A | newreport | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `btngt_Click` | Frontend |
| N/A | newreport | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `btnlong_Click` | Frontend |
| N/A | newreport | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `btnper_Click` | Frontend |
| N/A | newreport | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `xerox_Click` | Frontend |
| N/A | newreport | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `delayaccount_Click` | Frontend |
| N/A | newreport | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `adimanual_Click` | Frontend |
| N/A | newreport | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `btninv_Click` | Frontend |
| N/A | newreport | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.ToString)` | `btnprep_Click` | Frontend |
| N/A | newreport | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.ToString)` | `btnm2o_Click` | Frontend |
| N/A | newreport | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.ToString)` | `btnvallist_Click` | Frontend |
| N/A | non-po | Business Logic | `If ds.Tables("resultab").Rows(0).Item(0) > 0 Then` | `MessageBox.Show("DCNo already available for the supplier", "Gate Entry")` | `btnsave_Click` | Frontend |
| N/A | non-po | Business Logic | `If cmbcat.SelectedIndex = 0 And txtbin.Text = "" Then` | `MessageBox.Show("Enter Bin Qty and Proceed", "Gate Entry")` | `btnsave_Click` | Both |
| N/A | non-po | Business Logic | `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` | `MessageBox.Show("Saved Successfully !!-Gate Number is: " & txtgno.Text & "", "Gate Entry")` | `btnsave_Click` | Both |
| N/A | pocheck | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.ToString)` | `btngo_Click` | Frontend |
| N/A | pocheck | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message, "Gate Entry")` | `BTNCALTAX_Click` | Frontend |
| N/A | pocheck | Business Logic | `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` | `MessageBox.Show("Rate Values added", "Gate Register")` | `btnsave_Click` | Both |
| N/A | receipt-prepared | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `receipt_prepared_Load` | Frontend |
| N/A | receipt-prepared | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `btngo_Click` | Frontend |
| N/A | receipt-prepared | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `btnprint_Click` | Frontend |
| N/A | rtvreason | Business Logic | `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` | `MessageBox.Show("RTV Details saved for " & txtgate.Text & "", "Gate Register")` | `btnsave_Click` | Both |
| N/A | rtvreason | Business Logic | `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` | `MessageBox.Show(" RTV Details for " & txtgate.Text & " Updated", "Gate Register")` | `btncan_Click` | Both |
| N/A | rtvreason | Business Logic | `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` | `MessageBox.Show(" RTV Details for " & txtgate.Text & " Deleted", "Gate Register")` | `btndel_Click` | Both |
| N/A | suplist | Business Logic | `If cmbsup.SelectedItem <> "" And txtitem.Text <> "" And txtname.Text <> "" Then` | `MessageBox.Show("Enter Supplier,Item no,follower name", "Gate Register")` | `btnsave_Click` | Both |
| N/A | suplist | Business Logic | `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` | `MessageBox.Show("Supplier Details added", "Gate Register")` | `btnsave_Click` | Both |
| N/A | suplist | Business Logic | `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` | `MessageBox.Show("Urgent List deleted", "Gate Register")` | `btncan_Click` | Both |
| N/A | valreason | Business Logic | `If reason.Text <> "" Then` | `MessageBox.Show("Reason Saved", "Gate Entry")` | `save_Click` | Frontend |
| N/A | valreason | Business Logic | `Value/Constraint Check` | `MessageBox.Show("Enter Reason", "Gate Entry")` | `save_Click` | Frontend |
| N/A | valreason | Business Logic | `Value/Constraint Check` | `MessageBox.Show(ex.Message)` | `save_Click` | Frontend |

---

## SQL Queries

Source file: `/Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Project Analysis/queries.md`

### SQL Database Queries Catalog

This document details every SQL query identified in the VB.NET codebase, mapping database actions to repositories.

#### 1. Summary Statistics
- **Total Queries Discovered**: 273
- **Unique Tables Referenced**: 65
- **Concatenated / Potential SQL Injection Points**: 212

#### 2. List of Identified Database Tables
- `A`
- `APPS.JAI_TAX_LINES`
- `DUAL`
- `FND_FLEX_VALUES_VL`
- `GDATE`
- `GL_CODE_COMBINATIONS`
- `HR_OPERATING_UNITS`
- `JAI_TAX_LINES`
- `JAN_BLANKET_VENDOR_STATUS`
- `JAN_DDS_SHORTAGE_VS_COMPLETION`
- `JAN_DIRECT_DELIVERY_SUPPLIER`
- `JAN_EMP_MAST_V`
- `JAN_EOD_EXCEL_LIST`
- `JAN_EOD_PROCESS_MASTER`
- `JAN_EOD_TRANSACTIONS`
- `JAN_FIFO_LOTNO_DETAILS`
- `JAN_FINAL_OPERATIONS`
- `JAN_GATE_ADI_EXEMPT`
- `JAN_GATE_COURIER`
- `JAN_GATE_DEL`
- `JAN_GATE_EINVOICE_VENDOR`
- `JAN_GATE_HEADER`
- `JAN_GATE_LINES`
- `JAN_GATE_LINES_V`
- `JAN_GATE_LOGIN`
- `JAN_GATE_NVAL_REASON`
- `JAN_GATE_PACK_DETAILS`
- `JAN_GATE_REASON`
- `JAN_GATE_RTV`
- `JAN_GATE_SUPPLIER`
- `JAN_GST_REG_DETAILS_VIEW`
- `JAN_INSP_TRACEABILITY_T`
- `JAN_ITEMCOST`
- `JAN_ITEM_MASTER_TAB`
- `JAN_ITEM_VS_LOCATOR`
- `JAN_LOT_WEIGHT_MASTER`
- `JAN_OPEN_CHALLAN_CATEGORY`
- `JAN_ORGANIZATION_LIST_VIEW`
- `JAN_OSP_LISTING`
- `JAN_OSP_REGULAR_CHALLAN_MAST`
- `JAN_OUTWARD_NEW_REQUIREMENT`
- `JAN_PO_PENDING_BOUGHT_OUTS`
- `JAN_PO_PENDING_OSP`
- `JAN_PURCHASE_2`
- `JAN_PUR_LISTING`
- `JAN_RECEIPT_PENDING`
- `JAN_SUPPLIER_KANBAN_VIEW`
- `JAN_VENDOR_ITEM_MASTER_TEMP1`
- `JAN_WIP_MATERIALS`
- `MTL_ITEM_LOCATIONS`
- `MTL_ONHAND_QUANTITIES`
- `MTL_PARAMETERS`
- `MTL_SUPPLY`
- `MTL_SYSTEM_ITEMS`
- `MTL_TRANSACTION_REASONS`
- `ORG_ORGANIZATION_DEFINITIONS`
- `PO_DISTRIBUTIONS_ALL`
- `PO_HEADERS_ALL`
- `PO_LINES_ALL`
- `PO_LINE_LOCATIONS_ALL`
- `PO_VENDORS`
- `PO_VENDOR_SITES_ALL`
- `RA_CUSTOMERS`
- `RCV_SHIPMENT_HEADERS`
- `WIP_ENTITIES`

---

#### 3. Cataloged SQL Queries by Screen

##### Screen Component: adi
###### Query 1: btnsave_Click (Line 18)
```sql
select NVL(MAX(gate_no),0)GATE_NO from jan_gate_header WHERE UNIT='UNIT2'
```
- **Trigger Method**: `btnsave_Click`
- **Variables Used**: `sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.btnsave_ClickQuery1()`
- **Suggested API Endpoint**: `GET /api/gate/btnsave_click-1`

###### Query 2: btnsave_Click (Line 35)
```sql
select jan_GATE_NO_SEQ.NEXTVAL FROM DUAL
```
- **Trigger Method**: `btnsave_Click`
- **Variables Used**: `sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.btnsave_ClickQuery2()`
- **Suggested API Endpoint**: `GET /api/gate/btnsave_click-2`

###### Query 3: btnsave_Click (Line 50)
```sql
SELECT TO_CHAR(JAN_FYR_DATE,'yyyy') FROM DUAL
```
- **Trigger Method**: `btnsave_Click`
- **Variables Used**: `sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.btnsave_ClickQuery3()`
- **Suggested API Endpoint**: `GET /api/gate/btnsave_click-3`

###### Query 4: btnsave_Click (Line 58)
```sql
select NVL(MAX(gate_no),0)GATE_NO from jan_gate_header WHERE UNIT='" & txtrole.Text & "' AND GDATE>JAN_FYR_DATE
```
- **Trigger Method**: `btnsave_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.btnsave_ClickQuery4()`
- **Suggested API Endpoint**: `GET /api/gate/btnsave_click-4`

###### Query 5: btnsave_Click (Line 74)
```sql
SELECT TO_CHAR(JAN_FYR_DATE,'yyyy') FROM DUAL
```
- **Trigger Method**: `btnsave_Click`
- **Variables Used**: `sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.btnsave_ClickQuery5()`
- **Suggested API Endpoint**: `GET /api/gate/btnsave_click-5`

###### Query 6: btnsave_Click (Line 82)
```sql
select NVL(MAX(gate_no),0)GATE_NO from jan_gate_header WHERE UNIT='JAPL' AND GDATE>JAN_FYR_DATE
```
- **Trigger Method**: `btnsave_Click`
- **Variables Used**: `sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.btnsave_ClickQuery6()`
- **Suggested API Endpoint**: `GET /api/gate/btnsave_click-6`

###### Query 7: btnsave_Click (Line 102)
```sql
select NVL(MAX(gate_no),0)GATE_NO from jan_gate_header WHERE UNIT='JAPL' AND GDATE>JAN_FYR_DATE
```
- **Trigger Method**: `btnsave_Click`
- **Variables Used**: `sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.btnsave_ClickQuery7()`
- **Suggested API Endpoint**: `GET /api/gate/btnsave_click-7`

###### Query 8: btnsave_Click (Line 122)
```sql
select gate_no from jan_gate_header where gate_no='" & txtgno.Text & "'and extract (month from gdate)=" & Date.Now.Month & " and extract (year from gdate)=" & Date.Now.Year & " and unit='" & txtrole.Text & "'
```
- **Trigger Method**: `btnsave_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.btnsave_ClickQuery8()`
- **Suggested API Endpoint**: `GET /api/gate/btnsave_click-8`

###### Query 9: btnsave_Click (Line 139)
```sql
select GATE_ID,UNIT,GTYPE,DC_DATE,dc_no ,supplier_name from jan_gate_header where validated<>6 and supplier_name='" & cmbsup.Text & "' and extract (month from gdate)=" & Date.Now.Month & " and unit='" & txtrole.Text & "' and extract (year from gdate)=" & Date.Now.Year & "
```
- **Trigger Method**: `btnsave_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `ISupplierRepository.btnsave_ClickQuery9()`
- **Suggested API Endpoint**: `GET /api/supplier/btnsave_click-9`

###### Query 10: btnsave_Click (Line 220)
```sql
["insert into jan_gate_header(gate_no,gate_id,supplier_name,supplier_site,dc_no,dc_date,validated,gtype,gdate,vehicle_det,courier_name,pod_no ,no_of_box ,po_wt ,rec_Wt,unit,flag,adi_no,adi_date,INVOICE_VAL,xerox,VENDOR_ID,adi_via,ADI_TYPE,direct_dlyd_flag)] '" & 1 & "', '" & cmbtype.Text & "' ,nvl((select gate_Dt from jan_gate_del where gate_no=" & txtgno.Text & " and rownum=1),sysdate),nvl((select vehicle_Det from jan_gate_del where gate_no=" & txtgno.Text & " and rownum=1),'') ,(select courier_name from jan_gate_del where gate_no=" & txtgno.Text & " and rownum=1),(select pod_no from jan_gate_del where gate_no=" & txtgno.Text & " and rownum=1),(select no_of_box from jan_gate_del where gate_no=" & txtgno.Text & " and rownum=1),(select pod_wt from jan_gate_del where gate_no=" & txtgno.Text & " and rownum=1),(select rec_wt from jan_gate_del where gate_no=" & txtgno.Text & " and rownum=1) ,sysdate,'" & txtveh.Text & "','" & cmbcr.Text & "','" & txtpod.Text & "','" & txtbox.Text & "','" & txtpodwt.Text & "','" & txtrwt.Text & "' ,'UNIT1' ,'UNIT7' ,'UNIT2' ,'UNIT4' ,'SKYFAST' ,'JAPL' ,'" & 1 & "','" & TXT_ASN_NO.Text & "','" & Format(CDate(asndt), "dd-MMM-yyyy") & "','" & Txt_inv_val.Text & "','No'," & SID & ",'ADI','" & ASNTYPE & "','Y')
```
- **Trigger Method**: `btnsave_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `ISupplierRepository.btnsave_ClickQuery10()`
- **Suggested API Endpoint**: `GET /api/supplier/btnsave_click-10`

###### Query 11: btnsave_Click (Line 281)
```sql
insert into jan_gate_lines (line_no,gate_no,gate_id,pono,podt,item,description,rev,popend,supdcqty,uom,job,oper,osp,type,remark,status,validated,org,flag,poline,pohead,location_id,poqty,actval,ratecat,potype,tariff ,wip_entity_id,opn_seq ,spot_inspection,self_certify )values(" & line & "," & txtgno.Text & ",'" & txtgno.Text & "','" & dgv1.Item(0, i).Value & "','" & Format(dt2, "dd-MMM-yyyy") & "','" & dgv1.Item(2, i).Value & "','" & de & "','" & dgv1.Item(5, i).Value & "'," & dgv1.Item(6, i).Value & ", '" & dgv1.Item(8, i).Value.ToString & "','" & dgv1.Item(7, i).Value & "','" & dgv1.Item(13, i).Value & "','" & dgv1.Item(12, i).Value & "','" & dgv1.Item(11, i).Value & "','" & dgv1.Item(14, i).Value & "','" & dgv1.Item(9, i).Value & "','" & 1 & "', '" & 1 & "', '" & dgv1.Item(4, i).Value & "','" & 1 & "','" & dgv1.Item(15, i).Value & "','" & dgv1.Item(16, i).Value & "','" & dgv1.Item(19, i).Value & "' ,'" & dgv1.Item(10, i).Value & "','" & dgv1.Item(8, i).Value & "','" & dgv1.Item(22, i).Value & "','" & dgv1.Item(23, i).Value & "','" & dgv1.Item(24, i).Value & "' ,'" & dgv1.Item(25, i).Value & "','" & dgv1.Item(26, i).Value & "' ,'" & dgv1.Item(27, i).Value & "','" & dgv1.Item(28, i).Value & "' )
```
- **Trigger Method**: `btnsave_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.btnsave_ClickQuery11()`
- **Suggested API Endpoint**: `GET /api/po/btnsave_click-11`

###### Query 12: btnsave_Click (Line 291)
```sql
insert into jan_gate_lines (line_no,gate_no,gate_id,pono,podt,item,description,rev,popend,supdcqty,uom,job,oper,osp,type,remark,status,validated,org,flag,poline,pohead,location_id,poqty,actval,ratecat,potype,tariff ,wip_entity_id,opn_seq ,spot_inspection,self_certify )values(" & line & "," & txtgno.Text & ",'" & txtgno.Text & "','" & dgv1.Item(0, i).Value & "','" & Format(dt2, "dd-MMM-yyyy") & "','" & dgv1.Item(2, i).Value & "','" & de & "','" & dgv1.Item(5, i).Value & "'," & dgv1.Item(6, i).Value & ", '" & dgv1.Item(8, i).Value.ToString & "','" & dgv1.Item(7, i).Value & "','" & dgv1.Item(13, i).Value & "','" & dgv1.Item(12, i).Value & "','" & dgv1.Item(11, i).Value & "','" & dgv1.Item(14, i).Value & "','" & dgv1.Item(9, i).Value & "','" & 1 & "', '" & 1 & "', '" & dgv1.Item(4, i).Value & "','" & 1 & "','" & dgv1.Item(15, i).Value & "','" & dgv1.Item(16, i).Value & "','" & dgv1.Item(19, i).Value & "' ,'" & dgv1.Item(10, i).Value & "','" & dgv1.Item(8, i).Value & "','" & dgv1.Item(22, i).Value & "','" & dgv1.Item(23, i).Value & "','" & dgv1.Item(24, i).Value & "' ,'" & dgv1.Item(25, i).Value & "','" & dgv1.Item(26, i).Value & "' ,'" & dgv1.Item(27, i).Value & "','" & dgv1.Item(28, i).Value & "' )
```
- **Trigger Method**: `btnsave_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.btnsave_ClickQuery12()`
- **Suggested API Endpoint**: `GET /api/po/btnsave_click-12`

###### Query 13: btnsave_Click (Line 311)
```sql
select count(*) from jan_gate_del where gatE_no=" & head & "
```
- **Trigger Method**: `btnsave_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.btnsave_ClickQuery13()`
- **Suggested API Endpoint**: `GET /api/gate/btnsave_click-13`

###### Query 14: btnsave_Click (Line 317)
```sql
delete from jan_fifo_lotno_details where ref_id=" & head & "
```
- **Trigger Method**: `btnsave_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IFifoRepository.btnsave_ClickQuery14()`
- **Suggested API Endpoint**: `GET /api/fifo/btnsave_click-14`

###### Query 15: btnsave_Click (Line 321)
```sql
select count(*) from jan_fifo_lotno_details where ref_id=" & head & "
```
- **Trigger Method**: `btnsave_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IFifoRepository.btnsave_ClickQuery15()`
- **Suggested API Endpoint**: `GET /api/fifo/btnsave_click-15`

###### Query 16: btnsave_Click (Line 329)
```sql
insert into jan_fifo_lotno_details select org_id,item_id,item,gh.gate_no,'Po',nvl(LOT_NO,gl.item||'_'||to_char(gh.gdate,'iyyyiwdhhmi')),sum(supdcqty),'',sysdate, '' from jan_gate_lines gl,jan_gate_header gh where gl.gate_no=gh.gate_no and gh.gate_no=" & head & "group by org_id,item_id,item,gh.gate_no, nvl(LOT_NO,gl.item||'_'||to_char(gh.gdate,'iyyyiwdhhmi'))
```
- **Trigger Method**: `btnsave_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IFifoRepository.btnsave_ClickQuery16()`
- **Suggested API Endpoint**: `GET /api/fifo/btnsave_click-16`

###### Query 17: btnsave_Click (Line 335)
```sql
select count(*) from jan_fifo_lotno_details where ref_id=" & head & "
```
- **Trigger Method**: `btnsave_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IFifoRepository.btnsave_ClickQuery17()`
- **Suggested API Endpoint**: `GET /api/fifo/btnsave_click-17`

###### Query 18: btnsave_Click (Line 343)
```sql
insert into jan_fifo_lotno_details select org_id,item_id,item,gh.gate_no,'Po',nvl(LOT_NO,gl.item||'_'||to_char(gh.gdate,'iyyyiwdhhmi')),sum(supdcqty),'',sysdate, '' from jan_gate_lines gl,jan_gate_header gh where gl.gate_no=gh.gate_no and gh.gate_no=" & head & "group by org_id,item_id,item,gh.gate_no, nvl(LOT_NO,gl.item||'_'||to_char(gh.gdate,'iyyyiwdhhmi'))
```
- **Trigger Method**: `btnsave_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IFifoRepository.btnsave_ClickQuery18()`
- **Suggested API Endpoint**: `GET /api/fifo/btnsave_click-18`

###### Query 19: btnsave_Click (Line 353)
```sql
insert into jan_fifo_lotno_details select org_id,item_id,item,gh.gate_no,'Po',nvl(LOT_NO,gl.item||'_'||to_char(gh.gdate,'iyyyiwdhhmi')),sum(supdcqty),'',sysdate, '' from jan_gate_lines gl,jan_gate_header gh where gl.gate_no=gh.gate_no and gh.gate_no=" & head & "group by org_id,item_id,item,gh.gate_no, nvl(LOT_NO,gl.item||'_'||to_char(gh.gdate,'iyyyiwdhhmi'))
```
- **Trigger Method**: `btnsave_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IFifoRepository.btnsave_ClickQuery19()`
- **Suggested API Endpoint**: `GET /api/fifo/btnsave_click-19`

###### Query 20: btnsave_Click (Line 357)
```sql
insert into jan_fifo_lotno_details select org_id,item_id,item,gh.gate_no,'Po',nvl(LOT_NO,gl.item||'_'||to_char(gh.gdate,'iyyyiwdhhmi')),sum(supdcqty),'',sysdate, '' from jan_gate_lines gl,jan_gate_header gh where gl.gate_no=gh.gate_no and gh.gate_no=" & head & "group by org_id,item_id,item,gh.gate_no, nvl(LOT_NO,gl.item||'_'||to_char(gh.gdate,'iyyyiwdhhmi'))
```
- **Trigger Method**: `btnsave_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IFifoRepository.btnsave_ClickQuery20()`
- **Suggested API Endpoint**: `GET /api/fifo/btnsave_click-20`

###### Query 21: btnsave_Click (Line 362)
```sql
UPDATE JAN_GATE_HEADER SET ORG='" & dgv1.Item(4, 0).Value & "' WHERE GATE_NO=" & head & "
```
- **Trigger Method**: `btnsave_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.btnsave_ClickQuery21()`
- **Suggested API Endpoint**: `GET /api/gate/btnsave_click-21`

###### Query 22: btnsave_Click (Line 370)
```sql
update jan_gate_header set gate_no='" & head & "' where asn_no='" & TXT_ASN_NO.Text & "'
```
- **Trigger Method**: `btnsave_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.btnsave_ClickQuery22()`
- **Suggested API Endpoint**: `GET /api/gate/btnsave_click-22`

###### Query 23: BUT_DWNLD_ASN_Click (Line 445)
```sql
select JH.*,JL.*,JH.DEL_ASN DELASN from jan_gate_header jh,jan_gate_lines jl where jh.ASN_NO=JL.ASN_NO AND JH.ASN_NO=
```
- **Trigger Method**: `BUT_DWNLD_ASN_Click`
- **Variables Used**: `sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.BUT_DWNLD_ASN_ClickQuery23()`
- **Suggested API Endpoint**: `GET /api/gate/but_dwnld_asn_click-23`

###### Query 24: BUT_DWNLD_ASN_Click (Line 497)
```sql
select JH.*,JL.*,JH.DEL_ASN DELASN from jan_gate_header jh,jan_gate_lines jl where jh.ASN_NO=JL.ASN_NO AND JH.ASN_NO=
```
- **Trigger Method**: `BUT_DWNLD_ASN_Click`
- **Variables Used**: `sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.BUT_DWNLD_ASN_ClickQuery24()`
- **Suggested API Endpoint**: `GET /api/gate/but_dwnld_asn_click-24`

###### Query 25: BUT_DWNLD_ASN_Click (Line 517)
```sql
select JH.*,JL.*,JH.DEL_ASN DELASN from jan_gate_header jh,jan_gate_lines jl where jh.ASN_NO=JL.ASN_NO AND JH.ASN_NO=
```
- **Trigger Method**: `BUT_DWNLD_ASN_Click`
- **Variables Used**: `sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.BUT_DWNLD_ASN_ClickQuery25()`
- **Suggested API Endpoint**: `GET /api/gate/but_dwnld_asn_click-25`

###### Query 26: BUT_DWNLD_ASN_Click (Line 533)
```sql
select sys_context ('USERENV', 'IP_ADDRESS')ip ,(SELECT COUNT(*) FROM PO_VENDORS WHERE VENDOR_ID=" & MDS.Tables("asn_det").Rows(0).Item("supplier_id") & " AND INVOICE_CURRENCY_CODE<>'INR') from dual
```
- **Trigger Method**: `BUT_DWNLD_ASN_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `ISupplierRepository.BUT_DWNLD_ASN_ClickQuery26()`
- **Suggested API Endpoint**: `GET /api/supplier/but_dwnld_asn_click-26`

###### Query 27: BUT_DWNLD_ASN_Click (Line 560)
```sql
select sys_context ('USERENV', 'IP_ADDRESS')ip ,(SELECT COUNT(*) FROM PO_VENDORS WHERE VENDOR_ID=" & MDS.Tables("asn_det").Rows(0).Item("supplier_id") & " AND INVOICE_CURRENCY_CODE<>'INR') from dual
```
- **Trigger Method**: `BUT_DWNLD_ASN_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `ISupplierRepository.BUT_DWNLD_ASN_ClickQuery27()`
- **Suggested API Endpoint**: `GET /api/supplier/but_dwnld_asn_click-27`

###### Query 28: BUT_DWNLD_ASN_Click (Line 628)
```sql
select sys_context ('USERENV', 'IP_ADDRESS')ip ,(SELECT COUNT(*) FROM PO_VENDORS WHERE VENDOR_ID=" & MDS.Tables("asn_det").Rows(0).Item("supplier_id") & " AND INVOICE_CURRENCY_CODE<>'INR') from dual
```
- **Trigger Method**: `BUT_DWNLD_ASN_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `ISupplierRepository.BUT_DWNLD_ASN_ClickQuery28()`
- **Suggested API Endpoint**: `GET /api/supplier/but_dwnld_asn_click-28`

###### Query 29: BUT_DWNLD_ASN_Click (Line 737)
```sql
select NVL(MAX(gate_no),0)GATE_NO from jan_gate_header WHERE UNIT='UNIT2'
```
- **Trigger Method**: `BUT_DWNLD_ASN_Click`
- **Variables Used**: `sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.BUT_DWNLD_ASN_ClickQuery29()`
- **Suggested API Endpoint**: `GET /api/gate/but_dwnld_asn_click-29`

###### Query 30: BUT_DWNLD_ASN_Click (Line 760)
```sql
select NVL(MAX(gate_no),0)GATE_NO from jan_gate_header WHERE UNIT='UNIT2'
```
- **Trigger Method**: `BUT_DWNLD_ASN_Click`
- **Variables Used**: `sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.BUT_DWNLD_ASN_ClickQuery30()`
- **Suggested API Endpoint**: `GET /api/gate/but_dwnld_asn_click-30`

###### Query 31: BUT_DWNLD_ASN_Click (Line 785)
```sql
SELECT pov.*, (SELECT VENDOR_SITE_CODE FROM PO_VENDOR_SITES_ALL WHERE VENDOR_ID=POv.VENDOR_ID and rownum=1) site FROM PO_VENDORS pov WHERE pov.VENDOR_ID=
```
- **Trigger Method**: `BUT_DWNLD_ASN_Click`
- **Variables Used**: `sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IPORepository.BUT_DWNLD_ASN_ClickQuery31()`
- **Suggested API Endpoint**: `GET /api/po/but_dwnld_asn_click-31`

###### Query 32: DWNLD_ASN (Line 843)
```sql
select nvl(sum(po_qty-recd),0) po from jan_po_pending_bought_outs where pono='" & f & "' and po_line_id='" & r & "' AND LINE_LOCATION_ID=
```
- **Trigger Method**: `DWNLD_ASN`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.DWNLD_ASNQuery32()`
- **Suggested API Endpoint**: `GET /api/po/dwnld_asn-32`

###### Query 33: DWNLD_ASN (Line 849)
```sql
select nvl(sum(supdcqty),0) po from jan_gate_lines where pono='" & f & "' and validated<>'4' and flag<>0 and poline='" & r & "' AND LOCATION_ID=
```
- **Trigger Method**: `DWNLD_ASN`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.DWNLD_ASNQuery33()`
- **Suggested API Endpoint**: `GET /api/po/dwnld_asn-33`

###### Query 34: DWNLD_ASN (Line 855)
```sql
select nvl(sum(b.quantity_received),0) po from jan_gate_lines a,jan_pur_listing b where a.item=b.item_no and a.gate_id=b.gate_no and b.pono ='" & f & "' and a.flag<>0 and a.poline=" & r & " AND LOCATION_ID=
```
- **Trigger Method**: `DWNLD_ASN`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.DWNLD_ASNQuery34()`
- **Suggested API Endpoint**: `GET /api/po/dwnld_asn-34`

###### Query 35: DWNLD_ASN (Line 863)
```sql
select nvl(sum(po_qty-recd),0) po from jan_po_pending_osp where pono='" & f & "' and po_line_id='" & r & "'
```
- **Trigger Method**: `DWNLD_ASN`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.DWNLD_ASNQuery35()`
- **Suggested API Endpoint**: `GET /api/po/dwnld_asn-35`

###### Query 36: DWNLD_ASN (Line 869)
```sql
select nvl(sum(supdcqty),0) po from jan_gate_lines where pono='" & f & "' and validated<>'4' and flag<>0 and poline='" & r & "'
```
- **Trigger Method**: `DWNLD_ASN`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.DWNLD_ASNQuery36()`
- **Suggested API Endpoint**: `GET /api/po/dwnld_asn-36`

###### Query 37: DWNLD_ASN (Line 875)
```sql
select nvl(sum(b.quantity_received),0) po from jan_gate_lines a,jan_osp_listing b where a.item=b.partno and a.gate_id=b.gate_no and b.pono='" & f & "' and a.flag<>0 and a.poline='" & r & "'
```
- **Trigger Method**: `DWNLD_ASN`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.DWNLD_ASNQuery37()`
- **Suggested API Endpoint**: `GET /api/po/dwnld_asn-37`

###### Query 38: DWNLD_ASN (Line 884)
```sql
select nvl(sum(b.quantity_received),0) po from jan_gate_lines a,jan_osp_listing b where a.item=b.partno and a.gate_id=b.gate_no and b.pono='" & f & "' and a.flag<>0 and a.poline='" & r & "'
```
- **Trigger Method**: `DWNLD_ASN`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.DWNLD_ASNQuery38()`
- **Suggested API Endpoint**: `GET /api/po/dwnld_asn-38`

###### Query 39: DWNLD_ASN (Line 904)
```sql
select b.po_line_id,b.po_header_id,b.line_location_id,b.po_qty,b.bom_revision, b.po_uom, b.osp_no,(select organization_code from org_organization_definitions where organization_id=b.ship_to_organization_id)org ,b.price,B.PARTNAME,b.podt,b.operations, b.job_no,(SELECT CATEGORY FROM(JAN_COUNTING_CATEGORY) WHERE(organization_id = b.ship_to_organization_id) AND DECODE((SELECT ITEM_COST FROM JAN_ITEMCOST B WHERE(ITEM_NO = b.PARTNO) AND org_id = b.ship_to_organization_id AND PO_LINE_ID=B.PO_LINE_ID),0, (SELECT STAGE_COST FROM JAN_PO_PENDING_OSP C WHERE(PARTNO = b.PARTNO)AND ship_to_organization_id = b.ship_to_organization_id AND PO_LINE_ID=B.PO_LINE_ID), (SELECT ITEM_COST FROM JAN_ITEMCOST B WHERE(ITEM_NO = b.PARTNO) AND org_id = b.ship_to_organization_id AND PO_LINE_ID=B.PO_LINE_ID)) BETWEEN from_value and to_value) CAT,DECODE(B.LINE_TYPE_ID,1021,'Services',B.LINE_TYPE)LINE_TYPE,wip_entity_id,opn_seq from jan_po_pending_osp b where b.VENDOR_ID=" & SID & " and B.pono='" & f & "' and b.po_line_id='" & r & "'
```
- **Trigger Method**: `DWNLD_ASN`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.DWNLD_ASNQuery39()`
- **Suggested API Endpoint**: `GET /api/po/dwnld_asn-39`

###### Query 40: adi_Load (Line 1069)
```sql
SELECT COUNT(*)CNT,TO_CHAR(JAN_FYR_DATE,'yyyy') YR FROM DUAL WHERE SYSDATE BETWEEN JAN_FYR_DATE AND JAN_FYR_END_DATE
```
- **Trigger Method**: `adi_Load`
- **Variables Used**: `sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.adi_LoadQuery40()`
- **Suggested API Endpoint**: `GET /api/gate/adi_load-40`

###### Query 41: adi_Load (Line 1084)
```sql
select * from jan_gate_courier
```
- **Trigger Method**: `adi_Load`
- **Variables Used**: `sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.adi_LoadQuery41()`
- **Suggested API Endpoint**: `GET /api/gate/adi_load-41`

###### Query 42: adi_Load (Line 1091)
```sql
select vendor_name from po_vendors where vendor_type_lookup_code <>'EMPLOYEE' order by vendor_name asc
```
- **Trigger Method**: `adi_Load`
- **Variables Used**: `sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IPORepository.adi_LoadQuery42()`
- **Suggested API Endpoint**: `GET /api/po/adi_load-42`

##### Screen Component: Validate
###### Query 1: VALIDATE_Load (Line 34)
```sql
SELECT pono,ITEM , STATUS FROM (SELECT pono,LOCATION_ID,ITEM ,(select case when (quantity-(quantity_received+quantity_cancelled)) =0 THEN 'No pending Qty' when QUANTITY_CANCELLED>0 then 'PO cancelled' when nvl(closed_code,'OPEN')<>'OPEN' then 'Line closed' when APPROVED_FLAG <>'Y' then 'Approval Pend' when (quantity-(quantity_received+quantity_cancelled))<a.supdcqty then 'Po Qty less than inward Qty' when(select count(*) from po_headers_all where authorization_status <>'APPROVED' and po_header_id=a.pohead)>0 then 'PO Not Approved' when (select count(*) from po_lines_all where po_line_id=a.poline and item_revision is null)>0 then 'No Revision for item in PO' else 'NP' end from PO_LINE_LOCATIONS_ALL where LINE_LOCATION_ID=a.LOCATION_ID ) STATUS from JAN_GATE_LINES a where GATE_NO=" & txtgno.Text & " and location_id in ( select location_id from jan_receipt_pending where gate_no=a.gate_no and shipment_line_id is null) ) where STATUS<>'NP'
```
- **Trigger Method**: `VALIDATE_Load`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.VALIDATE_LoadQuery1()`
- **Suggested API Endpoint**: `GET /api/po/validate_load-1`

###### Query 2: VALIDATE_Load (Line 50)
```sql
SELECT pono,ITEM , STATUS FROM (SELECT pono,LOCATION_ID,ITEM ,(select case when (quantity-(quantity_received+quantity_cancelled)) =0 THEN 'No pending Qty' when QUANTITY_CANCELLED>0 then 'PO cancelled' when nvl(closed_code,'OPEN')<>'OPEN' then 'Line closed' when APPROVED_FLAG <>'Y' then 'Approval Pend' when (quantity-(quantity_received+quantity_cancelled))<a.supdcqty then 'Po Qty less than inward Qty' when(select count(*) from po_headers_all where authorization_status <>'APPROVED' and po_header_id=a.pohead)>0 then 'PO Not Approved' when (select count(*) from po_lines_all where po_line_id=a.poline and item_revision is null)>0 then 'No Revision for item in PO' else 'NP' end from PO_LINE_LOCATIONS_ALL where LINE_LOCATION_ID=a.LOCATION_ID ) STATUS from JAN_GATE_LINES a where GATE_NO=" & txtgno.Text & " and location_id in ( select location_id from jan_receipt_pending where gate_no=a.gate_no and shipment_line_id is null) ) where STATUS<>'NP'
```
- **Trigger Method**: `VALIDATE_Load`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.VALIDATE_LoadQuery2()`
- **Suggested API Endpoint**: `GET /api/po/validate_load-2`

###### Query 3: RBTNV_CheckedChanged (Line 114)
```sql
SELECT REA_CODE,REA_NAME,REA_REMARK,ACTION,ACTION_REMARK,TO_CHAR(ACTION_DT)ACTION_DT,REA_SEL FROM JAN_GATE_NVAL_REASON WHERE GATE_NO='" & txtgno.Text & "' and line_no='" & TXTLINE.Text & "'
```
- **Trigger Method**: `RBTNV_CheckedChanged`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.RBTNV_CheckedChangedQuery3()`
- **Suggested API Endpoint**: `GET /api/gate/rbtnv_checkedchanged-3`

###### Query 4: RBTNNV_CheckedChanged (Line 194)
```sql
select nvl(eway_no,(select eway_bill from jan_gate_del where gate_no=" & txtgno.Text & " and DEL_FOR='Header' and eway_bill is not null and rownum=1)) from jan_gate_header where gate_no=" & txtgno.Text & "
```
- **Trigger Method**: `RBTNNV_CheckedChanged`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.RBTNNV_CheckedChangedQuery4()`
- **Suggested API Endpoint**: `GET /api/gate/rbtnnv_checkedchanged-4`

###### Query 5: RBTNNV_CheckedChanged (Line 203)
```sql
SELECT REA_CODE,REA_NAME FROM JAN_GATE_REASON WHERE LIVE_FLAG='Y' ORDER BY REA_CODE
```
- **Trigger Method**: `RBTNNV_CheckedChanged`
- **Variables Used**: `cl.sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.RBTNNV_CheckedChangedQuery5()`
- **Suggested API Endpoint**: `GET /api/gate/rbtnnv_checkedchanged-5`

###### Query 6: RBTNNV_CheckedChanged (Line 268)
```sql
SELECT REA_REMARK,REAson_Date,TO_CHAR(ACTION)ACTION,TO_CHAR(ACTION_REMARK)ACTION_REMARK,ACTION_DT,rea_sel FROM JAN_GATE_NVAL_REASON WHERE GATE_NO='" & txtgno.Text & "' AND LINE_NO IN (" & TXTLINE.Text & ") AND DECODE(REA_CODE,8,28,REA_CODE)='" & ds.Tables("JAN_GATE_REASON").Rows(J).Item("REA_CODE") & "'
```
- **Trigger Method**: `RBTNNV_CheckedChanged`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.RBTNNV_CheckedChangedQuery6()`
- **Suggested API Endpoint**: `GET /api/gate/rbtnnv_checkedchanged-6`

###### Query 7: BTNOK_Click (Line 305)
```sql
select JAN_iNWARD_QTY_VALIDATE (" & txtgno.Text & ",1) gate_Val from dual
```
- **Trigger Method**: `BTNOK_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.BTNOK_ClickQuery7()`
- **Suggested API Endpoint**: `GET /api/gate/btnok_click-7`

###### Query 8: BTNOK_Click (Line 315)
```sql
Update JAN_GATE_HEADER Set VALIDATED=2 WHERE GATE_NO=" & txtgno.Text & "
```
- **Trigger Method**: `BTNOK_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.BTNOK_ClickQuery8()`
- **Suggested API Endpoint**: `GET /api/gate/btnok_click-8`

###### Query 9: BTNOK_Click (Line 321)
```sql
Update JAN_GATE_LINES SET VALIDATED=2 WHERE GATE_NO=" & txtgno.Text & "
```
- **Trigger Method**: `BTNOK_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.BTNOK_ClickQuery9()`
- **Suggested API Endpoint**: `GET /api/gate/btnok_click-9`

###### Query 10: BTNOK_Click (Line 328)
```sql
INSERT INTO JAN_GATE_NVAL_REASON(GATE_NO, LINE_NO, REA_CODE, REA_NAME, REA_DT, REA_SEL, REASON_DATE, unit) values(" & txtgno.Text & ", 1, 31, (select rea_name from jan_gate_reason where rea_code=31),sysdate,1,sysdate,(Select unit from jan_gate_header where gate_No= " & txtgno.Text & "))
```
- **Trigger Method**: `BTNOK_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.BTNOK_ClickQuery10()`
- **Suggested API Endpoint**: `GET /api/gate/btnok_click-10`

###### Query 11: BTNOK_Click (Line 342)
```sql
select count(*) from jan_gate_header where gate_no=" & txtgno.Text & " and po_Wt is not null and rec_wt is null
```
- **Trigger Method**: `BTNOK_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.BTNOK_ClickQuery11()`
- **Suggested API Endpoint**: `GET /api/po/btnok_click-11`

###### Query 12: BTNOK_Click (Line 356)
```sql
select count(*) from po_vendors where invoice_currency_code='INR' and vendor_id in (select vendor_id from jan_gate_header where gate_no=" & txtgno.Text & ")
```
- **Trigger Method**: `BTNOK_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.BTNOK_ClickQuery12()`
- **Suggested API Endpoint**: `GET /api/po/btnok_click-12`

###### Query 13: BTNOK_Click (Line 363)
```sql
select count(distinct pohead) from jan_gate_lines where gate_no=" & txtgno.Text & "
```
- **Trigger Method**: `BTNOK_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.BTNOK_ClickQuery13()`
- **Suggested API Endpoint**: `GET /api/gate/btnok_click-13`

###### Query 14: BTNOK_Click (Line 368)
```sql
select count(distinct trx_id) from jai_tax_lines where trx_id in (select pohead from jan_gate_lines where gate_no=" & txtgno.Text & ")
```
- **Trigger Method**: `BTNOK_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.BTNOK_ClickQuery14()`
- **Suggested API Endpoint**: `GET /api/gate/btnok_click-14`

###### Query 15: BTNOK_Click (Line 382)
```sql
select count(*) from jan_gate_einvoice_Vendor where vendor_id=(select vendor_id from jan_gate_header where gate_no=" & txtgno.Text & " )
```
- **Trigger Method**: `BTNOK_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.BTNOK_ClickQuery15()`
- **Suggested API Endpoint**: `GET /api/gate/btnok_click-15`

###### Query 16: BTNOK_Click (Line 392)
```sql
select nvl(state_code,substr(REGISTRATION_NUMBER, 0,2)),(select dcval from jan_gate_header where gate_no=" & txtgno.Text & ")inv_amt,nvl((select eway_bill from jan_gate_del where gate_no=" & txtgno.Text & " and del_for='Header' and rownum=1),'" & txtgst.Text & "')eway from JAN_GST_REG_DETAILS_VIEW where PARTY_CLASS_NAME='Supplier' AND REGISTRATION_TYPE_CODE='GSTIN' and party_id=(select vendor_id from jan_gate_header where gate_no=" & txtgno.Text & " ) and org_id=" & OP_ID & " and party_id in (select vendor_id from po_Vendors where invoice_Currency_code='INR')
```
- **Trigger Method**: `BTNOK_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `ISupplierRepository.BTNOK_ClickQuery16()`
- **Suggested API Endpoint**: `GET /api/supplier/btnok_click-16`

###### Query 17: BTNOK_Click (Line 434)
```sql
select count(*) from jan_gate_lines where gate_no=" & txtgno.Text & " and checked_by is not null
```
- **Trigger Method**: `BTNOK_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.BTNOK_ClickQuery17()`
- **Suggested API Endpoint**: `GET /api/gate/btnok_click-17`

###### Query 18: valfun (Line 476)
```sql
Select receipt_num from rcv_shipment_headers where packing_slip='" & txtgno.Text & "'
```
- **Trigger Method**: `valfun`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.valfunQuery18()`
- **Suggested API Endpoint**: `GET /api/gate/valfun-18`

###### Query 19: valfun (Line 524)
```sql
update jan_gate_nval_reason set action='" & dgv.Rows(i).Cells(4).Value & " ' , action_remark='" & dgv.Rows(i).Cells(5).Value & "' , action_dt='" & dgv.Rows(i).Cells(6).Value & "', rea_sel='0' where gate_no='" & txtgno.Text & "' and rea_code='" & dgv.Rows(i).Cells(1).Value & "' AND LINE_NO IN (" & TXTLINE.Text & ")
```
- **Trigger Method**: `valfun`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.valfunQuery19()`
- **Suggested API Endpoint**: `GET /api/gate/valfun-19`

###### Query 20: valfun (Line 534)
```sql
update jan_gate_nval_Reason set gdate=(select gdate from jan_gate_header where gate_no='" & txtgno.Text & "'),ORG=(SELECT ORG FROM JAN_GATE_HEADER WHERE GATE_NO='" & txtgno.Text & "') WHERE GATE_NO='" & txtgno.Text & "'
```
- **Trigger Method**: `valfun`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.valfunQuery20()`
- **Suggested API Endpoint**: `GET /api/gate/valfun-20`

###### Query 21: valfun (Line 541)
```sql
update jan_gate_header set einv_flag=1 WHERE GATE_NO='" & txtgno.Text & "'
```
- **Trigger Method**: `valfun`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.valfunQuery21()`
- **Suggested API Endpoint**: `GET /api/gate/valfun-21`

###### Query 22: valfun (Line 549)
```sql
update jan_gate_header set eway_no='" & txtgst.Text & "' WHERE GATE_NO='" & txtgno.Text & "'
```
- **Trigger Method**: `valfun`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.valfunQuery22()`
- **Suggested API Endpoint**: `GET /api/gate/valfun-22`

###### Query 23: ADD_REASON (Line 664)
```sql
update jan_gate_nval_reason set action='" & dgv.Rows(i).Cells(4).Value & " ' , action_remark='" & dgv.Rows(i).Cells(5).Value & "' , action_dt='" & dgv.Rows(i).Cells(6).Value & "', rea_sel='0' where gate_no='" & txtgno.Text & "' and rea_code='" & dgv.Rows(i).Cells(1).Value & "' AND LINE_NO IN (" & TXTLINE.Text & ")
```
- **Trigger Method**: `ADD_REASON`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.ADD_REASONQuery23()`
- **Suggested API Endpoint**: `GET /api/gate/add_reason-23`

###### Query 24: ADD_REASON (Line 669)
```sql
select gate_no,rea_code from jan_gate_nval_reason where gate_no='" & txtgno.Text & "' and rea_code='" & dgv1.Rows(i).Cells(1).Value & "' AND LINE_NO IN (" & TXTLINE.Text & ")
```
- **Trigger Method**: `ADD_REASON`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.ADD_REASONQuery24()`
- **Suggested API Endpoint**: `GET /api/gate/add_reason-24`

###### Query 25: ADD_REASON (Line 718)
```sql
INSERT INTO JAN_GATE_NVAL_REASON(GATE_NO,LINE_NO,REA_CODE,REA_NAME,REA_REMARK,REA_DT,REA_SEL,rea_dt1,REASON_DATE,unit ,UNAME ) VALUES('" & txtgno.Text & "'," & ST & ", '" & dgv1.Rows(i).Cells(1).Value & "','" & dgv1.Rows(i).Cells(2).Value & "','" & dgv1.Rows(i).Cells(3).Value & "','" & dgv1.Rows(i).Cells(4).Value & "','1',sysdate,SYSDATE,'" & unit & "' ,'" & per & "' ,'' )
```
- **Trigger Method**: `ADD_REASON`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.ADD_REASONQuery25()`
- **Suggested API Endpoint**: `GET /api/gate/add_reason-25`

###### Query 26: ADD_REASON (Line 728)
```sql
update JAN_GATE_NVAL_REASON set REA_DT= SYSDATE ,reason_date=sysdate where gate_no='" & txtgno.Text & "' and line_no IN (" & TXTLINE.Text & ") and rea_code='" & dgv1.Rows(i).Cells(1).Value & "'
```
- **Trigger Method**: `ADD_REASON`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.ADD_REASONQuery26()`
- **Suggested API Endpoint**: `GET /api/gate/add_reason-26`

###### Query 27: VALID (Line 738)
```sql
SELECT * FROM JAN_GATE_LINES WHERE VALIDATED IN ('0','4') AND GATE_NO='" & txtgno.Text & "' AND LINE_NO='" & TXTLINE.Text & "'
```
- **Trigger Method**: `VALID`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.VALIDQuery27()`
- **Suggested API Endpoint**: `GET /api/gate/valid-27`

###### Query 28: VALID (Line 750)
```sql
SELECT * FROM JAN_GATE_LINES WHERE GATE_NO='" & txtgno.Text & "' AND VALIDATED NOT IN('0','4') and flag<>'0'
```
- **Trigger Method**: `VALID`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.VALIDQuery28()`
- **Suggested API Endpoint**: `GET /api/gate/valid-28`

###### Query 29: VALID (Line 772)
```sql
SELECT * FROM JAN_GATE_LINES WHERE GATE_NO='" & txtgno.Text & "' AND VALIDATED IN('4')
```
- **Trigger Method**: `VALID`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.VALIDQuery29()`
- **Suggested API Endpoint**: `GET /api/gate/valid-29`

###### Query 30: VALID (Line 784)
```sql
SELECT * FROM JAN_GATE_LINES WHERE GATE_NO='" & txtgno.Text & "' AND VALIDATED IN('5')
```
- **Trigger Method**: `VALID`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.VALIDQuery30()`
- **Suggested API Endpoint**: `GET /api/gate/valid-30`

###### Query 31: VALID (Line 790)
```sql
update jan_gate_HEADER set validated='5',VALIDATED_BY='" & cmbval.SelectedItem & "' where gate_no='" & txtgno.Text & "'
```
- **Trigger Method**: `VALID`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.VALIDQuery31()`
- **Suggested API Endpoint**: `GET /api/gate/valid-31`

##### Screen Component: operation_eod_exception
###### Query 1: operation_eod_exception_Load (Line 14)
```sql
["select PROC_ID,MAJOR_PROCESS,PROCESSNAME,PROCESS_DESCRIPTION,PHASE_OF_IMPLEMENTATION_OF_V2K_INITIATIVES,nvl(eod_id,exception_id )]
```
- **Trigger Method**: `operation_eod_exception_Load`
- **Variables Used**: `sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.operation_eod_exception_LoadQuery1()`
- **Suggested API Endpoint**: `GET /api/gate/operation_eod_exception_load-1`

###### Query 2: DataGridView1_CellClick (Line 55)
```sql
select process_id,(select process_name from jan_eod_process_master where idno=a.process_id and rownum=1)process_name,count(*)cnt from jan_eod_transactions a where process_id in (" & DataGridView1.CurrentRow.Cells(5).Value & ") and operating_unit=103 and comp_flag=0 and a.target_DAte>= TO_DATE('" & Format(inwdtf.Value, "dd/MM/yyyy") & " 00:00:00','DD/MM/YYYY HH24:MI:SS') and a.target_DAte<=TO_DATE('" & Format(inwdtto.Value, "dd/MM/yyyy") & " 23:59:00','DD/MM/YYYY HH24:MI:SS') group by process_id union all select exception_id,remarks, count (*)cnt from jan_outward_new_requirement a where exception_id in (" & DataGridView1.CurrentRow.Cells(5).Value & ") and org_id in (select organization_id from jan_organization_list_View where org_id=103 ) and a.created_dt>= TO_DATE('" & Format(inwdtf.Value, "dd/MM/yyyy") & " 00:00:00','DD/MM/YYYY HH24:MI:SS') and a.created_dt<=TO_DATE('" & Format(inwdtto.Value, "dd/MM/yyyy") & " 23:59:00','DD/MM/YYYY HH24:MI:SS') group by exception_id,remarks
```
- **Trigger Method**: `DataGridView1_CellClick`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.DataGridView1_CellClickQuery2()`
- **Suggested API Endpoint**: `GET /api/gate/datagridview1_cellclick-2`

###### Query 3: DataGridView3_CellClick (Line 70)
```sql
select org,item_no,item_Desc,vendor_name,ref_id,ref_dt,target_date,responsible_person from jan_eod_excel_list a where operating_unit=103 and process_id=" & DataGridView3.CurrentRow.Cells(0).Value & " and a.target_DAte>= TO_DATE('" & Format(inwdtf.Value, "dd/MM/yyyy") & " 00:00:00','DD/MM/YYYY HH24:MI:SS') and a.target_DAte<=TO_DATE('" & Format(inwdtto.Value, "dd/MM/yyyy") & " 23:59:00','DD/MM/YYYY HH24:MI:SS')
```
- **Trigger Method**: `DataGridView3_CellClick`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.DataGridView3_CellClickQuery3()`
- **Suggested API Endpoint**: `GET /api/gate/datagridview3_cellclick-3`

###### Query 4: DataGridView3_CellClick (Line 87)
```sql
select jan_orgcode(org_id)org,jan_itemname(item_id)item_no,jan_itemdesc(jan_itemname(item_id))item_desc,job_qty from jan_outward_new_requirement a where org_id in (select organization_id from jan_organization_list_View where org_id=103) and exception_id= " & DataGridView3.CurrentRow.Cells(0).Value & " and a.created_dt>= TO_DATE('" & Format(inwdtf.Value, "dd/MM/yyyy") & " 00:00:00','DD/MM/YYYY HH24:MI:SS') and a.created_dt<=TO_DATE('" & Format(inwdtto.Value, "dd/MM/yyyy") & " 23:59:00','DD/MM/YYYY HH24:MI:SS')
```
- **Trigger Method**: `DataGridView3_CellClick`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.DataGridView3_CellClickQuery4()`
- **Suggested API Endpoint**: `GET /api/gate/datagridview3_cellclick-4`

##### Screen Component: minmax
###### Query 1: btngo_Click (Line 284)
```sql
[s] and min_minmax_quantity > (nvl(on_hand,0)+nvl(decode(conversion_Rate,null,(1*po_pend),(po_pend* conversion_rate)),0)+nvl(wip_qty,0)+nvl(decode(conversion_Rate,null,(1*qty_inspn),(qty_inspn* conversion_rate)),0)+nvl(decode(conversion_Rate,null,(1*store_pend),(store_pend* conversion_rate)),0)) and nvl(on_hand,0) < min_minmax_quantity and organization_id=(select organization_id from org_organization_definitions a where a.organization_code='" & cmborg.SelectedItem & "') and inventory='" & cmbinv.SelectedItem & "' and item_type='" & cmbitem.SelectedItem & "' and item_no ='" & txtitem.Text & "' and make_buy='" & cmbtyp.SelectedItem & "' order by item_no
```
- **Trigger Method**: `btngo_Click`
- **Variables Used**: `s`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.btngo_ClickQuery1()`
- **Suggested API Endpoint**: `GET /api/po/btngo_click-1`

##### Screen Component: Gate
###### Query 1: Gate_Load (Line 94)
```sql
select REPLACE(vendor_name,'''','''''')supplier,vendor_id from po_vendors where vendor_type_lookup_code <>'EMPLOYEE' AND END_DATE_ACTIVE IS NULL AND VENDOR_ID IN (SELECT VENDOR_ID FROM PO_vENDOR_SITES_ALL WHERE ORG_ID=" & OP_ID & " AND INACTIVE_DATE IS NULL ) ORDER BY VENDOR_NAME
```
- **Trigger Method**: `Gate_Load`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `ISupplierRepository.Gate_LoadQuery1()`
- **Suggested API Endpoint**: `GET /api/supplier/gate_load-1`

###### Query 2: Gate_Load (Line 101)
```sql
select organization_code from org_organization_definitions where organization_id in (" & orgid & " ) order by organization_code
```
- **Trigger Method**: `Gate_Load`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.Gate_LoadQuery2()`
- **Suggested API Endpoint**: `GET /api/gate/gate_load-2`

###### Query 3: Gate_Load (Line 110)
```sql
SELECT REA_NAME FROM JAN_GATE_REASON WHERE REA_CODE IN (42,43,44,45,46)
```
- **Trigger Method**: `Gate_Load`
- **Variables Used**: `cl.sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.Gate_LoadQuery3()`
- **Suggested API Endpoint**: `GET /api/gate/gate_load-3`

###### Query 4: Gate_Load (Line 123)
```sql
SELECT REA_NAME FROM JAN_GATE_REASON WHERE REA_CODE IN (42,43,44,45,46)
```
- **Trigger Method**: `Gate_Load`
- **Variables Used**: `cl.sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.Gate_LoadQuery4()`
- **Suggested API Endpoint**: `GET /api/gate/gate_load-4`

###### Query 5: Gate_Load (Line 133)
```sql
SELECT REA_NAME FROM JAN_GATE_REASON WHERE REA_CODE IN (42,43,44,45,46)
```
- **Trigger Method**: `Gate_Load`
- **Variables Used**: `cl.sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.Gate_LoadQuery5()`
- **Suggested API Endpoint**: `GET /api/gate/gate_load-5`

###### Query 6: btngo_Click (Line 235)
```sql
select a.gate_no,a.gdate,a.supplier_name,a.supplier_site,(select registration_number from JAN_GST_REG_DETAILS_VIEW where PARTY_CLASS_NAME='Supplier' AND REGISTRATION_TYPE_CODE='GSTIN' and rownum=1 And org_id = " & opid & " And org_id = 103 And party_id=a.vendor_id And PARTY_SITE_ID=(Select VENDOR_SITE_ID FROM PO_VENDOR_SITES_ALL WHERE VENDOR_SITE_CODE=A.SUPPLIER_SITE And inactive_Date Is null And org_id=" & opid & " And org_id = 103 And vendor_id=a.vendor_id))gst, a.dc_no,a.dc_Date,A.VALIDATED, (Case When (Select DECODE(POTYPE,'Services',potype,type) from jan_gate_lines WHERE GATe_NO=A.GATE_NO and rownum=1 and flag<>0) is not null then (SELECT DECODE(POTYPE,'Services',potype,type) from jan_gate_lines WHERE GATe_NO=A.GATE_NO and rownum=1 and flag<>0) else a. gtype end ) gtype, DECODE(A.VALIDATED,'0','VALIDATED','1','GATE','2','NOT VALIDATED','3','ACTION TAKEN','4','RTV','5','CANCEL ENTRY','6','No Reference')STATUS,(Select max(reaSON_dATE) rea_dt from jan_gatE_nval_reason where gate_no=a.gate_no and REA_CODE=28) rea_dt,a.org, adi_no,adi_date,reason,decode(uname,null,(SELECT UNAME FROM JAN_GATe_NVAL_REASON WHERE GATe_NO=A.GATE_NO AND ROWNUM=1 HAVING REASON_DATE=MAX(REASON_DATE) GROUP BY UNAME,REASON_DATE ),uname) UNAME,NVL(VENDOR_ID ,0) VENDOR_ID,vehicle_Det,inv_category ,rearef , (SELECT COUNT(*) FROM JAN_Dds_SHORTAGE_VS_COMPLETION xx,jan_gate_lines bb WHERE NEED_BY_WEEK<=TO_NUMBER(TO_CHAR(SYSDATE-14,'IYYYIW')) AND REQUIREMENT-CANCELLED_QTY-RECEIVED_QUANTITY>0 and organization_id=bb.org_id and inventory_item_id=bb.item_id and gate_no=a.gate_no) dds,(select count(*) from jan_gate_lines where gate_no=a.gate_no and flag=1 )gcnt,dcval ,mmcard ,(select count(*) from jan_gate_nval_reason where gate_no=a.gate_no and rea_code=48)eway,validated_by,(select count(*) from jan_gate_lines where gate_no=a.gate_no and item_location is not null)loc_ent, (select item_checked_dt from jan_gate_lines where gate_no=a.gate_no and rownum=1 AND CHECKED_BY IS NOT NULL) item_checked_dt,(select count(*) from jan_gate_lines gl,po_lines_all pol where GL.type='OSP' AND pol.po_line_id=gl.poline and pol.po_header_id=gl.pohead and unit_price=0 and gl.gate_no=a.gate_no) wop ,responsible_person ,shortage_form_no ,(select nvl(checked_by,item_check_by) ||'-'||other_checked_by from jan_gate_lines where gate_no=a.gate_no and rownum=1 AND CHECKED_BY IS NOT NULL )checked_by,kanban_flag , responsible_dept , transport_mode ,person_name ,(select TO_CHAR(item_check_start, 'DD/MM/YYYY HH24:MI:SS AM') ||'-'|| item_check_by from jan_gate_lines where gate_no=a.gate_no and rownum=1) item_check_dt ,nvl(open_challan_recpt ,0) open_challan_recpt,bin_qty, (select case when item_checked_dt is not null AND ROUND((item_checked_dt - item_check_start) * 1440) >0 then case when ROUND((item_checked_dt - item_check_start) * 1440) >60 then TRUNC(MOD(item_checked_dt - item_check_start, 1) * 24) || 'h ' || ROUND(MOD(MOD(item_checked_dt - item_check_start, 1) * 24, 1) * 60) || 'm' else ROUND(MOD(MOD(item_checked_dt - item_check_start, 1) * 24, 1) * 60) || 'm' end end from jan_gate_lines where gate_no=a.gate_no and rownum=1)diff_time,(SELECT COUNT(*) FROM jan_vendor_item_master_Temp1 xx,jan_gate_lines bb WHERE sourcing_percent >0 and xx.self_Certified=1 AND gcs_from_Date is not null and vendor_id=a.vendor_id and xx.org_id=bb.org_id and inventory_item_id=JAN_ITEMNO(BB.ITEM) and gate_no=a.gate_no) gcs from jan_gate_header a where a.gdate>=TO_DATE('" & Format(inwdtf.Value, "dd/MM/yyyy") & " 00:00:00','DD/MM/YYYY HH24:MI:SS') and a.gdate<=TO_DATE('" & Format(inwdtto.Value, "dd/MM/yyyy") & " 23:59:00','DD/MM/YYYY HH24:MI:SS') order by A.gate_no
```
- **Trigger Method**: `btngo_Click`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `ISupplierRepository.btngo_ClickQuery6()`
- **Suggested API Endpoint**: `GET /api/supplier/btngo_click-6`

###### Query 7: btnval_Click (Line 431)
```sql
select dcval from jan_gatE_header a where gatE_no='" & dgv.Rows(dgv.CurrentRow.Index).Cells(1).Value & "'
```
- **Trigger Method**: `btnval_Click`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.btnval_ClickQuery7()`
- **Suggested API Endpoint**: `GET /api/gate/btnval_click-7`

###### Query 8: btnval_Click (Line 450)
```sql
select dcval from jan_gatE_header a where gatE_no='" & dgv.Rows(dgv.CurrentRow.Index).Cells(1).Value & "'
```
- **Trigger Method**: `btnval_Click`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.btnval_ClickQuery8()`
- **Suggested API Endpoint**: `GET /api/gate/btnval_click-8`

###### Query 9: dgv_CellClick (Line 605)
```sql
select count(*) from jan_gate_lines where gate_no=" & dgv.CurrentRow.Cells(1).Value & " and item_check_Start is null
```
- **Trigger Method**: `dgv_CellClick`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.dgv_CellClickQuery9()`
- **Suggested API Endpoint**: `GET /api/gate/dgv_cellclick-9`

###### Query 10: dgv_CellClick (Line 698)
```sql
select courier_name,pod_no ,no_of_box ,po_wt ,rec_Wt from jan_gate_header where gate_no='" & dgv.Rows(i).Cells(1).Value & "'
```
- **Trigger Method**: `dgv_CellClick`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.dgv_CellClickQuery10()`
- **Suggested API Endpoint**: `GET /api/po/dgv_cellclick-10`

###### Query 11: dgv_CellClick (Line 712)
```sql
select jan_orgcode(ship_to_org_id)org,receipt_num from rcv_shipment_headers where packing_slip='" & dgv.Rows(i).Cells(1).Value & "'
```
- **Trigger Method**: `dgv_CellClick`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.dgv_CellClickQuery11()`
- **Suggested API Endpoint**: `GET /api/gate/dgv_cellclick-11`

###### Query 12: dgv_CellClick (Line 737)
```sql
select distinct b.line_no,b.pono,(select creation_Date from po_line_locations_All where line_location_id=b.location_id)podt,(select approved_Date from po_line_locations_All where line_location_id=b.location_id)poapp_dt,case when type='OSP' then (select jan_challan_no from jan_osp_regular_challan_mast where po_header_id=b.pohead and wip_entity_id=b.wip_entity_id and rownum=1)else '' end challan_no,b.item,b.description,b.org,b.poqty,b.popend,b.supdcqty , case when org_id<110 then to_date(null) else Need_by_dt end need_by_dt ,b.potype,b.ratecat,b.actval,b.rev,b.uom,b.job,b.oper,b.osp,b.type,b.remark,B.VALIDATED,DECODE(B.VALIDATED,'0','VALIDATED','1','GATE','2','NOT VALIDATED','3','ACTION TAKEN','4','RETURN TO VENDOR')STATUS , b.poline,b.pohead,(select nvl(invoice_val,0) from jan_gate_header where gatE_no= " & dgv.Rows(i).Cells(1).Value & ")invoice_val,org_id,(SELECT COUNT(*) FROM JAN_Dds_SHORTAGE_VS_COMPLETION xx WHERE NEED_BY_WEEK<=TO_NUMBER(TO_CHAR(SYSDATE-14,'IYYYIW')) AND REQUIREMENT-CANCELLED_QTY-RECEIVED_QUANTITY>0 and organization_id=b.org_id and inventory_item_id=b.item_id ) dds,(SELECT min(NEED_BY_WEEK) FROM JAN_Dds_SHORTAGE_VS_COMPLETION xx WHERE REQUIREMENT-CANCELLED_QTY-RECEIVED_QUANTITY>0 and organization_id=b.org_id and inventory_item_id=b.item_id )dds_wk,(select buyer_name from jan_item_master_Tab where inventory_item_id=b.item_id and organization_id=b.org_id)buyer_name, CASE WHEN NVL(" & dgv.Rows(i).Cells(17).Value & ",0) =0 THEN 0 ELSE nvl((SELECT SELF_certified from jan_vendor_item_master_temp1 where inventory_item_id=JAN_ITEMNO(B.ITEM) and org_id=b.org_id and sourcing_percent >0 and vendor_id= " & dgv.Rows(i).Cells(17).Value & " and osp_no=b.osp),0) END sc ,nvl(shortage_Qty,0)shortage_Qty ,pack_type,pack_qty , [" nvl((select sum(stg_mtl_cost) from jan_wip_materials where entity_id=b.wip_entity_id) ,0) stage_mtl_cost ,] From jan_gate_lines b where b.gate_no='" & dgv.Rows(i).Cells(1).Value & "'and flag ='1' order by line_no
```
- **Trigger Method**: `dgv_CellClick`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.dgv_CellClickQuery12()`
- **Suggested API Endpoint**: `GET /api/po/dgv_cellclick-12`

###### Query 13: btnmod_Click (Line 966)
```sql
select gtype ,CASE WHEN GTYPE='PO' THEN (select count(*) from jan_blanket_vendor_status where vendor_id=a.vendor_id and releases>0 ) ELSE 0 END cnt from jan_gate_header a where gate_no='" & dgv.Rows(dgv.CurrentRow.Index).Cells(1).Value & "'
```
- **Trigger Method**: `btnmod_Click`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.btnmod_ClickQuery13()`
- **Suggested API Endpoint**: `GET /api/gate/btnmod_click-13`

###### Query 14: btnwop_Click (Line 1215)
```sql
select supplier_name,dc_no,dc_date,item,pono,supdcqty,podt,gh.gdate from jan_gate_lines GL,JAN_GATE_HEader gh where gh.gate_no=" & dgv.Rows(dgv.CurrentRow.Index).Cells(1).Value & " And gh.gate_no=gl.gate_no
```
- **Trigger Method**: `btnwop_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `ISupplierRepository.btnwop_ClickQuery14()`
- **Suggested API Endpoint**: `GET /api/supplier/btnwop_click-14`

###### Query 15: btnwop_Click (Line 1261)
```sql
select reason_name,description from mtl_transaction_reasons where reason_name like 'OSP%' and ATTRIBUTE1='Without Process' union all select reason_name,description from mtl_transaction_reasons where reason_name='OSP-018'
```
- **Trigger Method**: `btnwop_Click`
- **Variables Used**: `sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.btnwop_ClickQuery15()`
- **Suggested API Endpoint**: `GET /api/gate/btnwop_click-15`

###### Query 16: inw_tag (Line 1320)
```sql
select gh.gate_no,gh.gdate,substr(gh.supplier_name,0,30)supplier_name,gl.item,substr(jan_itemdesc(gl.item),0,20) it_Desc, sum(gl.supdcqty)qty,CASE WHEN (SELECT COUNT (*) FROM JAN_DIRECT_DELIVERY_SUPPLIER WHERE VID=GH.vendor_ID) >0 AND org_id <>384 THEN JAN_ORGCODE(org_id)|| '-DD' WHEN (SELECT COUNT(*) FROM JAN_VENDOR_ITEM_MASTER_TEMP1 WHERE VENDOR_ID=gh.vendor_ID AND ORG_ID=gl.org_id AND INVENTORY_ITEM_ID=JAN_ITEMNO(gl.ITEM) AND SOURCING_PERCENT>0 AND SPOT_INSPECTION=1) >0 THEN JAN_ORGCODE(gl.org_id)|| '-SI'WHEN NVL((select INSP_DAYS from jan_item_master_tab where INVENTORY_ITEM_ID=JAN_ITEMNO(gl.ITEM) AND insp_days is not null AND ROWNUM=1),case when gl.ORG_ID=505 then 10 else 3 end )<3 THEN JAN_ORGCODE(gl.ORG_ID)|| '-1' when NVL((select INSP_DAYS from jan_item_master_tab where INVENTORY_ITEM_ID=JAN_ITEMNO(gl.ITEM) AND insp_days is not null AND ROWNUM=1),case when gl.ORG_ID=505 then 10 else 3 end )=3 THEN JAN_ORGCODE(gl.ORG_ID)|| '-2' when NVL((select INSP_DAYS from jan_item_master_tab where INVENTORY_ITEM_ID=JAN_ITEMNO(gl.ITEM) AND insp_days is not null AND ROWNUM=1),case when gl.ORG_ID=505 then 10 else 3 end )>3 and NVL((select INSP_DAYS from jan_item_master_tab where INVENTORY_ITEM_ID=JAN_ITEMNO(gl.ITEM) AND insp_days is not null AND ROWNUM=1),case when gl.ORG_ID=505 then 10 else 3 end )<5 THEN JAN_ORGCODE(gl.ORG_ID)||'-3'when NVL((select INSP_DAYS from jan_item_master_tab where INVENTORY_ITEM_ID=JAN_ITEMNO(gl.ITEM) AND insp_days is not null AND ROWNUM=1),case when gl.ORG_ID=505 then 10 else 3 end )>=5 and NVL((select INSP_DAYS from jan_item_master_tab where INVENTORY_ITEM_ID=JAN_ITEMNO(gl.ITEM) AND insp_days is not null AND ROWNUM=1),case when gl.ORG_ID=505 then 10 else 3 end )<7 THEN JAN_ORGCODE(gl.ORG_ID)|| '-4' when NVL((select INSP_DAYS from jan_item_master_tab where INVENTORY_ITEM_ID=JAN_ITEMNO(gl.ITEM) AND insp_days is not null AND ROWNUM=1),case when gl.ORG_ID=505 then 10 else 3 end )>=7 THEN JAN_ORGCODE(gl.ORG_ID)|| '-5' end insp_cat,gl.pack_type,gl.pack_qty from jan_gate_header gh,jan_gate_lines gl where gh.gate_no=gl.gate_no and gh.gate_no in (" & gt & " ) group by gh.gate_no,gh.supplier_name,gl.item,gl.org_id,gh.gdate,GH.VENDOR_ID,gl.pack_type,gl.pack_qty
```
- **Trigger Method**: `inw_tag`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `ISupplierRepository.inw_tagQuery16()`
- **Suggested API Endpoint**: `GET /api/supplier/inw_tag-16`

###### Query 17: inw_tag_new (Line 1406)
```sql
select gh.gate_no,gh.gdate,substr(gh.supplier_name,0,30)supplier_name,gl.item,substr(jan_itemdesc(gl.item),0,20) it_Desc, sum(gl.supdcqty)qty,(select lot_no from jan_fifo_lotno_details where ref_id=gh.gate_no and organization_id = gl.org_id AND inventory_item_id= jan_itemno(gl.item) )lot_no,rowtocol('select LOCATION FROM JAN_ITEM_VS_LOCATOR WHERE organization_id = '||gl.org_id||' AND item_no='''||gl.item||'''')loc,CASE WHEN (SELECT COUNT (*) FROM JAN_DIRECT_DELIVERY_SUPPLIER WHERE VID=GH.vendor_ID) >0 AND org_id <>384 THEN JAN_ORGCODE(org_id)|| '-DD' WHEN (SELECT COUNT(*) FROM JAN_VENDOR_ITEM_MASTER_TEMP1 WHERE VENDOR_ID=gh.vendor_ID AND ORG_ID=gl.org_id AND INVENTORY_ITEM_ID=JAN_ITEMNO(gl.ITEM) AND SOURCING_PERCENT>0 AND SPOT_INSPECTION=1) >0 THEN JAN_ORGCODE(gl.org_id)|| '-SI'WHEN NVL((select INSP_DAYS from jan_item_master_tab where INVENTORY_ITEM_ID=JAN_ITEMNO(gl.ITEM) AND insp_days is not null AND ROWNUM=1),case when gl.ORG_ID=505 then 10 else 3 end )<3 THEN JAN_ORGCODE(gl.ORG_ID)|| '-1' when NVL((select INSP_DAYS from jan_item_master_tab where INVENTORY_ITEM_ID=JAN_ITEMNO(gl.ITEM) AND insp_days is not null AND ROWNUM=1),case when gl.ORG_ID=505 then 10 else 3 end )=3 THEN JAN_ORGCODE(gl.ORG_ID)|| '-2' when NVL((select INSP_DAYS from jan_item_master_tab where INVENTORY_ITEM_ID=JAN_ITEMNO(gl.ITEM) AND insp_days is not null AND ROWNUM=1),case when gl.ORG_ID=505 then 10 else 3 end )>3 and NVL((select INSP_DAYS from jan_item_master_tab where INVENTORY_ITEM_ID=JAN_ITEMNO(gl.ITEM) AND insp_days is not null AND ROWNUM=1),case when gl.ORG_ID=505 then 10 else 3 end )<5 THEN JAN_ORGCODE(gl.ORG_ID)||'-3'when NVL((select INSP_DAYS from jan_item_master_tab where INVENTORY_ITEM_ID=JAN_ITEMNO(gl.ITEM) AND insp_days is not null AND ROWNUM=1),case when gl.ORG_ID=505 then 10 else 3 end )>=5 and NVL((select INSP_DAYS from jan_item_master_tab where INVENTORY_ITEM_ID=JAN_ITEMNO(gl.ITEM) AND insp_days is not null AND ROWNUM=1),case when gl.ORG_ID=505 then 10 else 3 end )<7 THEN JAN_ORGCODE(gl.ORG_ID)|| '-4' when NVL((select INSP_DAYS from jan_item_master_tab where INVENTORY_ITEM_ID=JAN_ITEMNO(gl.ITEM) AND insp_days is not null AND ROWNUM=1),case when gl.ORG_ID=505 then 10 else 3 end )>=7 THEN JAN_ORGCODE(gl.ORG_ID)|| '-5' end insp_cat ,(select weight from jan_lot_weight_master where organization_id = gl.org_id AND inventory_item_id= jan_itemno(gl.item) )wt from jan_gate_header gh,jan_gate_lines gl where gh.gate_no=gl.gate_no and gh.gate_no in (" & gt & " ) group by gh.gate_no,gh.supplier_name,gl.item,gl.org_id,gh.gdate,GH.VENDOR_ID
```
- **Trigger Method**: `inw_tag_new`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `ISupplierRepository.inw_tag_newQuery17()`
- **Suggested API Endpoint**: `GET /api/supplier/inw_tag_new-17`

###### Query 18: job_shrt_Click (Line 1601)
```sql
select count(*) from jan_gate_header where gate_no=" & dgv.Rows(dgv.CurrentRow.Index).Cells(1).Value & " and shortage_form_no is null
```
- **Trigger Method**: `job_shrt_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.job_shrt_ClickQuery18()`
- **Suggested API Endpoint**: `GET /api/gate/job_shrt_click-18`

###### Query 19: job_shrt_Click (Line 1607)
```sql
update jan_gate_header set shortage_form_no =JAN_JOBC_NO.nextval,shortage_form_dt=sysdate where gate_no=" & dgv.Rows(dgv.CurrentRow.Index).Cells(1).Value & "
```
- **Trigger Method**: `job_shrt_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.job_shrt_ClickQuery19()`
- **Suggested API Endpoint**: `GET /api/gate/job_shrt_click-19`

###### Query 20: job_shrt_Click (Line 1624)
```sql
["select shortage_form_no , TO_CHAR(shortage_form_dt,'dd-mon-yyyy')form_dt, TO_CHAR(b.GDATE,'dd-mon-yyyy')GDATE,b.GATE_NO,JAN_FY(sysdate)FRDS_YEAR,ITEM, SUPPLIER_NAME ,a.DESCRIPTION,(select wip_entity_name from wip_entities where wip_entity_id=a.wip_entity_id)JOB,jan_orgcode(a.ORG_id)org ,SHORTAGE_QTY, b.DC_NO , TO_CHAR(b.DC_DATE,'dd-mon-yyyy') DC_DATE,a.pono, case when b.gtype='OSP' then nvl((select sum(stg_mtl_cost) from jan_wip_materials where entity_id=a.wip_entity_id) ,0)]
```
- **Trigger Method**: `job_shrt_Click`
- **Variables Used**: `sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `ISupplierRepository.job_shrt_ClickQuery20()`
- **Suggested API Endpoint**: `GET /api/supplier/job_shrt_click-20`

###### Query 21: btnrtv_Click (Line 1823)
```sql
select * from jan_gate_rtv where gate_no='" & dgv.Rows(i).Cells(0).Value & "'
```
- **Trigger Method**: `btnrtv_Click`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.btnrtv_ClickQuery21()`
- **Suggested API Endpoint**: `GET /api/gate/btnrtv_click-21`

##### Screen Component: cancelentry
###### Query 1: Button1_Click (Line 10)
```sql
update jan_gate_header set reason='" & cmbrea.SelectedItem & "',rearef='" & txtref.Text & "' ,org='" & cmborg.SelectedItem & "' where gate_no=" & Gate.dgv.Rows(Gate.dgv.CurrentRow.Index).Cells(1).Value & "
```
- **Trigger Method**: `Button1_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.Button1_ClickQuery1()`
- **Suggested API Endpoint**: `GET /api/gate/button1_click-1`

###### Query 2: Button1_Click (Line 31)
```sql
insert into jan_gatE_nval_reason (gate_no,rea_remark,rea_dt,flag,gdate,UNAME,rea_code,reason_date) values (" & Gate.dgv.Rows(Gate.dgv.CurrentRow.Index).Cells(1).Value & ",'" & cmbrea.SelectedItem & "',sysdate,'1',sysdate , '" & userid & "' ,'21',sysdate) ,'4',sysdate) ,'1',sysdate)
```
- **Trigger Method**: `Button1_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.Button1_ClickQuery2()`
- **Suggested API Endpoint**: `GET /api/gate/button1_click-2`

###### Query 3: Button1_Click (Line 35)
```sql
select reason from jan_gatE_header where gatE_no=" & Gate.dgv.Rows(Gate.dgv.CurrentRow.Index).Cells(1).Value & "
```
- **Trigger Method**: `Button1_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.Button1_ClickQuery3()`
- **Suggested API Endpoint**: `GET /api/gate/button1_click-3`

###### Query 4: Button1_Click (Line 46)
```sql
update jan_gate_header set validated='4' where gate_no= " & Gate.dgv.Rows(Gate.dgv.CurrentRow.Index).Cells(1).Value & "
```
- **Trigger Method**: `Button1_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.Button1_ClickQuery4()`
- **Suggested API Endpoint**: `GET /api/gate/button1_click-4`

###### Query 5: cancelentry_Load (Line 59)
```sql
select organization_code from org_organization_definitions where organization_id in(" & orgid & " )order by organization_code
```
- **Trigger Method**: `cancelentry_Load`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.cancelentry_LoadQuery5()`
- **Suggested API Endpoint**: `GET /api/gate/cancelentry_load-5`

###### Query 6: cancelentry_Load (Line 67)
```sql
SELECT REASON,REAREF,ORG FROM JAN_GAte_HEADER WHERE GATe_NO=" & Gate.dgv.Rows(Gate.dgv.CurrentRow.Index).Cells(1).Value & "
```
- **Trigger Method**: `cancelentry_Load`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.cancelentry_LoadQuery6()`
- **Suggested API Endpoint**: `GET /api/gate/cancelentry_load-6`

##### Screen Component: GateUpdate
###### Query 1: btndel_Click (Line 66)
```sql
select receipt_num from rcv_shipment_headers where packing_slip='" & txtgate.Text & "'
```
- **Trigger Method**: `btndel_Click`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.btndel_ClickQuery1()`
- **Suggested API Endpoint**: `GET /api/gate/btndel_click-1`

###### Query 2: btndel_Click (Line 76)
```sql
SELECT * FROM JAN_GATe_LINES WHERE GATE_NO=" & txtgate.Text & "
```
- **Trigger Method**: `btndel_Click`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.btndel_ClickQuery2()`
- **Suggested API Endpoint**: `GET /api/gate/btndel_click-2`

###### Query 3: btndel_Click (Line 81)
```sql
SELECT * FROM JAN_GATe_LINES WHERE GATE_NO=" & txtgate.Text & "
```
- **Trigger Method**: `btndel_Click`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.btndel_ClickQuery3()`
- **Suggested API Endpoint**: `GET /api/gate/btndel_click-3`

###### Query 4: btndel_Click (Line 101)
```sql
select count(*) from jan_gate_lines where checked_by is not null and gate_no=" & txtgate.Text & "
```
- **Trigger Method**: `btndel_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.btndel_ClickQuery4()`
- **Suggested API Endpoint**: `GET /api/gate/btndel_click-4`

###### Query 5: GateUpdate_Load (Line 153)
```sql
select description from jan_open_challan_Category where CAT_FOR_GATE=1 and live_Flag=1
```
- **Trigger Method**: `GateUpdate_Load`
- **Variables Used**: `cl.sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.GateUpdate_LoadQuery5()`
- **Suggested API Endpoint**: `GET /api/gate/gateupdate_load-5`

###### Query 6: GateUpdate_Load (Line 165)
```sql
select * from jan_gate_courier
```
- **Trigger Method**: `GateUpdate_Load`
- **Variables Used**: `sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.GateUpdate_LoadQuery6()`
- **Suggested API Endpoint**: `GET /api/gate/gateupdate_load-6`

##### Screen Component: Login
###### Query 1: Button1_Click (Line 22)
```sql
select * from jan_gate_login where role ='" & userid & "'
```
- **Trigger Method**: `Button1_Click`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.Button1_ClickQuery1()`
- **Suggested API Endpoint**: `GET /api/gate/button1_click-1`

##### Screen Component: Status
###### Query 1: Status_Load (Line 20)
```sql
select REPLACE(vendor_name,'''','''''')supplier,vendor_id from po_vendors where vendor_type_lookup_code <>'EMPLOYEE' AND END_DATE_ACTIVE IS NULL AND VENDOR_ID IN (SELECT VENDOR_ID FROM PO_vENDOR_SITES_ALL WHERE ORG_ID=" & OP_ID & " AND INACTIVE_DATE IS NULL ) ORDER BY VENDOR_NAME
```
- **Trigger Method**: `Status_Load`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `ISupplierRepository.Status_LoadQuery1()`
- **Suggested API Endpoint**: `GET /api/supplier/status_load-1`

###### Query 2: Status_Load (Line 27)
```sql
select organization_code from org_organization_definitions where organization_id in(" & orgid & " )order by organization_code
```
- **Trigger Method**: `Status_Load`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.Status_LoadQuery2()`
- **Suggested API Endpoint**: `GET /api/gate/status_load-2`

###### Query 3: Status_Load (Line 34)
```sql
select * from jan_gate_courier
```
- **Trigger Method**: `Status_Load`
- **Variables Used**: `sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.Status_LoadQuery3()`
- **Suggested API Endpoint**: `GET /api/gate/status_load-3`

###### Query 4: Button3_Click (Line 54)
```sql
select gate_no,gdate,dc_no,dc_Date,supplier_name,courier_name,pod_no,po_wt,no_of_box,rec_Wt,rec_wt_dt from jan_gatE_header where unit= '" & unit & "' and inv_category is null and gtype='PO' and courier_name is not null and to_date(gdate)>='" & Format(inwdtf.Value, "dd-MMM-yyyy") & "' and to_date(gdate)<='" & Format(inwdtto.Value, "dd-MMM-yyyy") & "' order by gate_no,supplier_name
```
- **Trigger Method**: `Button3_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `ISupplierRepository.Button3_ClickQuery4()`
- **Suggested API Endpoint**: `GET /api/supplier/button3_click-4`

###### Query 5: Button4_Click (Line 134)
```sql
select Gate_no , GDate, (SELECT LISTAGG ( distinct org, ', ' ) WITHIN GROUP (ORDER BY line_no) from jan_gate_lines where gate_no=a.gate_no )org, supplier_name, supplier_site, (select registration_number from JAN_GST_REG_DETAILS_VIEW where PARTY_CLASS_NAME='Supplier' AND REGISTRATION_TYPE_CODE='GSTIN' and rownum=1 And org_id = " & OP_ID & " And party_id=a.vendor_id And PARTY_SITE_ID=(Select VENDOR_SITE_ID FROM PO_VENDOR_SITES_ALL WHERE VENDOR_SITE_CODE=A.SUPPLIER_SITE And inactive_Date Is null And org_id=" & OP_ID & " And vendor_id=a.vendor_id))gst,dc_no,dc_date , gType ,(Select count(*) from jan_gate_lines where gate_no=a.gate_no) no_of_lines, case when (SELECT COUNT(*) FROM jan_vendor_item_master_Temp1 xx,jan_gate_lines bb WHERE sourcing_percent >0 and xx.self_Certified=1 AND gcs_from_Date is not null and vendor_id=a.vendor_id and xx.org_id=bb.org_id and inventory_item_id=JAN_ITEMNO(BB.ITEM) and gate_no=a.gate_no) >0 then 'GCS DC' else ''end gcs, responsible_person,( select listagg(distinct rea_name, ', ' )WITHIN GROUP (ORDER BY line_no) from jan_gate_nval_reason where gate_no= a.gate_no and rea_code<>28 )reason_for_notvalidate,( select min(reason_Date) from jan_gate_nval_reason where gate_no= a.gate_no and rea_code<>28 ) notvalidate_Date , case when validated=0 then 'Validated' when validated=2 then 'Not Validated' when validated=1 then 'Gate' when validated=4 then 'RTV' when validated=6 then 'No Reference' end Status ,''Remark,(select max(reason_Date) from jan_gate_nval_reason where gate_no=a.gate_no and rea_code=28) validated_on,validated_by,eway_no,(select checked_by from jan_gate_lines where gate_no=a.gate_no and rownum=1 and checked_by is not null)checked_by,dcval , ( select LISTAGG ( receipt_num, ', ' ) WITHIN GROUP (ORDER BY packing_slip) from rcv_shipment_headers where packing_slip= a.gate_id )receipt_no from jan_gate_header a where unit='" & unit & "' and gDATE>=TO_DATE('" & Format(inwdtf.Value, "dd/MM/yyyy") & " 00:00:00','DD/MM/YYYY HH24:MI:SS') and gDATE<=TO_DATE('" & Format(inwdtto.Value, "dd/MM/yyyy") & " 23:59:00','DD/MM/YYYY HH24:MI:SS') and inv_Category is null
```
- **Trigger Method**: `Button4_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `ISupplierRepository.Button4_ClickQuery5()`
- **Suggested API Endpoint**: `GET /api/supplier/button4_click-5`

###### Query 6: Button5_Click (Line 230)
```sql
select DISTINCT a.gate_no,a.gdate,a.supplier_name,a.dc_no,a.dc_date,(case when (SELECT DECODE(POTYPE,'Services',potype,type) from jan_gate_lines WHERE GATe_NO=A.GATE_NO and rownum=1 and flag<>0) is not null then (SELECT DECODE(POTYPE,'Services',potype,type) from jan_gate_lines WHERE GATe_NO=A.GATE_NO and rownum=1 and flag<>0) else a. gtype end ) gtype,nvl(A.ORG,'-') org,nvl(b.rea_name,'-')rea_name,nvl(b.rea_remark,'-')rea_remark ,A.validated_by ,B.reason_Date ,(select checked_by from jan_gate_lines where gate_no=a.gate_no AND ROWNUM=1)checked_by from jan_gate_header a,jan_gate_nval_reason b where a.gatE_no=b.gate_no and a.validated in(2) and b.rea_code <>28 AND a.gdate>=TO_DATE('" & Format(inwdtf.Value, "dd/MM/yyyy") & " 00:00:00','DD/MM/YYYY HH24:MI:SS') and a.gdate<=TO_DATE('" & Format(inwdtto.Value, "dd/MM/yyyy") & " 23:59:00','DD/MM/YYYY HH24:MI:SS') and A.unit='" & unit & "' order by a.gate_no
```
- **Trigger Method**: `Button5_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `ISupplierRepository.Button5_ClickQuery6()`
- **Suggested API Endpoint**: `GET /api/supplier/button5_click-6`

###### Query 7: Button6_Click (Line 276)
```sql
select a.Gate_no , a.GDate, supplier_name, supplier_site, dc_no,dc_date , A.gType , case when A.validated=0 then 'Validated' when A.validated=2 then 'Not Validated' when A.validated=1 then 'Gate' when A.validated=4 then 'RTV' when A.validated=6 then 'No Reference' end Status ,''Remark,(select max(reason_Date) from jan_gate_nval_reason where gate_no=a.gate_no and rea_code=28) validated_on,validated_by,(select checked_by from jan_gate_lines where gate_no=a.gate_no and rownum=1 and checked_by is not null)checked_by,rowtocol('select receipt_num from rcv_shipment_headers where packing_slip='''||a.gate_id||'''' )receipt_no,b.item,b.supdcqty qty ,jan_orgcode(org_id)org,substr(rowtocol('select location from jan_item_vs_locator where inventory_item_id =jan_itemno('''|| b.item|| ''' ) and organization_id= '||b.org_id|| '' ),0,35) location from jan_gate_header a ,jan_gate_lines b where a.gate_no=b.gate_no and a.unit='" & unit & "' and a.gDATE>=TO_DATE('" & Format(inwdtf.Value, "dd/MM/yyyy") & " 00:00:00','DD/MM/YYYY HH24:MI:SS') and a.gDATE<=TO_DATE('" & Format(inwdtto.Value, "dd/MM/yyyy") & " 23:59:00','DD/MM/YYYY HH24:MI:SS') and inv_Category is null
```
- **Trigger Method**: `Button6_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `ISupplierRepository.Button6_ClickQuery7()`
- **Suggested API Endpoint**: `GET /api/supplier/button6_click-7`

###### Query 8: btn_short_Click (Line 345)
```sql
["select a.Gate_no , a.GDate, a.shortage_form_no, supplier_name, supplier_site, dc_no,dc_date , A.gType , case when A.validated=0 then 'Validated' when A.validated=2 then 'Not Validated' when A.validated=1 then 'Gate' when A.validated=4 then 'RTV' when A.validated=6 then 'No Reference' end Status ,''Remark,(select max(reason_Date) from jan_gate_nval_reason where gate_no=a.gate_no and rea_code=28) validated_on,validated_by,(select checked_by from jan_gate_lines where gate_no=a.gate_no and rownum=1 and checked_by is not null)checked_by,rowtocol('select receipt_num from rcv_shipment_headers where packing_slip='''||a.gate_id||'''' )receipt_no,b.item,b.supdcqty qty ,jan_orgcode(org_id)org,b.shortage_Qty, round(b.shortage_Qty* case when a.gtype='OSP' then nvl((select sum(stg_mtl_cost) from jan_wip_materials where entity_id=b.wip_entity_id) ,0)]
```
- **Trigger Method**: `btn_short_Click`
- **Variables Used**: `sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `ISupplierRepository.btn_short_ClickQuery8()`
- **Suggested API Endpoint**: `GET /api/supplier/btn_short_click-8`

##### Screen Component: gt_checked
###### Query 1: gt_checked_Load (Line 13)
```sql
select organization_code from MTL_PARAMETERS where organization_id in (select org_id from jan_gatE_lines where gate_no=" & txtgate.Text & " ) order by organization_code
```
- **Trigger Method**: `gt_checked_Load`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.gt_checked_LoadQuery1()`
- **Suggested API Endpoint**: `GET /api/gate/gt_checked_load-1`

###### Query 2: gt_checked_Load (Line 31)
```sql
select item,sum(supdcqty)qty from jan_gate_lines where gate_no=" & txtgate.Text & " group by item
```
- **Trigger Method**: `gt_checked_Load`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.gt_checked_LoadQuery2()`
- **Suggested API Endpoint**: `GET /api/gate/gt_checked_load-2`

###### Query 3: gt_checked_Load (Line 48)
```sql
select count(*) from jan_gate_lines where gate_no=" & txtgate.Text & " and item_check_by is not null
```
- **Trigger Method**: `gt_checked_Load`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.gt_checked_LoadQuery3()`
- **Suggested API Endpoint**: `GET /api/gate/gt_checked_load-3`

###### Query 4: gt_checked_Load (Line 55)
```sql
select item_check_by,CHECKED_BY from jan_gate_lines where gate_no=" & txtgate.Text & " and rownum=1
```
- **Trigger Method**: `gt_checked_Load`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.gt_checked_LoadQuery4()`
- **Suggested API Endpoint**: `GET /api/gate/gt_checked_load-4`

###### Query 5: gt_checked_Load (Line 64)
```sql
select ITEM_NO, GATE_QTY, PACK_METHOD, NO_OF_PACK, PACK_QTY, pack_qty total_qty , STATUS from jan_gate_pack_Details a where gate_no=" & txtgate.Text & "
```
- **Trigger Method**: `gt_checked_Load`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.gt_checked_LoadQuery5()`
- **Suggested API Endpoint**: `GET /api/gate/gt_checked_load-5`

###### Query 6: btngo_Click (Line 101)
```sql
select count(*) from jan_gate_lines where gate_no=" & txtgate.Text & " and item_check_by is not null
```
- **Trigger Method**: `btngo_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.btngo_ClickQuery6()`
- **Suggested API Endpoint**: `GET /api/gate/btngo_click-6`

###### Query 7: btngo_Click (Line 115)
```sql
select count(*) from JAN_INSP_TRACEABILITY_T where DIVISION='INWARD' and ref_id= '" & txtstby.Text.ToUpper & "' '" & txtchk.Text.ToUpper & "'
```
- **Trigger Method**: `btngo_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.btngo_ClickQuery7()`
- **Suggested API Endpoint**: `GET /api/gate/btngo_click-7`

###### Query 8: btngo_Click (Line 127)
```sql
select count(*) from jan_gate_lines where gate_no=" & txtgate.Text & " and item_check_by is not null
```
- **Trigger Method**: `btngo_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.btngo_ClickQuery8()`
- **Suggested API Endpoint**: `GET /api/gate/btngo_click-8`

###### Query 9: btngo_Click (Line 135)
```sql
update jan_gate_lines Set item_check_Start =sysdate, item_check_by = (Select measurement_name from JAN_INSP_TRACEABILITY_T where DIVISION='INWARD' and ref_id='" & txtstby.Text.ToUpper & "') where gate_no=" & txtgate.Text & "
```
- **Trigger Method**: `btngo_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.btngo_ClickQuery9()`
- **Suggested API Endpoint**: `GET /api/gate/btngo_click-9`

###### Query 10: btngo_Click (Line 180)
```sql
update jan_gate_lines Set checked_by = (Select measurement_name from JAN_INSP_TRACEABILITY_T where DIVISION='INWARD' and ref_id='" & txtchk.Text.ToUpper & "') '" & txtchk.Text & "' ,item_location='" & txtqty.Text & "',other_checked_by='" & txt_oth.Text & "',item_checked_Dt=sysdate where gate_no=" & txtgate.Text & " And org_id=jan_orgid('" & cmborg.Text & "') and line_no= '" & cmbitem.SelectedItem.ToString.Substring(idx, idx1) & "'
```
- **Trigger Method**: `btngo_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.btngo_ClickQuery10()`
- **Suggested API Endpoint**: `GET /api/gate/btngo_click-10`

###### Query 11: cmborg_SelectedIndexChanged (Line 200)
```sql
Select item||'*'|| line_no list from jan_gate_lines where gate_no= " & txtgate.Text & " and org_id=jan_orgid('" & cmborg.Text & "')
```
- **Trigger Method**: `cmborg_SelectedIndexChanged`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.cmborg_SelectedIndexChangedQuery11()`
- **Suggested API Endpoint**: `GET /api/gate/cmborg_selectedindexchanged-11`

###### Query 12: btnpack_Click (Line 239)
```sql
select count(*) from jan_gate_pack_Details where gate_no=" & txtgate.Text & " and status='MISMATCH'
```
- **Trigger Method**: `btnpack_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.btnpack_ClickQuery12()`
- **Suggested API Endpoint**: `GET /api/gate/btnpack_click-12`

###### Query 13: btnpack_Click (Line 248)
```sql
insert into jan_gate_pack_Details (gate_no,item_No,gate_qty,pack_method ,no_of_pack,pack_qty ) values (" & txtgate.Text & ",'" & .Cells(0).Value & "'," & .Cells(1).Value & ",'" & .Cells(2).Value & "'," & .Cells(3).Value & "," & .Cells(5).Value & ")
```
- **Trigger Method**: `btnpack_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.btnpack_ClickQuery13()`
- **Suggested API Endpoint**: `GET /api/gate/btnpack_click-13`

###### Query 14: btnpack_Click (Line 257)
```sql
delete from jan_gate_pack_Details where gate_no=" & txtgate.Text & "
```
- **Trigger Method**: `btnpack_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.btnpack_ClickQuery14()`
- **Suggested API Endpoint**: `GET /api/gate/btnpack_click-14`

###### Query 15: btnpack_Click (Line 266)
```sql
insert into jan_gate_pack_Details (gate_no,item_No,gate_qty,pack_method ,no_of_pack,pack_qty ) values (" & txtgate.Text & ",'" & .Cells(0).Value & "'," & .Cells(1).Value & ",'" & .Cells(2).Value & "'," & .Cells(3).Value & "," & .Cells(5).Value & ")
```
- **Trigger Method**: `btnpack_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.btnpack_ClickQuery15()`
- **Suggested API Endpoint**: `GET /api/gate/btnpack_click-15`

###### Query 16: btnpack_Click (Line 281)
```sql
["select GATE_NO, iTEM_NO,]
```
- **Trigger Method**: `btnpack_Click`
- **Variables Used**: `sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.btnpack_ClickQuery16()`
- **Suggested API Endpoint**: `GET /api/gate/btnpack_click-16`

###### Query 17: btnpack_Click (Line 288)
```sql
update jan_gate_pack_Details set status ='" & ds.Tables("packdet").Rows(l).Item(2) & "' where gate_no=" & txtgate.Text & " and item_no='" & ds.Tables("packdet").Rows(l).Item(1) & "'
```
- **Trigger Method**: `btnpack_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.btnpack_ClickQuery17()`
- **Suggested API Endpoint**: `GET /api/gate/btnpack_click-17`

###### Query 18: btnpack_Click (Line 294)
```sql
select item_No,gate_qty,pack_method ,no_of_pack,pack_qty,no_of_pack*pack_qty total_qty ,status from jan_gate_pack_Details where gate_no=" & txtgate.Text & "
```
- **Trigger Method**: `btnpack_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.btnpack_ClickQuery18()`
- **Suggested API Endpoint**: `GET /api/gate/btnpack_click-18`

###### Query 19: cmbitem_SelectedIndexChanged (Line 342)
```sql
select supdcqty from jan_gate_lines where gate_no=" & txtgate.Text & " And line_no = '" & cmbitem.SelectedItem.ToString.Substring(idx, idx1) & "'
```
- **Trigger Method**: `cmbitem_SelectedIndexChanged`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.cmbitem_SelectedIndexChangedQuery19()`
- **Suggested API Endpoint**: `GET /api/gate/cmbitem_selectedindexchanged-19`

##### Screen Component: direct_delivery
###### Query 1: btnshow_Click (Line 101)
```sql
select asn_no from jan_gate_lines_v where job='
```
- **Trigger Method**: `btnshow_Click`
- **Variables Used**: `"select asn_no from jan_gate_lines_v where job='"`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.btnshow_ClickQuery1()`
- **Suggested API Endpoint**: `GET /api/gate/btnshow_click-1`

###### Query 2: btnshow_Click (Line 101)
```sql
select asn_no from jan_gate_lines_v where job='" & DV(i)("jobno
```
- **Trigger Method**: `btnshow_Click`
- **Variables Used**: `literal`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.btnshow_ClickQuery2()`
- **Suggested API Endpoint**: `GET /api/gate/btnshow_click-2`

###### Query 3: btnshow_Click (Line 103)
```sql
select asn_no from jan_gate_lines_v where job='
```
- **Trigger Method**: `btnshow_Click`
- **Variables Used**: `"select asn_no from jan_gate_lines_v where job='"`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.btnshow_ClickQuery3()`
- **Suggested API Endpoint**: `GET /api/gate/btnshow_click-3`

###### Query 4: btnshow_Click (Line 103)
```sql
select asn_no from jan_gate_lines_v where job='" & DV(i)("jobno
```
- **Trigger Method**: `btnshow_Click`
- **Variables Used**: `literal`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.btnshow_ClickQuery4()`
- **Suggested API Endpoint**: `GET /api/gate/btnshow_click-4`

##### Screen Component: fifo_sticker
###### Query 1: btnshow_Click (Line 116)
```sql
select ORG,GATE_NO, ITEM, ITEM_DESC ,SUPPLIER_NAME, ACTUAL_LOT ,ITEM_ID ,QTY, ORG_ID ,LOT_SUFFIX_CURRENT, START_AUTO_LOT_NUMBER, RANK ,ROW_ID ,YR, MTH, PRINT_FLAG,NVL((SELECT lot_no FROM JAN_FIFO_LOTNO_DETAILS WHERE ref_id=xx.gate_no And organization_id =xx.org_id And inventory_item_id=xx.item_id And ref_source ='Po'), xx.item ||'_' ||TO_CHAR((select gdate from jan_gatE_header where gate_no=xx.gate_no),'iyyyiwdhh24miss'))LOT, rECEIPT_NUM ,QTY_DLYD from (SELECT JAN_ORGCODE(ORG_ID)ORG,X.GATE_NO,X.ITEM,JAN_ITEMDESC(X.ITEM)ITEM_DESC,Y.SUPPLIER_NAME,''ACTUAL_LOT,ITEM_ID,SUM(SUPDCQTY)QTY,ORG_ID,lot_no LOT_SUFFIX_CURRENT,'' START_AUTO_LOT_NUMBER,'' RANK ,'' ROW_ID ,TO_CHAR(Y.GDATE,'yyyy')YR,TO_CHAR(Y.GDATE,'Mon')MTH, (SELECT COUNT(*) FROM JAN_FIFO_LOTNO_DETAILS WHERE REF_ID=X.GATE_NO AND ORGANIZATION_ID=X.ORG_ID AND INVENTORY_ITEM_ID=X.ITEM_ID AND REF_SOURCE='Po' and print_flag=1)PRINT_FLAG,(SELECT RECEIPT_NUM FROM RCV_SHIPMENT_HEADERS WHERE PACKING_SLIP=TO_CHAR(X.GATE_NO) AND SHIP_TO_ORG_ID=X.ORG_ID) RECEIPT_NUM,0 QTY_DLYD FROM JAN_GATE_LINES X,JAN_GATE_HEADER Y WHERE Y.GDATE>=TO_DATE('" & Format(DateTimePicker1.Value, "dd-MMM-yyyy") & " 00:00:00','DD/MM/YYYY HH24:MI:SS') AND Y.GDATE<=TO_DATE('" & Format(DateTimePicker2.Value, "dd-MMM-yyyy") & " 23:59:00','DD/MM/YYYY HH24:MI:SS') AND X.GATE_NO=Y.GATE_NO AND Y.GTYPE='PO' group by x.GATE_NO,ITEM,ITEM_ID,ORG_ID,TRUNC(x.GDATE),y.supplier_name,to_char(y.gdate,'yyyy'),to_char(y.gdate,'Mon'),lot_no)xx
```
- **Trigger Method**: `btnshow_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `ISupplierRepository.btnshow_ClickQuery1()`
- **Suggested API Endpoint**: `GET /api/supplier/btnshow_click-1`

###### Query 2: btnshow_Click (Line 123)
```sql
select sum(qty_dlyd) from jan_pur_listing where gate_no= '
```
- **Trigger Method**: `btnshow_Click`
- **Variables Used**: `"select sum(qty_dlyd) from jan_pur_listing where gate_no= '"`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.btnshow_ClickQuery2()`
- **Suggested API Endpoint**: `GET /api/gate/btnshow_click-2`

###### Query 3: btnshow_Click (Line 123)
```sql
SELECT SUM(QTY_DLYD) FROM JAN_PUR_LISTING WHERE GATE_NO= '" & DV(i)("GATE_NO
```
- **Trigger Method**: `btnshow_Click`
- **Variables Used**: `literal`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.btnshow_ClickQuery3()`
- **Suggested API Endpoint**: `GET /api/gate/btnshow_click-3`

###### Query 4: btnprint_Click (Line 206)
```sql
select count(*) from JAN_FIFO_LOTNO_DETAILS where ORGANIZATION_ID=" & dgv.Rows(i).Cells(9).Value & " and item_no='" & dgv.Rows(i).Cells(3).Value & "' and ref_id=" & dgv.Rows(i).Cells(2).Value & "
```
- **Trigger Method**: `btnprint_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IFifoRepository.btnprint_ClickQuery4()`
- **Suggested API Endpoint**: `GET /api/fifo/btnprint_click-4`

###### Query 5: btnprint_Click (Line 242)
```sql
select SYS_CONTEXT('USERENV','IP_ADDRESS') IP from DUAL
```
- **Trigger Method**: `btnprint_Click`
- **Variables Used**: `sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.btnprint_ClickQuery5()`
- **Suggested API Endpoint**: `GET /api/gate/btnprint_click-5`

###### Query 6: bntjob_Click (Line 295)
```sql
select y.*,case when PRINT_FLAG >0 then (select lot_no from JAN_FIFO_LOTNO_DETAILS where ref_id=y.wip_entity_id and organization_id=y.organization_id and inventory_item_id=y.inventory_item_id and ref_source='Job' and CREATION_DATE=(SELECT MAX(CREATION_DATE) FROM JAN_FIFO_LOTNO_DETAILS WHERE REF_ID=y.wip_entity_id AND ORGANIZATION_ID=y.organization_id AND INVENTORY_ITEM_ID=y.INVENTORY_ITEM_ID AND REF_SOURCE='Job' )) else new_lot end LOT from (select JAN_ORGCODE(a.ORGANIZATION_ID) ORG,ITEM_NO,DESCRIPTION,JOB_NO,JOB_DT,OPN_SEQ,LOT_MOVE QUANTITY,COMP_DT,RES_CODE,RESOURC,OSP_ISP INHOUSE_OSP,item_no||'_'||to_char(comp_dt,'iyyyiwdhh24miss')new_lot,'' LOT_SUFFIX_CURRENT,''START_AUTO_LOT_NUMBER,'' RID, to_char(a.COMP_DT,'yyyy')yr,to_char(a.COMP_DT,'Mon')mth,wip_entity_id, (select count(*) from JAN_FIFO_LOTNO_DETAILS where ref_id=a.wip_entity_id and organization_id=a.organization_id and inventory_item_id=a.inventory_item_id and ref_source='Job' and print_Flag=1)print_flag, inventory_item_id ,organization_id from JAN_FINAL_OPERATIONS a where 1=1 and comp_Dt>=TO_DATE('" & Format(jfm.Value, "dd-MMM-yyyy") & " 00:00:00','DD/MM/YYYY HH24:MI:SS') and comp_dt<=TO_DATE('" & Format(jto.Value, "dd-MMM-yyyy") & " 23:59:00','DD/MM/YYYY HH24:MI:SS') AND ITEM_TYPE<>'FG' ) Y
```
- **Trigger Method**: `bntjob_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IFifoRepository.bntjob_ClickQuery6()`
- **Suggested API Endpoint**: `GET /api/fifo/bntjob_click-6`

###### Query 7: btn_jstk_Click (Line 372)
```sql
select count(*) from JAN_FIFO_LOTNO_DETAILS where ORGANIZATION_ID=" & dgvjob.Rows(i).Cells(21).Value & " and item_no='" & dgvjob.Rows(i).Cells(2).Value & "' and ref_id=" & dgvjob.Rows(i).Cells(18).Value & "
```
- **Trigger Method**: `btn_jstk_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IFifoRepository.btn_jstk_ClickQuery7()`
- **Suggested API Endpoint**: `GET /api/fifo/btn_jstk_click-7`

###### Query 8: btn_jstk_Click (Line 397)
```sql
select SYS_CONTEXT('USERENV','IP_ADDRESS') IP from DUAL
```
- **Trigger Method**: `btn_jstk_Click`
- **Variables Used**: `sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.btn_jstk_ClickQuery8()`
- **Suggested API Endpoint**: `GET /api/gate/btn_jstk_click-8`

###### Query 9: btncshow_Click (Line 456)
```sql
select jan_itemname(inventory_item_id)item_no,jan_itemdesc(jan_itemname(inventory_item_id))item_Desc,sum(transaction_quantity)qty,lot_number, to_char(date_received,'yyyy')yr,to_char(date_received,'Mon')mth, (select count(*) from JAN_FIFO_LOTNO_DETAILS where organization_id=a.organization_id and inventory_item_id=a.inventory_item_id and ref_source='Stock' and lot_no=a.lot_number)print_flag ,(select SEGMENT3||'.'||SEGMENT4||'.'||SEGMENT5||'.'||SEGMENT6||'.'||SEGMENT7 from MTL_ITEM_LOCATIONS where ORGANIZATION_ID=a.ORGANIZATION_ID and INVENTORY_LOCATION_ID=a.LOCATOR_ID)LOC from mtl_onhand_quantities a where organization_id =JAN_ORGID('" & cmbcorg.Text & "') and subinventory_code='" & cmbsub.SelectedItem & "' group by inventory_item_id,lot_number, organization_id ,to_char(date_received,'yyyy') ,to_char(date_received,'Mon'),LOCATOR_ID order by jan_itemname(inventory_item_id)
```
- **Trigger Method**: `btncshow_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IFifoRepository.btncshow_ClickQuery9()`
- **Suggested API Endpoint**: `GET /api/fifo/btncshow_click-9`

###### Query 10: btncprint_Click (Line 587)
```sql
select SYS_CONTEXT('USERENV','IP_ADDRESS') IP from DUAL
```
- **Trigger Method**: `btncprint_Click`
- **Variables Used**: `sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.btncprint_ClickQuery10()`
- **Suggested API Endpoint**: `GET /api/gate/btncprint_click-10`

###### Query 11: btnship_Click (Line 651)
```sql
select JAN_ORGCODE(a.ship_to_ORG_ID)ORG,a.SHIPMENT_NUM,JAN_ITEMNAME(b.ITEM_ID)ITEM_NO,JAN_ITEMDESC(JAN_ITEMNAME(b.ITEM_ID))ITEM_DESCription,b.QUANTITY_shipped,JAN_ITEMNAME(b.ITEM_ID)||'_'|| to_char(a.creation_date,'iyyyiwdhh24miss')LOT_NUMBER ,to_char(a.creation_date,'yyyy')yr,to_char(a.creation_date,'Mon')mth, (select count(*) from JAN_FIFO_LOTNO_DETAILS where to_char(ref_id)=a.SHIPMENT_NUM and organization_id=a.ship_to_ORG_ID and inventory_item_id=b.item_id and ref_source='Shipment' and print_Flag=1)print_flag from rcv_shipment_headers a ,rcv_shipment_lines B where a.SHIPMENT_NUM is not null and a.shipment_header_id=b.shipment_header_id and a.CREATION_DATE>= TO_DATE('" & Format(dtsfm.Value, "dd-MMM-yyyy") & " 00:00:00','DD/MM/YYYY HH24:MI:SS') and a.CREATION_DATE<=TO_DATE('" & Format(dtsto.Value, "dd-MMM-yyyy") & " 23:59:00','DD/MM/YYYY HH24:MI:SS') order by a.SHIPMENT_NUM
```
- **Trigger Method**: `btnship_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IFifoRepository.btnship_ClickQuery11()`
- **Suggested API Endpoint**: `GET /api/fifo/btnship_click-11`

###### Query 12: btnslist_Click (Line 781)
```sql
select count(*) from JAN_FIFO_LOTNO_DETAILS where ORGANIZATION_ID=JAN_ORGID('" & cmbsorg.SelectedItem & "') and item_no='" & dgvs.Rows(i).Cells(3).Value & "' and lot_no='" & dgvs.Rows(i).Cells(6).Value & "' and ref_id=" & dgvs.Rows(i).Cells(2).Value & "
```
- **Trigger Method**: `btnslist_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IFifoRepository.btnslist_ClickQuery12()`
- **Suggested API Endpoint**: `GET /api/fifo/btnslist_click-12`

###### Query 13: btnslist_Click (Line 810)
```sql
select SYS_CONTEXT('USERENV','IP_ADDRESS') IP from DUAL
```
- **Trigger Method**: `btnslist_Click`
- **Variables Used**: `sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.btnslist_ClickQuery13()`
- **Suggested API Endpoint**: `GET /api/gate/btnslist_click-13`

###### Query 14: Button1_Click (Line 900)
```sql
select SYS_CONTEXT('USERENV','IP_ADDRESS') IP from DUAL
```
- **Trigger Method**: `Button1_Click`
- **Variables Used**: `sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.Button1_ClickQuery14()`
- **Suggested API Endpoint**: `GET /api/gate/button1_click-14`

##### Screen Component: gatestatus
###### Query 1: Button5_Click (Line 274)
```sql
select * from a where a.gdate>=TO_DATE('" & Format(inwdtf.Value, "dd/MM/yyyy") & " 00:00:00','DD/MM/YYYY HH24:MI:SS') and a.gdate<=TO_DATE('" & Format(inwdtto.Value, "dd/MM/yyyy") & " 23:59:00','DD/MM/YYYY HH24:MI:SS') AND unit in ('" & unit.Replace(",", "','") & "')
```
- **Trigger Method**: `Button5_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.Button5_ClickQuery1()`
- **Suggested API Endpoint**: `GET /api/gate/button5_click-1`

##### Screen Component: Form1
###### Query 1: Button1_Click (Line 5)
```sql
SELECT 0 gate1_Rating,round( JAN_individual_rate_summary ('122021',A.Last_name,'Rating',A.location,'AML',A.EMPloyee_NUMBER),2) month_Individual_Rating_Average ,A.* FROM JAN_EMP_MAST_V A WHERE location='BANGALORE' AND level1 like 'AML%' ORDER BY LAST_NAME,REPORTING_TO_NAME
```
- **Trigger Method**: `Button1_Click`
- **Variables Used**: `sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.Button1_ClickQuery1()`
- **Suggested API Endpoint**: `GET /api/gate/button1_click-1`

##### Screen Component: gatelist
###### Query 1: btngo_Click (Line 18)
```sql
select gate_no,receipt_num,receipt_date,pono,podt,item_description,quantity_received,qty_appd,inv_no from jan_pur_listing where pono='" & txtpo.Text & "' and item_no='" & txtitem.Text & "' order by gate_no
```
- **Trigger Method**: `btngo_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.btngo_ClickQuery1()`
- **Suggested API Endpoint**: `GET /api/po/btngo_click-1`

###### Query 2: btngo_Click (Line 24)
```sql
select description,pono,podt,po_qty,recd,po_pend,gate_receipt from jan_po_pending_bought_outs where pono='" & txtpo.Text & "' and item_no='" & txtitem.Text & "'
```
- **Trigger Method**: `btngo_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.btngo_ClickQuery2()`
- **Suggested API Endpoint**: `GET /api/po/btngo_click-2`

###### Query 3: btngo_Click (Line 30)
```sql
select gatE_no,pono,podt,description,popend,supdcqty from jan_gatE_lines where type='PO' and pono='" & txtpo.Text & "' and item='" & txtitem.Text & "' and flag='1' order by gate_no
```
- **Trigger Method**: `btngo_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.btngo_ClickQuery3()`
- **Suggested API Endpoint**: `GET /api/po/btngo_click-3`

###### Query 4: btngo_Click (Line 37)
```sql
select gate_no,receipt_num,receipt_date,pono,podt,partname as item_description,quantity_received,qty_appd,inv_no from jan_osp_listing where pono='" & txtpo.Text & "' and partno='" & txtitem.Text & "' order by gate_no
```
- **Trigger Method**: `btngo_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.btngo_ClickQuery4()`
- **Suggested API Endpoint**: `GET /api/po/btngo_click-4`

###### Query 5: btngo_Click (Line 43)
```sql
select partname as description,pono,podt,po_qty,recd,po_pend,gate_receipt from jan_po_pending_osp where partno='" & txtitem.Text & " ' and pono='" & txtpo.Text & "'
```
- **Trigger Method**: `btngo_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.btngo_ClickQuery5()`
- **Suggested API Endpoint**: `GET /api/po/btngo_click-5`

###### Query 6: btngo_Click (Line 49)
```sql
select gate_no,pono,podt,description,popend,supdcqty from jan_gatE_lines where type='OSP' and pono='" & txtpo.Text & "' and item='" & txtitem.Text & "' and flag='1' order by gate_no
```
- **Trigger Method**: `btngo_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.btngo_ClickQuery6()`
- **Suggested API Endpoint**: `GET /api/po/btngo_click-6`

##### Screen Component: pocheck
###### Query 1: btngo_Click (Line 43)
```sql
SELECT B.pono,B.po_date,B.vendor_name,B.sh_location,B.line_type,A.item ,B.item_description,B.uom,B.line_qty,b.pend_qty,A.SUPDCQTY,b.unit_price,round((B.unit_price*B.line_qty),2)value,round((b.unit_price * a.supdcqty),2) DcVal,B.item_class,B.HSN_CODE,a.line_no,b.po_price,round((B.po_price*B.line_qty),2)cvalue,round((b.po_price * a.supdcqty),2) cDcVal,b.currency_code, (select nvl(nvl(segment2,segment11),segment17) from gl_code_combinations where code_combination_id in (select code_combination_id from po_distributions_all where line_location_id=b.line_location_id)) ch, (select description from FND_FLEX_VALUES_VL where rownum=1 and flex_value in (select nvl(nvl(segment2,segment11),segment17) from gl_code_combinations where code_combination_id in (select code_combination_id from po_distributions_all where line_location_id=b.line_location_id)))cod, (select nvl(nvl(segment3,segment12),segment18) from gl_code_combinations where code_combination_id in (select code_combination_id from po_distributions_all where line_location_id=b.line_location_id))ac, (select description from FND_FLEX_VALUES_VL where rownum=1 And flex_value in (select nvl(nvl(segment3,segment12),segment18) from gl_code_combinations where code_combination_id in (select code_combination_id from po_distributions_all where line_location_id=b.line_location_id)))acd FROM JAN_GATE_LINES A,JAN_PURCHASE_2 B WHERE A.POHEAD=B.PO_HEADER_ID And a.flag =1 And A.POLINE=B.PO_LINE_ID And a.location_id=b.line_location_id And A.GATE_NO='" & TXTGNO.Text & "' order by a.line_no
```
- **Trigger Method**: `btngo_Click`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.btngo_ClickQuery1()`
- **Suggested API Endpoint**: `GET /api/po/btngo_click-1`

###### Query 2: btngo_Click (Line 57)
```sql
SELECT B.pono,B.po_date,B.vendor_name,B.sh_location,B.line_type,A.item ,B.item_description,B.uom,B.line_qty,b.pend_qty,A.SUPDCQTY,b.unit_price,round((B.unit_price*B.line_qty),2)value,round((b.unit_price * a.supdcqty),2) DcVal,B.item_class,B.HSN_CODE,a.line_no,b.po_price,round((B.po_price*B.line_qty),2)cvalue,round((b.po_price * a.supdcqty),2) cDcVal,b.currency_code, (select nvl(nvl(segment2,segment11),segment17) from gl_code_combinations where code_combination_id in (select code_combination_id from po_distributions_all where line_location_id=b.line_location_id)) ch, (select description from FND_FLEX_VALUES_VL where rownum=1 and flex_value in (select nvl(nvl(segment2,segment11),segment17) from gl_code_combinations where code_combination_id in (select code_combination_id from po_distributions_all where line_location_id=b.line_location_id)))cod, (select nvl(nvl(segment3,segment12),segment18) from gl_code_combinations where code_combination_id in (select code_combination_id from po_distributions_all where line_location_id=b.line_location_id))ac, (select description from FND_FLEX_VALUES_VL where rownum=1 And flex_value in (select nvl(nvl(segment3,segment12),segment18) from gl_code_combinations where code_combination_id in (select code_combination_id from po_distributions_all where line_location_id=b.line_location_id)))acd FROM JAN_GATE_LINES A,JAN_PURCHASE_2 B WHERE A.POHEAD=B.PO_HEADER_ID And a.flag =1 And A.POLINE=B.PO_LINE_ID And a.location_id=b.line_location_id And A.GATE_NO='" & TXTGNO.Text & "' order by a.line_no
```
- **Trigger Method**: `btngo_Click`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.btngo_ClickQuery2()`
- **Suggested API Endpoint**: `GET /api/po/btngo_click-2`

###### Query 3: btngo_Click (Line 76)
```sql
select b.pono,B.need_by_date,B.approved_flag ,to_char(B.approved_date,'dd/mm/yyyy') approved_date,B.PRICE from jan_po_pending_osp B,JAN_GATE_LINES A where B.po_HEADER_ID=A.POHEAD AND A.GATE_NO='" & TXTGNO.Text & "' and a.flag = 1 AND A.POLINE=B.PO_LINE_ID and a.location_id=b.line_location_id ORDER BY PONO
```
- **Trigger Method**: `btngo_Click`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.btngo_ClickQuery3()`
- **Suggested API Endpoint**: `GET /api/po/btngo_click-3`

###### Query 4: pocheck_Load (Line 177)
```sql
select SUM(NVL(freigHt,0))FREIGHT,SUM(NVL(rate,0))RATE from jan_gatE_lines where gatE_no='" & TXTGNO.Text & "'
```
- **Trigger Method**: `pocheck_Load`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.pocheck_LoadQuery4()`
- **Suggested API Endpoint**: `GET /api/gate/pocheck_load-4`

###### Query 5: pocheck_Load (Line 190)
```sql
update jan_gate_header set dcval='" & lbldctotval.Text & "' where gate_no=" & TXTGNO.Text & "
```
- **Trigger Method**: `pocheck_Load`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.pocheck_LoadQuery5()`
- **Suggested API Endpoint**: `GET /api/gate/pocheck_load-5`

###### Query 6: pocheck_Load (Line 197)
```sql
update jan_gate_header set dcval='" & lbldctotval.Text & "' where gate_no=" & TXTGNO.Text & "
```
- **Trigger Method**: `pocheck_Load`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.pocheck_LoadQuery6()`
- **Suggested API Endpoint**: `GET /api/gate/pocheck_load-6`

###### Query 7: pocheck_Load (Line 203)
```sql
update jan_gate_header set dcval='" & lbldctotval.Text & "' where gate_no=" & TXTGNO.Text & "
```
- **Trigger Method**: `pocheck_Load`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.pocheck_LoadQuery7()`
- **Suggested API Endpoint**: `GET /api/gate/pocheck_load-7`

###### Query 8: BTNCALTAX_Click (Line 219)
```sql
SELECT b.*,a.supdcqty FROM JAN_GATE_LINES A,JAN_PURCHASE_2 B WHERE A.POHEAD=B.PO_HEADER_ID and a.flag = '" & 1 & "' AND A.POLINE=B.PO_LINE_ID and A.location_id=B.line_location_id AND A.GATE_NO='" & TXTGNO.Text & "'
```
- **Trigger Method**: `BTNCALTAX_Click`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.BTNCALTAX_ClickQuery8()`
- **Suggested API Endpoint**: `GET /api/po/btncaltax_click-8`

###### Query 9: btnsave_Click (Line 285)
```sql
update jan_gatE_lines set rate='" & txtrate.Text & "',freight='" & txtdc.Text & "' where gate_no='" & TXTGNO.Text & "' and line_no='" & txtline.Text & "'
```
- **Trigger Method**: `btnsave_Click`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.btnsave_ClickQuery9()`
- **Suggested API Endpoint**: `GET /api/gate/btnsave_click-9`

###### Query 10: dgv1_CellClick (Line 307)
```sql
SELECT distinct GATe_NO, bed,bed_per,cess,cess_per,scess,scess_per,service,srv_cess,stx_cess_per,srv_scess,stx_scess_per,vat,vat_per,cst,cst_per,(select tariff from jan_gate_lines where item=a.item and gate_no='" & TXTGNO.Text & "' and line_no='" & dgv1.Rows(dgv1.CurrentRow.Index).Cells(16).Value & "' and rownum=1) tariff FROM JAN_PURCHASE_2 a,jan_gate_lines b WHERE a.ITEM='" & dgv1.Rows(dgv1.CurrentRow.Index).Cells(5).Value & "' and NVL(REF_DOC_TRX_ID,A.po_header_ID)=b.poHEAD and a.line_location_id=b.location_id and a.item=b.item and a.vendor_name='" & txtvendor.Text.Replace("'", " ") & "' and b.flag=1 AND ROWNUM<4 ORDER BY GATE_NO DESC
```
- **Trigger Method**: `dgv1_CellClick`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.dgv1_CellClickQuery10()`
- **Suggested API Endpoint**: `GET /api/po/dgv1_cellclick-10`

###### Query 11: dgv1_CellClick (Line 364)
```sql
select SUM(NVL(freigHt,0))FREIGHT,SUM(NVL(rate,0))RATE from jan_gatE_lines where gatE_no='" & TXTGNO.Text & "'
```
- **Trigger Method**: `dgv1_CellClick`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.dgv1_CellClickQuery11()`
- **Suggested API Endpoint**: `GET /api/gate/dgv1_cellclick-11`

###### Query 12: dgv1_CellClick (Line 375)
```sql
SELECT NVL(FREIGHT,0) FREIGHT,NVL(RATE,0) RATE FROM JAN_GATE_LINES WHERE GATE_NO='" & TXTGNO.Text & "' AND LINE_NO= '" & dgv1.Rows(dgv1.CurrentRow.Index).Cells(16).Value & "'
```
- **Trigger Method**: `dgv1_CellClick`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.dgv1_CellClickQuery12()`
- **Suggested API Endpoint**: `GET /api/gate/dgv1_cellclick-12`

###### Query 13: dgv2_CellClick (Line 904)
```sql
select y.tax_rate_CODE,''tax_type_name,y.tax_rate_percentage,y.UNROUND_TAX_AMT_FUN_CURR,y.LINE_AMT,c.supdcqty from apps.jai_tax_lines y , jan_gatE_lines c where (( ENTITY_CODE='RELEASE' and TRX_TYPE='BLANKET')or (ENTITY_CODE='PURCHASE_ORDER' and TRX_TYPE='STANDARD')) AND CASE WHEN TRX_TYPE='STANDARD' THEN Y.TRX_ID WHEN TRX_TYPE='BLANKET' THEN Y.ref_doc_TRX_id END=" & dgv2.Rows(dgv2.CurrentRow.Index).Cells(2).Value & " AND CASE WHEN TRX_TYPE='STANDARD' THEN Y.trx_line_id WHEN TRX_TYPE='BLANKET' THEN Y.ref_doc_line_id END = " & dgv2.Rows(dgv2.CurrentRow.Index).Cells(1).Value & " and c.gate_no=" & TXTGNO.Text & " and line_no=" & dgv2.Rows(dgv2.CurrentRow.Index).Cells(4).Value & " AND Y.ITEM_ID=C.ITEM_ID AND TRX_LOC_LINE_ID=C.LOCATION_ID
```
- **Trigger Method**: `dgv2_CellClick`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.dgv2_CellClickQuery13()`
- **Suggested API Endpoint**: `GET /api/gate/dgv2_cellclick-13`

###### Query 14: order (Line 930)
```sql
select y.tax_rate_CODE TAX_TYPE,NVL(SUM(y.UNROUND_TAX_AMT_FUN_CURR),0)tax_amount from apps.jai_tax_lines y , jan_gatE_lines c where (( ENTITY_CODE='RELEASE' and TRX_TYPE='BLANKET')or (ENTITY_CODE='PURCHASE_ORDER' and TRX_TYPE='STANDARD')) and c.gate_no=" & TXTGNO.Text & " AND Y.ITEM_ID=C.ITEM_ID AND TRX_LOC_LINE_ID=C.LOCATION_ID GROUP BY y.tax_rate_CODE
```
- **Trigger Method**: `order`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.orderQuery14()`
- **Suggested API Endpoint**: `GET /api/gate/order-14`

###### Query 15: dcorder (Line 951)
```sql
select Y.TAX_RATE_CODE tax_Type , NVL(round(SUM ((y.UNROUND_TAX_AMT_FUN_CURR / Y.TRX_LINE_QUANTITY) * c.supdcqty),3),0) tax_amount from apps.jai_tax_lines y , jan_gatE_lines c where (( ENTITY_CODE='RELEASE' and TRX_TYPE='BLANKET')or (ENTITY_CODE='PURCHASE_ORDER' and TRX_TYPE='STANDARD')) and c.gate_no=" & TXTGNO.Text & " AND Y.ITEM_ID=C.ITEM_ID AND TRX_LOC_LINE_ID=C.LOCATION_ID and TRX_LINE_QUANTITY > 0 GROUP BY y.tax_rate_CODE
```
- **Trigger Method**: `dcorder`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.dcorderQuery15()`
- **Suggested API Endpoint**: `GET /api/gate/dcorder-15`

##### Screen Component: Add
###### Query 1: cmbsup_SelectedIndexChanged (Line 108)
```sql
select vendor_site_code from po_vendor_sites_all where vendor_id= '" & cmbsup.SelectedValue & "' and inactive_Date is null AND ORG_ID= " & OP_ID & "
```
- **Trigger Method**: `cmbsup_SelectedIndexChanged`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.cmbsup_SelectedIndexChangedQuery1()`
- **Suggested API Endpoint**: `GET /api/po/cmbsup_selectedindexchanged-1`

###### Query 2: cmbsup_SelectedIndexChanged (Line 118)
```sql
select supplier_name from jan_gate_supplier where supplier_name='" & cmbsup.Text.ToString.Replace("'", "") & "' and type<>'URGENT'
```
- **Trigger Method**: `cmbsup_SelectedIndexChanged`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `ISupplierRepository.cmbsup_SelectedIndexChangedQuery2()`
- **Suggested API Endpoint**: `GET /api/supplier/cmbsup_selectedindexchanged-2`

###### Query 3: cmbitem_SelectedIndexChanged (Line 258)
```sql
select ((select SEGMENT1 from PO_HEADERS_ALL where PO_HEADER_ID=B.PO_HEADER_ID) || '|---|'|| B.PO_LINE_ID) PONO,PO_LINE_LOCATION_ID,TO_ORGANIZATION_ID from MTL_SUPPLY B ,PO_DISTRIBUTIONS_ALL a,wip_discrete_jobs c where B.PO_HEADER_ID=B.PO_HEADER_ID and a.PO_DISTRIBUTION_ID=B.PO_DISTRIBUTION_ID AND B.SUPPLY_TYPE_CODE='PO' and B.DESTINATION_TYPE_CODE in ('SHOP FLOOR') and a.PO_HEADER_ID in (select PO_HEADER_ID from PO_HEADERS_ALL where vendor_id = JAN_VENDORNO('" & TextBox1.Text.ToString.Replace("'", "''") & "')) and A.WIP_ENTITY_id=c.wip_entity_id and c.primary_item_id=JAN_ITEMNO('" & f & "') and b.to_organization_id IN (" & orgid & " )
```
- **Trigger Method**: `cmbitem_SelectedIndexChanged`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.cmbitem_SelectedIndexChangedQuery3()`
- **Suggested API Endpoint**: `GET /api/po/cmbitem_selectedindexchanged-3`

###### Query 4: cmbitem_SelectedIndexChanged (Line 285)
```sql
SELECT (TRUNC(EXEMPTION_VALIDITY_TILL)-TRUNC(sysdate))CNT FROM jan_gate_adi_exempt WHERE VENDOR_ID=" & cmbsup.SelectedValue & " AND LIVE_FLAG=1
```
- **Trigger Method**: `cmbitem_SelectedIndexChanged`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.cmbitem_SelectedIndexChangedQuery4()`
- **Suggested API Endpoint**: `GET /api/gate/cmbitem_selectedindexchanged-4`

###### Query 5: cmbpo_SelectedIndexChanged (Line 359)
```sql
select nvl(sum(po_qty-recd),0) po from jan_po_pending_bought_outs where po_header_id=(select po_header_id from po_headers_all where segment1='" & f & "') and item_id =JAN_ITEMNO('" & b & "') and po_line_id='" & r & "' AND LINE_LOCATION_ID=" & lineno & "
```
- **Trigger Method**: `cmbpo_SelectedIndexChanged`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.cmbpo_SelectedIndexChangedQuery5()`
- **Suggested API Endpoint**: `GET /api/po/cmbpo_selectedindexchanged-5`

###### Query 6: cmbpo_SelectedIndexChanged (Line 365)
```sql
select nvl(sum(supdcqty),0) po from jan_gate_lines where pono='" & f & "' and item ='" & b & "' and validated<>'4' and flag<>0 and poline='" & r & "' and LOCATION_ID=" & lineno & "
```
- **Trigger Method**: `cmbpo_SelectedIndexChanged`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.cmbpo_SelectedIndexChangedQuery6()`
- **Suggested API Endpoint**: `GET /api/po/cmbpo_selectedindexchanged-6`

###### Query 7: cmbpo_SelectedIndexChanged (Line 371)
```sql
select nvl(sum(b.quantity_received),0) po from jan_gate_lines a,jan_pur_listing b where a.item=b.item_no and a.gate_id=b.gate_no and b.item_id =JAN_ITEMNO('" & b & "') and a.flag<>0 and a.poline='" & r & "' AND A.POLINE=B.PO_LINE_ID AND B.po_header_id=(select po_header_id from po_headers_all where segment1='" & f & "') and LOCATION_ID=" & lineno & "
```
- **Trigger Method**: `cmbpo_SelectedIndexChanged`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.cmbpo_SelectedIndexChangedQuery7()`
- **Suggested API Endpoint**: `GET /api/po/cmbpo_selectedindexchanged-7`

###### Query 8: cmbpo_SelectedIndexChanged (Line 378)
```sql
select nvl(sum(po_qty-recd),0) po from jan_po_pending_osp where po_header_id=(select po_header_id from po_headers_all where segment1='" & f & "') and primary_item_id =JAN_ITEMNO('" & b & "') and po_line_id='" & r & "' AND LINE_LOCATION_ID=" & lineno & "
```
- **Trigger Method**: `cmbpo_SelectedIndexChanged`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.cmbpo_SelectedIndexChangedQuery8()`
- **Suggested API Endpoint**: `GET /api/po/cmbpo_selectedindexchanged-8`

###### Query 9: cmbpo_SelectedIndexChanged (Line 384)
```sql
select nvl(sum(supdcqty),0) po from jan_gate_lines where pono='" & f & "' and item ='" & b & "' and validated<>'4' and flag<>0 and poline='" & r & "' AND LOCATION_ID=" & lineno & "
```
- **Trigger Method**: `cmbpo_SelectedIndexChanged`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.cmbpo_SelectedIndexChangedQuery9()`
- **Suggested API Endpoint**: `GET /api/po/cmbpo_selectedindexchanged-9`

###### Query 10: cmbpo_SelectedIndexChanged (Line 390)
```sql
select nvl(sum(b.quantity_received),0) po from jan_gate_lines a,jan_osp_listing b where a.item=b.partno and a.gate_id=b.gate_no and b.primary_item_id =JAN_ITEMNO('" & b & "') and a.flag<>0 and a.poline='" & r & "' AND A.POLINE=B.PO_LINE_ID AND B.po_header_id=(select po_header_id from po_headers_all where segment1='" & f & "')
```
- **Trigger Method**: `cmbpo_SelectedIndexChanged`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.cmbpo_SelectedIndexChangedQuery10()`
- **Suggested API Endpoint**: `GET /api/po/cmbpo_selectedindexchanged-10`

###### Query 11: cmbpo_SelectedIndexChanged (Line 423)
```sql
select b.po_line_id,b.po_header_id,b.line_location_id,b.po_qty,b.bom_revision, b.po_uom, b.osp_no,(select organization_code from org_organization_definitions where organization_id=b.ship_to_organization_id)org ,b.price,B.PARTNAME,trunc(b.podt)podt,b.operations, b.job_no, (SELECT CATEGORY FROM(JAN_COUNTING_CATEGORY) WHERE(organization_id = b.ship_to_organization_id) AND DECODE((SELECT ITEM_COST FROM JAN_ITEMCOST B WHERE(ITEM_NO = b.PARTNO) AND org_id = b.ship_to_organization_id AND PO_LINE_ID=B.PO_LINE_ID),0, (SELECT STAGE_COST FROM JAN_PO_PENDING_OSP C WHERE(PARTNO = b.PARTNO)AND ship_to_organization_id = b.ship_to_organization_id AND PO_LINE_ID=B.PO_LINE_ID), (SELECT ITEM_COST FROM JAN_ITEMCOST B WHERE(ITEM_NO = b.PARTNO) AND org_id = b.ship_to_organization_id AND PO_LINE_ID=B.PO_LINE_ID)) BETWEEN from_value and to_value) CAT,DECODE(B.LINE_TYPE_ID,1021,'Services',B.LINE_TYPE)LINE_TYPE,WIP_ENTITY_ID,OPN_sEQ,need_by_date from jan_po_pending_osp b where b. vendor_id = JAN_VENDORNO('" & TextBox1.Text.ToString.Replace("'", "''") & "') and B.po_header_id=(select po_header_id from po_headers_all where segment1='" & f & "') and b.po_line_id='" & r & "' AND LINE_LOCATION_ID=" & lineno & "
```
- **Trigger Method**: `cmbpo_SelectedIndexChanged`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.cmbpo_SelectedIndexChangedQuery11()`
- **Suggested API Endpoint**: `GET /api/po/cmbpo_selectedindexchanged-11`

###### Query 12: btnsave_Click (Line 581)
```sql
select receipt_num from rcv_shipment_headers where packing_slip='" & txtgno.Text & "'
```
- **Trigger Method**: `btnsave_Click`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.btnsave_ClickQuery12()`
- **Suggested API Endpoint**: `GET /api/gate/btnsave_click-12`

###### Query 13: addnew (Line 625)
```sql
select jan_GATE_NO_SEQ.NEXTVAL FROM DUAL
```
- **Trigger Method**: `addnew`
- **Variables Used**: `cl.sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.addnewQuery13()`
- **Suggested API Endpoint**: `GET /api/gate/addnew-13`

###### Query 14: addnew (Line 637)
```sql
SELECT TO_CHAR(JAN_FYR_DATE,'yyyy') FROM DUAL
```
- **Trigger Method**: `addnew`
- **Variables Used**: `cl.sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.addnewQuery14()`
- **Suggested API Endpoint**: `GET /api/gate/addnew-14`

###### Query 15: addnew (Line 646)
```sql
select NVL(MAX(gate_no),0)GATE_NO from jan_gate_header WHERE UNIT='SKYFAST' AND GDATE>JAN_FYR_DATE
```
- **Trigger Method**: `addnew`
- **Variables Used**: `cl.sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.addnewQuery15()`
- **Suggested API Endpoint**: `GET /api/gate/addnew-15`

###### Query 16: addnew (Line 665)
```sql
select NVL(MAX(gate_no),0)GATE_NO from jan_gate_header WHERE UNIT='UNIT1' AND GDATE>JAN_FYR_DATE
```
- **Trigger Method**: `addnew`
- **Variables Used**: `cl.sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.addnewQuery16()`
- **Suggested API Endpoint**: `GET /api/gate/addnew-16`

###### Query 17: addnew (Line 685)
```sql
select NVL(MAX(gate_no),0)GATE_NO from jan_gate_header WHERE UNIT='COIL' AND GDATE>JAN_FYR_DATE
```
- **Trigger Method**: `addnew`
- **Variables Used**: `cl.sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.addnewQuery17()`
- **Suggested API Endpoint**: `GET /api/gate/addnew-17`

###### Query 18: addnew (Line 704)
```sql
select NVL(MAX(gate_no),0)GATE_NO from jan_gate_header WHERE UNIT='POLYMER' AND GDATE>JAN_FYR_DATE
```
- **Trigger Method**: `addnew`
- **Variables Used**: `cl.sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.addnewQuery18()`
- **Suggested API Endpoint**: `GET /api/gate/addnew-18`

###### Query 19: addnew (Line 724)
```sql
select NVL(MAX(gate_no),0)GATE_NO from jan_gate_header WHERE UNIT='SPM' AND GDATE>JAN_FYR_DATE
```
- **Trigger Method**: `addnew`
- **Variables Used**: `cl.sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.addnewQuery19()`
- **Suggested API Endpoint**: `GET /api/gate/addnew-19`

###### Query 20: addnew (Line 741)
```sql
select NVL(MAX(gate_no),0)GATE_NO from jan_gate_header WHERE UNIT='Palathurai' AND GDATE>JAN_FYR_DATE
```
- **Trigger Method**: `addnew`
- **Variables Used**: `cl.sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.addnewQuery20()`
- **Suggested API Endpoint**: `GET /api/gate/addnew-20`

###### Query 21: addnew (Line 761)
```sql
select NVL(MAX(gate_no),0)GATE_NO from jan_gate_header WHERE UNIT='GLOBAL' AND GDATE>JAN_FYR_DATE
```
- **Trigger Method**: `addnew`
- **Variables Used**: `cl.sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.addnewQuery21()`
- **Suggested API Endpoint**: `GET /api/gate/addnew-21`

###### Query 22: addnew (Line 777)
```sql
select gate_no from jan_gate_header where gate_no='" & txtgno.Text & "' AND UNIT='" & unit & "'
```
- **Trigger Method**: `addnew`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.addnewQuery22()`
- **Suggested API Endpoint**: `GET /api/gate/addnew-22`

###### Query 23: addnew (Line 796)
```sql
select COUNT(*) CNT from jan_gate_header where supplier_name='" & cmbsup.Text.ToString.Replace("'", "''") & "' and gdate BETWEEN JAN_FYR_DATE AND JAN_FYR_END_DATE AND DC_NO='" & txtdcno.Text & "' AND UNIT='" & unit & "'
```
- **Trigger Method**: `addnew`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `ISupplierRepository.addnewQuery23()`
- **Suggested API Endpoint**: `GET /api/supplier/addnew-23`

###### Query 24: addnew (Line 884)
```sql
insert into jan_gate_header(gate_no,gate_id,supplier_name,vendor_id,supplier_site,dc_no,dc_date,validated,gtype,gdate,vehicle_det ,courier_name,pod_no ,no_of_box ,po_wt ,rec_Wt,eway_no ,unit,flag,invoice_val,UNAME , responsible_person,responsible_dept ,transport_mode,person_name ) values(" & txtgno.Text & ",'" & txtgno.Text & "','" & cmbsup.Text & "', " & cmbsup.SelectedValue & " ,'" & txtsite.Text & "','" & txtdcno.Text & "','" & Format(dtdc.Value, "dd-MMM-yyyy") & "', '" & cmbtype.SelectedItem & "' ,nvl((select gate_Dt from jan_gate_del where gate_no=" & txtgno.Text & " and rownum=1 and del_For='Header'),sysdate),nvl((select vehicle_Det from jan_gate_del where gate_no=" & txtgno.Text & " and rownum=1 and del_For='Header'),'') ,(select courier_name from jan_gate_del where gate_no=" & txtgno.Text & " and rownum=1 and del_For='Header'),(select pod_no from jan_gate_del where gate_no=" & txtgno.Text & " and rownum=1 and del_For='Header'),(select no_of_box from jan_gate_del where gate_no=" & txtgno.Text & " and rownum=1 and del_For='Header'),(select pod_wt from jan_gate_del where gate_no=" & txtgno.Text & " and rownum=1 and del_For='Header'),(select rec_wt from jan_gate_del where gate_no=" & txtgno.Text & " and rownum=1 and del_For='Header'),(select eway_bill from jan_gate_del where gate_no=" & txtgno.Text & " and rownum=1 and del_For='Header') ,sysdate, '" & txtveh.Text & "','" & cmbcr.Text & "','" & txtpod.Text & "','" & txtbox.Text & "','" & txtpodwt.Text & "','" & txtrwt.Text & "','' ,'" & unit & "' ,'" & 1 & "','" & txtinv.Text & "' ,'" & per & "' ,'' ,'" & txtper.Text & "' ,'" & cmbres.Text & "' ,'" & ddldept.Text & "','" & ddltranp.Text & "','" & txtjper.Text & "' )
```
- **Trigger Method**: `addnew`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `ISupplierRepository.addnewQuery24()`
- **Suggested API Endpoint**: `GET /api/supplier/addnew-24`

###### Query 25: addnew (Line 925)
```sql
insert into jan_gate_lines (item_id,org_id,GDATE,line_no,gate_no,gate_id,pono,podt,item,description,rev,popend,supdcqty,uom,job,oper,osp,type,remark,status,validated,org,flag,poline,pohead,location_id,poqty,actval,ratecat,potype,tariff,WIP_ENTITY_ID,OPN_SEQ,need_by_dt,CAT_ID ,LAST_UPDT )values(jan_itemno('" & dgv1.Item(2, i).Value & "'),jan_orgid('" & dgv1.Item(4, i).Value & "'), SYSDATE," & line & "," & txtgno.Text & ",'" & txtgno.Text & "','" & dgv1.Item(0, i).Value & "','" & Format(dt2, "dd-MMM-yyyy") & "','" & dgv1.Item(2, i).Value & "','" & de & "','" & dgv1.Item(5, i).Value & "'," & dgv1.Item(6, i).Value & ", '" & dgv1.Item(8, i).Value.ToString & "','" & dgv1.Item(7, i).Value & "','" & dgv1.Item(15, i).Value & "','" & dgv1.Item(14, i).Value & "' ,'" & dgv1.Item(13, i).Value & "','" & dgv1.Item(16, i).Value & "','" & dgv1.Item(9, i).Value & "','" & 1 & "','" & dgv1.Item(19, i).Value & "','" & dgv1.Item(4, i).Value & "','" & 1 & "','" & dgv1.Item(17, i).Value & "','" & dgv1.Item(18, i).Value & "','" & dgv1.Item(21, i).Value & "' ,'" & dgv1.Item(10, i).Value & "','" & dgv1.Item(8, i).Value & "','" & dgv1.Item(11, i).Value & "','" & dgv1.Item(12, i).Value & "','" & dgv1.Item(22, i).Value & "','" & dgv1.Item(23, i).Value & "','" & dgv1.Item(24, i).Value & "', '" & Format(dgv1.Item(25, i).Value, "dd-MMM-yyyy") & "' '' ,(SELECT ATTRIBUTE1 FROM PO_HEADERS_ALL WHERE PO_HEADER_ID=" & dgv1.Item(18, i).Value & "),SYSDATE , (select checked_by from jan_gate_del where gate_no=" & txtgno.Text & )
```
- **Trigger Method**: `addnew`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.addnewQuery25()`
- **Suggested API Endpoint**: `GET /api/po/addnew-25`

###### Query 26: addnew (Line 932)
```sql
UPDATE JAN_GATE_HEADER SET ORG='" & dgv1.Item(4, 0).Value & "' WHERE GATE_NO=" & txtgno.Text & "
```
- **Trigger Method**: `addnew`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.addnewQuery26()`
- **Suggested API Endpoint**: `GET /api/gate/addnew-26`

###### Query 27: addnew (Line 942)
```sql
UPDATE JAN_GATE_HEADER SET ORG='" & dgv1.Item(4, 0).Value & "' WHERE GATE_NO=" & txtgno.Text & "
```
- **Trigger Method**: `addnew`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.addnewQuery27()`
- **Suggested API Endpoint**: `GET /api/gate/addnew-27`

###### Query 28: addnew (Line 947)
```sql
UPDATE JAN_GATE_HEADER SET ORG='" & dgv1.Item(4, 0).Value & "' WHERE GATE_NO=" & txtgno.Text & "
```
- **Trigger Method**: `addnew`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.addnewQuery28()`
- **Suggested API Endpoint**: `GET /api/gate/addnew-28`

###### Query 29: addnew (Line 952)
```sql
UPDATE JAN_GATE_HEADER SET ORG='" & dgv1.Item(4, 0).Value & "' WHERE GATE_NO=" & txtgno.Text & "
```
- **Trigger Method**: `addnew`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.addnewQuery29()`
- **Suggested API Endpoint**: `GET /api/gate/addnew-29`

###### Query 30: addnew (Line 958)
```sql
UPDATE JAN_GATE_HEADER SET ORG='" & dgv1.Item(4, 0).Value & "' WHERE GATE_NO=" & txtgno.Text & "
```
- **Trigger Method**: `addnew`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.addnewQuery30()`
- **Suggested API Endpoint**: `GET /api/gate/addnew-30`

###### Query 31: btnmod_Click (Line 1010)
```sql
["select (select JAN_ITEMNAME(PRIMARY_ITEM_ID) from WIP_ENTITIES where WIP_ENTITY_ID=a.WIP_ENTITY_ID)||'|----|'||] and b.to_organization_id in (" & orgid & ") and A.PO_HEADER_ID in (select PO_HEADER_ID from PO_HEADERS_ALL where vendor_id = JAN_VENDORNO('" & TextBox1.Text.ToString.Replace("'", "''") & "'))
```
- **Trigger Method**: `btnmod_Click`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.btnmod_ClickQuery31()`
- **Suggested API Endpoint**: `GET /api/po/btnmod_click-31`

###### Query 32: btnmod_Click (Line 1029)
```sql
["select (select JAN_ITEMNAME(PRIMARY_ITEM_ID) from WIP_ENTITIES where WIP_ENTITY_ID=a.WIP_ENTITY_ID)||'|----|'||] and b.to_organization_id in (" & orgid & ") and A.PO_HEADER_ID in (select PO_HEADER_ID from PO_HEADERS_ALL where vendor_id = JAN_VENDORNO('" & TextBox1.Text.ToString.Replace("'", "''") & "'))
```
- **Trigger Method**: `btnmod_Click`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.btnmod_ClickQuery32()`
- **Suggested API Endpoint**: `GET /api/po/btnmod_click-32`

###### Query 33: btnmod_Click (Line 1039)
```sql
["select (select JAN_ITEMNAME(PRIMARY_ITEM_ID) from WIP_ENTITIES where WIP_ENTITY_ID=a.WIP_ENTITY_ID)||'|----|'||] and b.to_organization_id in (" & orgid & ") and A.PO_HEADER_ID in (select PO_HEADER_ID from PO_HEADERS_ALL where vendor_id = JAN_VENDORNO('" & TextBox1.Text.ToString.Replace("'", "''") & "'))
```
- **Trigger Method**: `btnmod_Click`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.btnmod_ClickQuery33()`
- **Suggested API Endpoint**: `GET /api/po/btnmod_click-33`

###### Query 34: btnmod_Click (Line 1046)
```sql
select reason,rearef from jan_gatE_header where gate_no='" & txtgno.Text & "'
```
- **Trigger Method**: `btnmod_Click`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.btnmod_ClickQuery34()`
- **Suggested API Endpoint**: `GET /api/gate/btnmod_click-34`

###### Query 35: btnmod_Click (Line 1054)
```sql
SELECT ADI_REASON,adi_no,adi_date,dc_no,dc_date FROM JAN_GATe_HEADER WHERE GATe_NO='" & txtgno.Text & "'
```
- **Trigger Method**: `btnmod_Click`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.btnmod_ClickQuery35()`
- **Suggested API Endpoint**: `GET /api/gate/btnmod_click-35`

###### Query 36: btnmod_Click (Line 1064)
```sql
select pono,podt,item,description,org,rev,poqty,popend,supdcqty,remark,uom,job,oper,osp,type ,poline,pohead,VALIDATED,location_id ,ratecat,potype,tariff,WIP_ENTITY_ID,OPN_SEQ,need_by_dt,LAST_UPDT,lot_no from jan_gate_lines where gate_no='" & txtgno.Text & "' and flag ='" & 1 & "'
```
- **Trigger Method**: `btnmod_Click`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.btnmod_ClickQuery36()`
- **Suggested API Endpoint**: `GET /api/po/btnmod_click-36`

###### Query 37: updt (Line 1115)
```sql
select count(*) from jan_gate_lines where checked_by is not null and gate_no=" & txtgno.Text & "
```
- **Trigger Method**: `updt`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.updtQuery37()`
- **Suggested API Endpoint**: `GET /api/gate/updt-37`

###### Query 38: updt (Line 1124)
```sql
INSERT INTO jan_gate_del (GATE_NO,org_id,item_location,del_For,item_checked_Dt,checked_by ) select distinct " & txtgno.Text & ",org_id,item_location,'Lines',item_checked_Dt,checked_by from jan_gate_lines where gate_no= " & txtgno.Text & "
```
- **Trigger Method**: `updt`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.updtQuery38()`
- **Suggested API Endpoint**: `GET /api/gate/updt-38`

###### Query 39: updt (Line 1132)
```sql
DELETE FROM JAN_GATe_LINES WHERE GATe_NO='" & txtgno.Text & "'
```
- **Trigger Method**: `updt`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.updtQuery39()`
- **Suggested API Endpoint**: `GET /api/gate/updt-39`

###### Query 40: updt (Line 1160)
```sql
insert into jan_gate_lines (item_id,org_id,GDATE,line_no,gate_no,gate_id,pono,podt,item,description,rev,popend,supdcqty,uom,job,oper,osp,type,remark,status,validated,org,flag,poline,pohead,location_id,poqty,actval,ratecat,potype,tariff,WIP_ENTITY_ID,OPN_SEQ,need_by_dt,CAT_ID,LAST_UPDT,lot_no ,checked_by,item_location,item_checked_Dt )values(JAN_ITEMNO('" & dgv1.Item(2, i).Value & "'),JAN_ORGID('" & dgv1.Item(4, i).Value & "'),(SELECT GDATE FROM JAN_GATe_HEADER WHERE GATe_NO=" & txtgno.Text & ")," & line & "," & txtgno.Text & ",'" & txtgno.Text & "','" & dgv1.Item(0, i).Value & "','" & Format(dt, "dd-MMM-yyyy") & "','" & dgv1.Item(2, i).Value & "','" & de & "','" & dgv1.Item(5, i).Value & "'," & dgv1.Item(6, i).Value & ",'" & dgv1.Item(8, i).Value.ToString & "','" & dgv1.Item(7, i).Value & "','" & dgv1.Item(15, i).Value & "','" & dgv1.Item(14, i).Value.ToString.Replace("'", "") & "','" & dgv1.Item(13, i).Value & "','" & dgv1.Item(16, i).Value & "','" & dgv1.Item(9, i).Value & "','" & 1 & "','" & dgv1.Item(19, i).Value & "','" & dgv1.Item(4, i).Value & "','" & 1 & "','" & dgv1.Item(17, i).Value & "','" & dgv1.Item(18, i).Value & "','" & dgv1.Item(21, i).Value & "','" & dgv1.Item(10, i).Value & "','" & dgv1.Item(8, i).Value & "','" & dgv1.Item(11, i).Value & "','" & dgv1.Item(12, i).Value & "','" & dgv1.Item(22, i).Value & "','" & dgv1.Item(23, i).Value & "','" & dgv1.Item(24, i).Value & "', '" & Format(CDate(dgv1.Item(25, i).Value), "dd-MMM-yyyy") & "',(SELECT ATTRIBUTE1 FROM PO_HEADERS_ALL WHERE PO_HEADER_ID=" & dgv1.Item(18, i).Value & "),'" & Format(CDate(dgv1.Item(26, i).Value), "dd-MMM-yyyy") & "','" & dgv1.Item(27, i).Value & "' , (select checked_by from jan_gate_del where gate_no=" & txtgno.Text & )
```
- **Trigger Method**: `updt`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.updtQuery40()`
- **Suggested API Endpoint**: `GET /api/po/updt-40`

###### Query 41: updt (Line 1166)
```sql
insert into jan_gate_lines (item_id,org_id,GDATE,line_no,gate_no,gate_id,pono,podt,item,description,rev,popend,supdcqty,uom,job,oper,osp,type,remark,status,validated,org,flag,poline,pohead,location_id,poqty,actval,ratecat,potype,tariff,WIP_ENTITY_ID,OPN_SEQ,need_by_dt,CAT_ID,LAST_UPDT,lot_no ,checked_by,item_location,item_checked_Dt )values(JAN_ITEMNO('" & dgv1.Item(2, i).Value & "'),JAN_ORGID('" & dgv1.Item(4, i).Value & "'),(SELECT GDATE FROM JAN_GATe_HEADER WHERE GATe_NO=" & txtgno.Text & ")," & line & "," & txtgno.Text & ",'" & txtgno.Text & "','" & dgv1.Item(0, i).Value & "','" & Format(dt, "dd-MMM-yyyy") & "','" & dgv1.Item(2, i).Value & "','" & de & "','" & dgv1.Item(5, i).Value & "'," & dgv1.Item(6, i).Value & ",'" & dgv1.Item(8, i).Value.ToString & "','" & dgv1.Item(7, i).Value & "','" & dgv1.Item(15, i).Value & "','" & dgv1.Item(14, i).Value.ToString.Replace("'", "") & "','" & dgv1.Item(13, i).Value & "','" & dgv1.Item(16, i).Value & "','" & dgv1.Item(9, i).Value & "','" & 1 & "','" & dgv1.Item(19, i).Value & "','" & dgv1.Item(4, i).Value & "','" & 1 & "','" & dgv1.Item(17, i).Value & "','" & dgv1.Item(18, i).Value & "','" & dgv1.Item(21, i).Value & "','" & dgv1.Item(10, i).Value & "','" & dgv1.Item(8, i).Value & "','" & dgv1.Item(11, i).Value & "','" & dgv1.Item(12, i).Value & "','" & dgv1.Item(22, i).Value & "','" & dgv1.Item(23, i).Value & "','" & dgv1.Item(24, i).Value & "', '" & Format(CDate(dgv1.Item(25, i).Value), "dd-MMM-yyyy") & "',(SELECT ATTRIBUTE1 FROM PO_HEADERS_ALL WHERE PO_HEADER_ID=" & dgv1.Item(18, i).Value & "),'" & Format(CDate(dgv1.Item(26, i).Value), "dd-MMM-yyyy") & "','" & dgv1.Item(27, i).Value & "' , (select checked_by from jan_gate_del where gate_no=" & txtgno.Text & )
```
- **Trigger Method**: `updt`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.updtQuery41()`
- **Suggested API Endpoint**: `GET /api/po/updt-41`

###### Query 42: updt (Line 1183)
```sql
insert into jan_gate_lines (item_id,org_id,GDATE,line_no,gate_no,gate_id,pono,podt,item,description,rev,popend,supdcqty,uom,job,oper,osp,type,remark,status,validated,org,flag,poline,pohead,location_id,poqty,actval,ratecat,potype,tariff,WIP_ENTITY_ID,OPN_SEQ,need_by_dt,CAT_ID,LAST_UPDT,lot_no ,checked_by,item_location,item_checked_Dt )values(JAN_ITEMNO('" & dgv1.Item(2, i).Value & "'),JAN_ORGID('" & dgv1.Item(4, i).Value & "'),(SELECT GDATE FROM JAN_GATe_HEADER WHERE GATe_NO=" & txtgno.Text & ")," & line & "," & txtgno.Text & ",'" & txtgno.Text & "','" & dgv1.Item(0, i).Value & "','" & Format(dt, "dd-MMM-yyyy") & "','" & dgv1.Item(2, i).Value & "','" & de & "','" & dgv1.Item(5, i).Value & "'," & dgv1.Item(6, i).Value & ",'" & dgv1.Item(8, i).Value.ToString & "','" & dgv1.Item(7, i).Value & "','" & dgv1.Item(15, i).Value & "','" & dgv1.Item(14, i).Value.ToString.Replace("'", "") & "','" & dgv1.Item(13, i).Value & "','" & dgv1.Item(16, i).Value & "','" & dgv1.Item(9, i).Value & "','" & 1 & "','" & dgv1.Item(19, i).Value & "','" & dgv1.Item(4, i).Value & "','" & 1 & "','" & dgv1.Item(17, i).Value & "','" & dgv1.Item(18, i).Value & "','" & dgv1.Item(21, i).Value & "','" & dgv1.Item(10, i).Value & "','" & dgv1.Item(8, i).Value & "','" & dgv1.Item(11, i).Value & "','" & dgv1.Item(12, i).Value & "','" & dgv1.Item(22, i).Value & "','" & dgv1.Item(23, i).Value & "','" & dgv1.Item(24, i).Value & "', '" & Format(CDate(dgv1.Item(25, i).Value), "dd-MMM-yyyy") & "',(SELECT ATTRIBUTE1 FROM PO_HEADERS_ALL WHERE PO_HEADER_ID=" & dgv1.Item(18, i).Value & "),'" & Format(CDate(dgv1.Item(26, i).Value), "dd-MMM-yyyy") & "','" & dgv1.Item(27, i).Value & "' , (select checked_by from jan_gate_del where gate_no=" & txtgno.Text & )
```
- **Trigger Method**: `updt`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.updtQuery42()`
- **Suggested API Endpoint**: `GET /api/po/updt-42`

###### Query 43: updt (Line 1191)
```sql
insert into jan_gate_lines (item_id,org_id,GDATE,line_no,gate_no,gate_id,pono,podt,item,description,rev,popend,supdcqty,uom,job,oper,osp,type,remark,status,validated,org,flag,poline,pohead,location_id,poqty,actval,ratecat,potype,tariff,WIP_ENTITY_ID,OPN_SEQ,need_by_dt,CAT_ID,LAST_UPDT,lot_no ,checked_by,item_location,item_checked_Dt )values(JAN_ITEMNO('" & dgv1.Item(2, i).Value & "'),JAN_ORGID('" & dgv1.Item(4, i).Value & "'),(SELECT GDATE FROM JAN_GATe_HEADER WHERE GATe_NO=" & txtgno.Text & ")," & line & "," & txtgno.Text & ",'" & txtgno.Text & "','" & dgv1.Item(0, i).Value & "','" & Format(dt, "dd-MMM-yyyy") & "','" & dgv1.Item(2, i).Value & "','" & de & "','" & dgv1.Item(5, i).Value & "'," & dgv1.Item(6, i).Value & ",'" & dgv1.Item(8, i).Value.ToString & "','" & dgv1.Item(7, i).Value & "','" & dgv1.Item(15, i).Value & "','" & dgv1.Item(14, i).Value.ToString.Replace("'", "") & "','" & dgv1.Item(13, i).Value & "','" & dgv1.Item(16, i).Value & "','" & dgv1.Item(9, i).Value & "','" & 1 & "','" & dgv1.Item(19, i).Value & "','" & dgv1.Item(4, i).Value & "','" & 1 & "','" & dgv1.Item(17, i).Value & "','" & dgv1.Item(18, i).Value & "','" & dgv1.Item(21, i).Value & "','" & dgv1.Item(10, i).Value & "','" & dgv1.Item(8, i).Value & "','" & dgv1.Item(11, i).Value & "','" & dgv1.Item(12, i).Value & "','" & dgv1.Item(22, i).Value & "','" & dgv1.Item(23, i).Value & "','" & dgv1.Item(24, i).Value & "', '" & Format(CDate(dgv1.Item(25, i).Value), "dd-MMM-yyyy") & "',(SELECT ATTRIBUTE1 FROM PO_HEADERS_ALL WHERE PO_HEADER_ID=" & dgv1.Item(18, i).Value & "),'" & Format(CDate(dgv1.Item(26, i).Value), "dd-MMM-yyyy") & "','" & dgv1.Item(27, i).Value & "' , (select checked_by from jan_gate_del where gate_no=" & txtgno.Text & )
```
- **Trigger Method**: `updt`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.updtQuery43()`
- **Suggested API Endpoint**: `GET /api/po/updt-43`

###### Query 44: updt (Line 1200)
```sql
insert into jan_gate_lines (item_id,org_id,GDATE,line_no,gate_no,gate_id,pono,podt,item,description,rev,popend,supdcqty,uom,job,oper,osp,type,remark,status,validated,org,flag,poline,pohead,location_id,poqty,actval,ratecat,potype,tariff,WIP_ENTITY_ID,OPN_SEQ,need_by_dt,CAT_ID,LAST_UPDT,lot_no ,checked_by,item_location,item_checked_Dt )values(JAN_ITEMNO('" & dgv1.Item(2, i).Value & "'),JAN_ORGID('" & dgv1.Item(4, i).Value & "'),(SELECT GDATE FROM JAN_GATe_HEADER WHERE GATe_NO=" & txtgno.Text & ")," & line & "," & txtgno.Text & ",'" & txtgno.Text & "','" & dgv1.Item(0, i).Value & "','" & Format(dt, "dd-MMM-yyyy") & "','" & dgv1.Item(2, i).Value & "','" & de & "','" & dgv1.Item(5, i).Value & "'," & dgv1.Item(6, i).Value & ",'" & dgv1.Item(8, i).Value.ToString & "','" & dgv1.Item(7, i).Value & "','" & dgv1.Item(15, i).Value & "','" & dgv1.Item(14, i).Value.ToString.Replace("'", "") & "','" & dgv1.Item(13, i).Value & "','" & dgv1.Item(16, i).Value & "','" & dgv1.Item(9, i).Value & "','" & 1 & "','" & dgv1.Item(19, i).Value & "','" & dgv1.Item(4, i).Value & "','" & 1 & "','" & dgv1.Item(17, i).Value & "','" & dgv1.Item(18, i).Value & "','" & dgv1.Item(21, i).Value & "','" & dgv1.Item(10, i).Value & "','" & dgv1.Item(8, i).Value & "','" & dgv1.Item(11, i).Value & "','" & dgv1.Item(12, i).Value & "','" & dgv1.Item(22, i).Value & "','" & dgv1.Item(23, i).Value & "','" & dgv1.Item(24, i).Value & "', '" & Format(CDate(dgv1.Item(25, i).Value), "dd-MMM-yyyy") & "',(SELECT ATTRIBUTE1 FROM PO_HEADERS_ALL WHERE PO_HEADER_ID=" & dgv1.Item(18, i).Value & "),'" & Format(CDate(dgv1.Item(26, i).Value), "dd-MMM-yyyy") & "','" & dgv1.Item(27, i).Value & "' , (select checked_by from jan_gate_del where gate_no=" & txtgno.Text & )
```
- **Trigger Method**: `updt`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.updtQuery44()`
- **Suggested API Endpoint**: `GET /api/po/updt-44`

###### Query 45: updt (Line 1220)
```sql
UPDATE JAN_GATE_HEADER SET INVOICE_VAL='" & txtinv.Text & "', dc_no='" & txtdcno.Text & "',dc_date='" & Format(dtdc.Value, "dd-MMM-yyyy") & "', courier_name ='" & cmbcr.Text & "',pod_no='" & txtpod.Text & "',no_of_box ='" & txtbox.Text & "',po_wt ='" & txtpodwt.Text & "',rec_Wt='" & txtrwt.Text & "', WHERE GATE_NO = " & txtgno.Text & "
```
- **Trigger Method**: `updt`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.updtQuery45()`
- **Suggested API Endpoint**: `GET /api/po/updt-45`

###### Query 46: updt (Line 1230)
```sql
UPDATE JAN_GATE_HEADER SET ORG='" & dgv1.Item(4, 0).Value & "' WHERE GATE_NO=" & txtgno.Text & "
```
- **Trigger Method**: `updt`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.updtQuery46()`
- **Suggested API Endpoint**: `GET /api/gate/updt-46`

###### Query 47: updt (Line 1237)
```sql
UPDATE JAN_GATE_HEADER SET ORG='" & dgv1.Item(4, 0).Value & "' WHERE GATE_NO=" & txtgno.Text & "
```
- **Trigger Method**: `updt`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.updtQuery47()`
- **Suggested API Endpoint**: `GET /api/gate/updt-47`

###### Query 48: updt (Line 1243)
```sql
UPDATE JAN_GATE_HEADER SET ORG='" & dgv1.Item(4, 0).Value & "' WHERE GATE_NO=" & txtgno.Text & "
```
- **Trigger Method**: `updt`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.updtQuery48()`
- **Suggested API Endpoint**: `GET /api/gate/updt-48`

###### Query 49: updt (Line 1249)
```sql
UPDATE JAN_GATE_HEADER SET ORG='" & dgv1.Item(4, 0).Value & "' WHERE GATE_NO=" & txtgno.Text & "
```
- **Trigger Method**: `updt`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.updtQuery49()`
- **Suggested API Endpoint**: `GET /api/gate/updt-49`

###### Query 50: updt (Line 1254)
```sql
UPDATE JAN_GATE_HEADER SET ORG='" & dgv1.Item(4, 0).Value & "' WHERE GATE_NO=" & txtgno.Text & "
```
- **Trigger Method**: `updt`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.updtQuery50()`
- **Suggested API Endpoint**: `GET /api/gate/updt-50`

###### Query 51: updt (Line 1258)
```sql
UPDATE JAN_GATE_HEADER SET ORG='" & dgv1.Item(4, 0).Value & "' WHERE GATE_NO=" & txtgno.Text & "
```
- **Trigger Method**: `updt`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.updtQuery51()`
- **Suggested API Endpoint**: `GET /api/gate/updt-51`

###### Query 52: updt (Line 1264)
```sql
UPDATE JAN_GATE_HEADER SET ORG='" & dgv1.Item(4, 0).Value & "' WHERE GATE_NO=" & txtgno.Text & "
```
- **Trigger Method**: `updt`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.updtQuery52()`
- **Suggested API Endpoint**: `GET /api/gate/updt-52`

###### Query 53: updt (Line 1274)
```sql
UPDATE JAN_GATE_HEADER SET ORG='" & dgv1.Item(4, 0).Value & "' WHERE GATE_NO=" & txtgno.Text & "
```
- **Trigger Method**: `updt`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.updtQuery53()`
- **Suggested API Endpoint**: `GET /api/gate/updt-53`

###### Query 54: updt (Line 1279)
```sql
UPDATE JAN_GATE_HEADER SET ORG='" & dgv1.Item(4, 0).Value & "' WHERE GATE_NO=" & txtgno.Text & "
```
- **Trigger Method**: `updt`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.updtQuery54()`
- **Suggested API Endpoint**: `GET /api/gate/updt-54`

###### Query 55: updt (Line 1285)
```sql
UPDATE JAN_GATE_HEADER SET ORG='" & dgv1.Item(4, 0).Value & "' WHERE GATE_NO=" & txtgno.Text & "
```
- **Trigger Method**: `updt`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.updtQuery55()`
- **Suggested API Endpoint**: `GET /api/gate/updt-55`

###### Query 56: txtdcno_Leave (Line 1303)
```sql
select supplier_name from jan_gate_supplier where supplier_name='" & cmbsup.Text.ToString.Replace("'", "''") & "' and type LIKE 'ADI%'
```
- **Trigger Method**: `txtdcno_Leave`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `ISupplierRepository.txtdcno_LeaveQuery56()`
- **Suggested API Endpoint**: `GET /api/supplier/txtdcno_leave-56`

###### Query 57: Add_Load (Line 1372)
```sql
select * from jan_gate_courier
```
- **Trigger Method**: `Add_Load`
- **Variables Used**: `cl.sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.Add_LoadQuery57()`
- **Suggested API Endpoint**: `GET /api/gate/add_load-57`

###### Query 58: Add_Load (Line 1390)
```sql
select description from jan_open_challan_Category where CAT_FOR_GATE=1 and live_Flag=1
```
- **Trigger Method**: `Add_Load`
- **Variables Used**: `cl.sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.Add_LoadQuery58()`
- **Suggested API Endpoint**: `GET /api/gate/add_load-58`

###### Query 59: Add_Load (Line 1409)
```sql
select description from jan_open_challan_Category where org_id=" & OP_ID & " and live_Flag=1 and CAT_FOR_GATE=1 and unit_name='" & unit & "'
```
- **Trigger Method**: `Add_Load`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.Add_LoadQuery59()`
- **Suggested API Endpoint**: `GET /api/gate/add_load-59`

###### Query 60: Add_Load (Line 1435)
```sql
select REPLACE(vendor_name,'''','''''')VENDOR_NAME,vendor_id from po_vendors where vendor_type_lookup_code <>'EMPLOYEE' AND END_DATE_ACTIVE IS NULL AND VENDOR_ID IN (SELECT VENDOR_ID FROM PO_vENDOR_SITES_ALL WHERE ORG_ID=" & OP_ID & " ) order by vendor_name asc
```
- **Trigger Method**: `Add_Load`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.Add_LoadQuery60()`
- **Suggested API Endpoint**: `GET /api/po/add_load-60`

###### Query 61: Add_Load (Line 1444)
```sql
Select REA_NAME FROM JAN_GATE_REASON WHERE REA_CODE In (42,43,44,45,46)
```
- **Trigger Method**: `Add_Load`
- **Variables Used**: `cl.sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.Add_LoadQuery61()`
- **Suggested API Endpoint**: `GET /api/gate/add_load-61`

###### Query 62: Add_Load (Line 1462)
```sql
select supplier_name from jan_gate_supplier where supplier_name='" & TextBox1.Text.ToString.Replace("'", "''") & "' and type LIKE 'ADI%'
```
- **Trigger Method**: `Add_Load`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `ISupplierRepository.Add_LoadQuery62()`
- **Suggested API Endpoint**: `GET /api/supplier/add_load-62`

###### Query 63: Add_Load (Line 1480)
```sql
SELECT COUNT(*)CNT,TO_CHAR(JAN_FYR_DATE,'yyyy')|| " & SEQNO & " YR FROM DUAL WHERE SYSDATE BETWEEN JAN_FYR_DATE AND JAN_FYR_END_DATE
```
- **Trigger Method**: `Add_Load`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.Add_LoadQuery63()`
- **Suggested API Endpoint**: `GET /api/gate/add_load-63`

##### Screen Component: non-po
###### Query 1: btnsave_Click (Line 15)
```sql
SELECT TO_CHAR(JAN_FYR_DATE,'yyyy') FROM DUAL
```
- **Trigger Method**: `btnsave_Click`
- **Variables Used**: `cl.sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.btnsave_ClickQuery1()`
- **Suggested API Endpoint**: `GET /api/gate/btnsave_click-1`

###### Query 2: btnsave_Click (Line 26)
```sql
select jan_GATE_NO_SEQ.NEXTVAL FROM DUAL
```
- **Trigger Method**: `btnsave_Click`
- **Variables Used**: `cl.sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.btnsave_ClickQuery2()`
- **Suggested API Endpoint**: `GET /api/gate/btnsave_click-2`

###### Query 3: btnsave_Click (Line 41)
```sql
select NVL(MAX(gate_no),0)GATE_NO from jan_gate_header WHERE UNIT='POLYMER' AND GDATE>JAN_FYR_DATE
```
- **Trigger Method**: `btnsave_Click`
- **Variables Used**: `cl.sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.btnsave_ClickQuery3()`
- **Suggested API Endpoint**: `GET /api/gate/btnsave_click-3`

###### Query 4: btnsave_Click (Line 61)
```sql
select NVL(MAX(gate_no),0)GATE_NO from jan_gate_header WHERE UNIT='SKYFAST' AND GDATE>JAN_FYR_DATE
```
- **Trigger Method**: `btnsave_Click`
- **Variables Used**: `cl.sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.btnsave_ClickQuery4()`
- **Suggested API Endpoint**: `GET /api/gate/btnsave_click-4`

###### Query 5: btnsave_Click (Line 81)
```sql
select NVL(MAX(gate_no),0)GATE_NO from jan_gate_header WHERE UNIT='UNIT1' AND GDATE>JAN_FYR_DATE
```
- **Trigger Method**: `btnsave_Click`
- **Variables Used**: `cl.sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.btnsave_ClickQuery5()`
- **Suggested API Endpoint**: `GET /api/gate/btnsave_click-5`

###### Query 6: btnsave_Click (Line 103)
```sql
select NVL(MAX(gate_no),0)GATE_NO from jan_gate_header WHERE UNIT='SPM' AND GDATE>JAN_FYR_DATE
```
- **Trigger Method**: `btnsave_Click`
- **Variables Used**: `cl.sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.btnsave_ClickQuery6()`
- **Suggested API Endpoint**: `GET /api/gate/btnsave_click-6`

###### Query 7: btnsave_Click (Line 122)
```sql
select NVL(MAX(gate_no),0)GATE_NO from jan_gate_header WHERE UNIT='COIL' AND GDATE>JAN_FYR_DATE
```
- **Trigger Method**: `btnsave_Click`
- **Variables Used**: `cl.sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.btnsave_ClickQuery7()`
- **Suggested API Endpoint**: `GET /api/gate/btnsave_click-7`

###### Query 8: btnsave_Click (Line 140)
```sql
select NVL(MAX(gate_no),0)GATE_NO from jan_gate_header WHERE UNIT='GLOBAL' AND GDATE>JAN_FYR_DATE
```
- **Trigger Method**: `btnsave_Click`
- **Variables Used**: `cl.sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.btnsave_ClickQuery8()`
- **Suggested API Endpoint**: `GET /api/gate/btnsave_click-8`

###### Query 9: btnsave_Click (Line 163)
```sql
select COUNT(*) CNT from jan_gate_header where supplier_name='" & cmbsup.Text.ToString.Replace("'", "''") & "' and gdate BETWEEN JAN_FYR_DATE AND JAN_FYR_END_DATE AND DC_NO='" & txtdcno.Text & "' And UNIT= '" & unit & "'
```
- **Trigger Method**: `btnsave_Click`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `ISupplierRepository.btnsave_ClickQuery9()`
- **Suggested API Endpoint**: `GET /api/supplier/btnsave_click-9`

###### Query 10: btnsave_Click (Line 226)
```sql
insert into jan_gate_header(gate_no,gate_id,supplier_name,vendor_id, dc_no,dc_date,validated, gdate,vehicle_det ,unit,flag ,inv_category,responsible_person ,responsible_dept ,transport_mode,person_name ,bin_qty ) values(" & txtgno.Text & ",'" & txtgno.Text & "', '" & txtdcno.Text & "','" & Format(dtdc.Value, "dd-MMM-yyyy") & "',1 ,'" & txtveh.Text & "' , '" & unit & "' ,1,'" & cmbcat.Text & "' ,'" & txtper.Text & "' ,'" & cmbres.Text & "' ,'" & ddldept.Text & "','" & ddltranp.Text & "','" & txtjper.Text & "' ," & txtbin.Text & " )
```
- **Trigger Method**: `btnsave_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `ISupplierRepository.btnsave_ClickQuery10()`
- **Suggested API Endpoint**: `GET /api/supplier/btnsave_click-10`

###### Query 11: non_po_Load (Line 254)
```sql
select REPLACE(vendor_name,'''','''''')VENDOR_NAME,vendor_id from po_vendors where vendor_type_lookup_code <>'EMPLOYEE' AND END_DATE_ACTIVE IS NULL AND VENDOR_ID IN (SELECT VENDOR_ID FROM PO_vENDOR_SITES_ALL WHERE ORG_ID=" & OP_ID & " AND INACTIVE_DATE IS NULL ) union select REPLACE(customer_name,'''','''''')VENDOR_NAME,customer_id from ra_customers order by vendor_name asc
```
- **Trigger Method**: `non_po_Load`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.non_po_LoadQuery11()`
- **Suggested API Endpoint**: `GET /api/po/non_po_load-11`

###### Query 12: non_po_Load (Line 266)
```sql
select description from jan_open_challan_Category where cat_for_gate=1 and live_Flag=1
```
- **Trigger Method**: `non_po_Load`
- **Variables Used**: `cl.sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.non_po_LoadQuery12()`
- **Suggested API Endpoint**: `GET /api/gate/non_po_load-12`

###### Query 13: non_po_Load (Line 286)
```sql
select description from jan_open_challan_Category where org_id=" & OP_ID & " and live_Flag=1 and CAT_FOR_GATE=1 and unit_name='" & unit & "'
```
- **Trigger Method**: `non_po_Load`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.non_po_LoadQuery13()`
- **Suggested API Endpoint**: `GET /api/gate/non_po_load-13`

###### Query 14: btnprint_Click (Line 338)
```sql
select gate_no,gdate,supplier_name,dc_no,dc_date,vehicle_det,inv_category ,responsible_dept ,transport_mode from jan_gate_header a where inv_category is not null and a.gdate>=TO_DATE('" & Format(dtfm.Value, "dd/MM/yyyy") & " 00:00:00','DD/MM/YYYY HH24:MI:SS') and a.gdate<=TO_DATE('" & Format(dtto.Value, "dd/MM/yyyy") & " 23:59:00','DD/MM/YYYY HH24:MI:SS') and gate_no=" & txtgno.Text & " AND UNIT='" & unit & "'
```
- **Trigger Method**: `btnprint_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `ISupplierRepository.btnprint_ClickQuery14()`
- **Suggested API Endpoint**: `GET /api/supplier/btnprint_click-14`

###### Query 15: txtogno_Leave (Line 398)
```sql
select vehicle_Det from jan_gate_del where gate_no=" & txtogno.Text & " and rownum=1
```
- **Trigger Method**: `txtogno_Leave`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.txtogno_LeaveQuery15()`
- **Suggested API Endpoint**: `GET /api/gate/txtogno_leave-15`

##### Screen Component: kanban_scan
###### Query 1: kanban_scan_Load (Line 69)
```sql
select REPLACE(vendor_name,'''','''''')supplier,vendor_id from po_vendors where vendor_type_lookup_code <>'EMPLOYEE' AND END_DATE_ACTIVE IS NULL AND VENDOR_ID IN (SELECT VENDOR_ID FROM PO_vENDOR_SITES_ALL WHERE ORG_ID=103 AND INACTIVE_DATE IS NULL ) ORDER BY VENDOR_NAME
```
- **Trigger Method**: `kanban_scan_Load`
- **Variables Used**: `sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `ISupplierRepository.kanban_scan_LoadQuery1()`
- **Suggested API Endpoint**: `GET /api/supplier/kanban_scan_load-1`

###### Query 2: kanban_scan_Load (Line 76)
```sql
select organization_code from jan_organization_list_view where unit_name='UNIT7' order by organization_code
```
- **Trigger Method**: `kanban_scan_Load`
- **Variables Used**: `cl.sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.kanban_scan_LoadQuery2()`
- **Suggested API Endpoint**: `GET /api/gate/kanban_scan_load-2`

###### Query 3: Button2_Click (Line 106)
```sql
select kanban_card_number,jan_itemname(inventory_item_id)item_no,jan_itemdesc(jan_itemname(inventory_item_id)) item_Desc, packing_method,packing_qty , (select vendor_name from po_Vendors where vendor_id=a.supplier_id)vendor,creation_Date from jan_supplier_kanban_view A where 1=1 and supplier_id=jan_vendorno('" & cmbsup.SelectedItem & "') and organization_id=jan_orgid('" & cmborg.SelectedItem & "') and inventory_item_id=jan_itemno('" & txtitem.Text & "') and source_Type_meaning= '" & cmbcat.SelectedItem & "' And creation_Date >=TO_DATE('" & Format(inwdtf.Value, "dd/MM/yyyy") & " 00:00:00','DD/MM/YYYY HH24:MI:SS') and creation_date <=TO_DATE('" & Format(inwdtto.Value, "dd/MM/yyyy") & " 23:59:00','DD/MM/YYYY HH24:MI:SS')
```
- **Trigger Method**: `Button2_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `ISupplierRepository.Button2_ClickQuery3()`
- **Suggested API Endpoint**: `GET /api/supplier/button2_click-3`

##### Screen Component: mmcard
###### Query 1: mmcard_Load (Line 198)
```sql
select vendor_name from po_vendors where vendor_type_lookup_code <>'EMPLOYEE' order by vendor_name asc
```
- **Trigger Method**: `mmcard_Load`
- **Variables Used**: `sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IPORepository.mmcard_LoadQuery1()`
- **Suggested API Endpoint**: `GET /api/po/mmcard_load-1`

###### Query 2: mmcard_Load (Line 205)
```sql
select organization_code from org_organization_definitions where organization_id not in(105,112 )order by organization_code
```
- **Trigger Method**: `mmcard_Load`
- **Variables Used**: `sql`
- **Risk Note**: Secure Parameterized Query
- **Suggested Backend Method**: `IGateRepository.mmcard_LoadQuery2()`
- **Suggested API Endpoint**: `GET /api/gate/mmcard_load-2`

###### Query 3: btnshow_Click (Line 679)
```sql
(select a.gate_no,a.ORG, C.item_NO,C.ITEM_description description,C.pono,substr(supplier_name,0,30)sup ,SUM(c.quantity_received)QTY,C. receipt_num , C.receipt_date,'' JOBNO,b.mmcard,B.DC_NO,0,decode(Checked_By,'OTHERS',other_name,checked_by)Checked_By,A.REV,nvl(A.SPOT_INSPECTION,0)SPOT_INSPECTION,nvl(A.SELF_CERTIFY,0) SELF_CERTIFY from jan_gate_lines a,jan_gatE_header b,jan_pur_listing c where a.gatE_no=b.gatE_no and b.gate_id=c.gatE_no and a.poline=c.po_line_id and a.flag=1 AND A.LOCATION_ID=C.LINE_LOCATION_ID and C.receipt_dAtE >=TO_DATE('" & Format(DateTimePicker1.Value, "dd-MMM-yyyy") & " 00:00:00','DD/MM/YYYY HH24:MI:SS') and C.receipt_dAtE<=TO_DATE('" & Format(DateTimePicker2.Value, "dd-MMM-yyyy") & " 23:59:00','DD/MM/YYYY HH24:MI:SS') and c.quantity_received>0 AND UNIT='UNIT2' AND UNIT='UNIT4' AND UNIT='SKYFAST' AND UNIT='UNIT7' AND UNIT='UNIT1' GROUP BY a.gate_no, a.ORG, C.item_NO, C.ITEM_description, C.pono, SUBSTR(supplier_name,0,30), C. receipt_num, C.receipt_date, b.mmcard, B.DC_NO, DECODE(Checked_By,'OTHERS',other_name,checked_by), A.REV, A.SPOT_INSPECTION , a.SELF_CERTIFY ) UNION ALL (select a.gate_no,a.ORG, D.PARTNO,D.PARTNAME description,D.pono,substr(VENDOR_name,0,30)sup ,SUM(D.quantity_received) QTY,D. receipt_num , D.receipt_date ,D.JOBNO ,b.mmcard,B.DC_NO,0,decode(Checked_By,'OTHERS',other_name,checked_by)Checked_By,a.rev, nvl(A.SPOT_INSPECTION,0)SPOT_INSPECTION,nvl(A.SELF_CERTIFY,0) SELF_CERTIFY from jan_gate_lines a,jan_gatE_header b,jan_OSP_listing D where a.gatE_no=b.gatE_no and a.poline=d.po_line_id and b.gate_id=D.gatE_no and a.flag=1 and D.receipt_dAtE>=TO_DATE('" & Format(DateTimePicker1.Value, "dd-MMM-yyyy") & " 00:00:00','DD/MM/YYYY HH24:MI:SS') and D.receipt_dAtE<=TO_DATE('" & Format(DateTimePicker2.Value, "dd-MMM-yyyy") & " 23:59:00','DD/MM/YYYY HH24:MI:SS') and D.quantity_received>0 AND UNIT='UNIT2' AND UNIT='UNIT4' AND UNIT='SKYFAST' AND UNIT='UNIT1' GROUP BY a.gate_no, a.ORG, D.PARTNO, D.PARTNAME, D.pono, SUBSTR(VENDOR_name,0,30), D. receipt_num, D.receipt_date, D.JOBNO, b.mmcard, B.DC_NO, DECODE(Checked_By,'OTHERS',other_name,checked_by), a.rev, A.SPOT_INSPECTION , a.SELF_CERTIFY )
```
- **Trigger Method**: `btnshow_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `ISupplierRepository.btnshow_ClickQuery3()`
- **Suggested API Endpoint**: `GET /api/supplier/btnshow_click-3`

##### Screen Component: eod
###### Query 1: eod_Load (Line 39)
```sql
Select name,organization_id from hr_operating_units WHERE ORGANIZATION_ID In (" & ORG_ID & ")
```
- **Trigger Method**: `eod_Load`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.eod_LoadQuery1()`
- **Suggested API Endpoint**: `GET /api/gate/eod_load-1`

###### Query 2: Button1_Click (Line 82)
```sql
select * from jan_eod_excel_list a where 1=1 and operating_unit=" & cmbou.SelectedValue & " and a.process_id =" & cmbp.SelectedValue & " AND prime_responsibility = '" & txtres.Text & "' And (a.process_id,mast_id) in (select idno,row_id from JAN_EOD_PROCESS_MASTER where live_Flag=1) and a.process_id =" & cmbp.SelectedValue & " AND prime_responsibility = '" & txtres.Text & "' And (a.process_id,a.mast_id) in (select idno,row_id from JAN_EOD_PROCESS_MASTER where prime_responsibility = '" & txtres.Text & "')
```
- **Trigger Method**: `Button1_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.Button1_ClickQuery2()`
- **Suggested API Endpoint**: `GET /api/gate/button1_click-2`

###### Query 3: cmbprc_SelectedIndexChanged (Line 204)
```sql
Select distinct prime_responsibility from jan_eod_process_master where live_flag=1 and org_id=" & cmbou.SelectedValue & "
```
- **Trigger Method**: `cmbprc_SelectedIndexChanged`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.cmbprc_SelectedIndexChangedQuery3()`
- **Suggested API Endpoint**: `GET /api/gate/cmbprc_selectedindexchanged-3`

###### Query 4: cmbprc_SelectedIndexChanged (Line 223)
```sql
Select distinct process_name,idno from jan_eod_process_master where live_flag=1 and org_id=" & cmbou.SelectedValue & " And prime_responsibility = '" & txtres.Text & "' '" & res & "' And live_flag=1
```
- **Trigger Method**: `cmbprc_SelectedIndexChanged`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.cmbprc_SelectedIndexChangedQuery4()`
- **Suggested API Endpoint**: `GET /api/gate/cmbprc_selectedindexchanged-4`

###### Query 5: txtres_SelectedIndexChanged (Line 246)
```sql
Select distinct process_name,idno from jan_eod_process_master where live_flag=1 and org_id=" & cmbou.SelectedValue & " And prime_responsibility = '" & txtres.Text & "'
```
- **Trigger Method**: `txtres_SelectedIndexChanged`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.txtres_SelectedIndexChangedQuery5()`
- **Suggested API Endpoint**: `GET /api/gate/txtres_selectedindexchanged-5`

###### Query 6: Button2_Click (Line 293)
```sql
Select C.*,Case When PENDING_DAYS> 0 Then'OVER DUE' ELSE'DUE' END STATUS,(SELECT DECODE(PLANNING_MAKE_BUY_CODE,1,'Make',2,'Buy') from mtl_system_items where organization_id=JAN_ORGID(C.org) and inventory_item_id=JAN_ITEMNO(C.Item_NO))make_buy FROM( [" Select B.PROCESS_name, JAN_ORGCODE(a.ORGANIZATION_ID)ORG,JAN_ITEMNAME(a.INVENTORY_ITEM_ID)ITEM_NO, jan_itemdesc(JAN_ITEMNAME(a.INVENTORY_ITEM_ID))item_desc ,(SELECT VENDOR_NAME FROM PO_VENDORS WHERE VENDOR_ID=A.VENDOR_ID)VENDOR_NAME,REF_ID,REf_DT,a.quantity,A.TARGET_DATE,b.prime_responsibility,ROUND(SYSDATE-TARGET_DATE)PENDING_DAYS,Case WHEN ROUND(SYSDATE-TARGET_DATE) <=0 THEN 'NA'WHEN ROUND(SYSDATE-TARGET_DATE) >0 And ROUND(SYSDATE-TARGET_DATE)<=3 THEN 'SEVERITY-4' WHEN ROUND(SYSDATE-TARGET_DATE) >3 And ROUND(SYSDATE-TARGET_DATE) <=7 THEN 'SEVERITY-3'] ["(select COMMODITY from jan_item_master_tab where organization_id=A.organization_id And inventory_item_id=A.inventory_item_id)COMMODITy,Case when b.item_responsibility='Buyers' then (select buyer_name from jan_item_master_tab where organization_id=A.organization_id and inventory_item_id=A.inventory_item_id)] And (a.process_id,mast_id) in (select idno,row_id from JAN_EOD_PROCESS_MASTER where prime_responsibility = '" & txtres.Text & "') and (a.process_id,mast_id) in (select idno,row_id from JAN_EOD_PROCESS_MASTER where prime_responsibility = '" & txtres.Text & "' and b.process_name='" & cmbp.Text & "') And (a.process_id,mast_id) in (select idno,row_id from JAN_EOD_PROCESS_MASTER where prime_responsibility = '" & txtres.Text & "') And (a.process_id,mast_id) in (select idno,row_id from JAN_EOD_PROCESS_MASTER where prime_responsibility = '" & txtres.Text & "') ) c
```
- **Trigger Method**: `Button2_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.Button2_ClickQuery6()`
- **Suggested API Endpoint**: `GET /api/po/button2_click-6`

##### Screen Component: gacc
###### Query 1: Button4_Click (Line 10)
```sql
select gate_no,gdate,supplier_name,dc_no,dc_date,gtype,vehicle_det ,inv_category,case when validated=1 then 'Gate' when validated=0 then 'Validated' when validated=2 then 'Not Validate' when validated=6 then 'No Reference' end status from jan_gatE_header a where a.gdate>=TO_DATE('" & Format(inwdtf.Value, "dd/MM/yyyy") & " 00:00:00','DD/MM/YYYY HH24:MI:SS') and a.gdate<=TO_DATE('" & Format(inwdtto.Value, "dd/MM/yyyy") & " 23:59:00','DD/MM/YYYY HH24:MI:SS') and unit='" & unit & "' order by A.gate_no
```
- **Trigger Method**: `Button4_Click`
- **Variables Used**: `cl.sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `ISupplierRepository.Button4_ClickQuery1()`
- **Suggested API Endpoint**: `GET /api/supplier/button4_click-1`

###### Query 2: Button1_Click (Line 39)
```sql
select MIN(GATE_NO),MAX(GATE_NO),count(*)cnt,SUM(CASE WHEN GTYPE='PO' THEN 1 ELSE 0 END) PO_CNT,SUM(cASE WHEN GTYPE='OSP' THEN 1 ELSE 0 END)OSP_CNT,SUM (CASE WHEN GTYPE IS NULL THEN 1 ELSE 0 END)NON_PO,SUM(CASE WHEN POD_NO IS NOT NULL THEN 1 ELSE 0 END)POD from jan_gatE_header a where a.gdate>=TO_DATE('" & Format(inwdtf.Value, "dd/MM/yyyy") & " 00:00:00','DD/MM/YYYY HH24:MI:SS') and a.gdate<=TO_DATE('" & Format(inwdtto.Value, "dd/MM/yyyy") & " 23:59:00','DD/MM/YYYY HH24:MI:SS') and unit='" & unit & "'
```
- **Trigger Method**: `Button1_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IPORepository.Button1_ClickQuery2()`
- **Suggested API Endpoint**: `GET /api/po/button1_click-2`

###### Query 3: Button1_Click (Line 108)
```sql
select count(*),inv_category from jan_Gate_header a where a.gdate>=TO_DATE('" & Format(inwdtf.Value, "dd/MM/yyyy") & " 00:00:00','DD/MM/YYYY HH24:MI:SS') and a.gdate<=TO_DATE('" & Format(inwdtto.Value, "dd/MM/yyyy") & " 23:59:00','DD/MM/YYYY HH24:MI:SS') and unit='" & unit & "' AND inv_category IS NOT NULL group by inv_category
```
- **Trigger Method**: `Button1_Click`
- **Variables Used**: `sql`
- **Risk Note**: **HIGH RISK: SQL String Concatenation** (Injection Point)
- **Suggested Backend Method**: `IGateRepository.Button1_ClickQuery3()`
- **Suggested API Endpoint**: `GET /api/gate/button1_click-3`

---

## Database Model

Source file: `/Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Project Analysis/database-model.md`

### Reconstructed Database Data Model

This document outlines the database schema reconstructed from SQL query references, mapping key tables, fields, relationships, and access operations.

#### 1. Oracle Core Tables

##### Table: JAN_GATE_HEADER
- **Description**: Stores primary gate entry log records.
- **Inferred Primary Key**: `GATE_NO` (Integer, generated via sequence `jan_GATE_NO_SEQ.NEXTVAL`)
- **Key Columns Reference in Code**:
  - `GATE_NO`, `GDATE`, `SUPPLIER_NAME`, `DC_NO`, `DC_DATE`, `VEHICLE_DET`, `INV_CATEGORY`, `VALIDATED`, `VALIDATED_BY`, `UNIT`, `ORG`, `VENDOR_ID`, `INVOICE_VAL`, `EINV_FLAG`, `EWAY_NO`
- **CRUD Operations**: SELECT (Gate.vb, Validate.vb), INSERT (Add.vb, non-po.vb), UPDATE (Add.vb, Validate.vb), DELETE (Gate.vb)
- **Relationships**: Parent of `JAN_GATE_LINES` via `GATE_NO`.

##### Table: JAN_GATE_LINES
- **Description**: Stores individual itemized gate lines matching delivery challans.
- **Inferred Primary Key**: `GATE_NO` + `LINE_NO`
- **Key Columns**:
  - `GATE_NO`, `LINE_NO`, `ITEM`, `SUPDCQTY`, `LOT_NO`, `ORG_ID`, `PONO`, `POLINE`, `LOCATION_ID`, `VALIDATED`, `FLAG`
- **CRUD Operations**: SELECT, INSERT, UPDATE, DELETE (Add.vb, Validate.vb, gate_lot_print.vb)
- **Relationships**: Child of `JAN_GATE_HEADER` via `GATE_NO`.

##### Table: JAN_GATE_NVAL_REASON
- **Description**: Records validation reasons, audit remarks, and supervisor override approvals.
- **Key Columns**:
  - `GATE_NO`, `LINE_NO`, `REA_CODE`, `REA_NAME`, `REA_REMARK`, `REA_DT`, `REA_SEL`, `UNIT`, `UNAME`, `ACTION`, `ACTION_REMARK`, `ACTION_DT`
- **CRUD Operations**: SELECT, INSERT, UPDATE (Validate.vb)

---

#### 2. Oracle ERP Integration Tables (Read-Only references)
- **PO_HEADERS_ALL**: Oracle Purchasing Headers. (Joined via `PO_HEADER_ID` to match vendor/supplier data).
- **PO_VENDORS**: Supplier master details. (Used in `Login.vb` and `Add.vb` to fetch vendor list).
- **PO_VENDOR_SITES_ALL**: Supplier location addresses.
- **RCV_SHIPMENT_HEADERS**: Oracle Receipt records. (Joined to verify if a receipt was created for a gate entry).
- **GL_CODE_COMBINATIONS**: General Ledger account mapping.

---

#### 3. SQL Server external tables (Supplier Portal)
- **jan_gate_header** (SQL Server `scm` database): Shared supplier table to record submitted ASN/ADI details.
- **jan_gate_lines** (SQL Server `scm` database): Shared supplier table for ASN line items.
- **JAN_PO_BLOCK_IP**: Records administrative computer IPs blocked from operating if there are validation backlogs.

---

## API Mapping

Source file: `/Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Project Analysis/api-mapping.md`

### REST API Endpoint Mapping

This catalog suggests the REST API layout required to support the new React frontend with the .NET backend.

#### 1. Authentication & Routing Controller
- **POST `/api/auth/login`**
  - **Body**: `{ role: string }`
  - **Description**: Performs role-based authentication and returns the corresponding configuration parameters (Org ID, Unit, Permissions).
  - **Old VB Reference**: `Login.vb` -> `Button1_Click`

#### 2. Gate Entries Controller
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

#### 3. Gate Validation Controller
- **POST `/api/gate-validation/validate`**
  - **Body**: `{ gateNo: number, validatedBy: string, ewayBill: string }`
  - **Description**: Enforces validations (shortage, e-way bill, item check status), updates Oracle table to `VALIDATED = 5`.
  - **Old VB Reference**: `Validate.vb` -> `valfun`

#### 4. ASN/ADI Controller (Cross-Database)
- **GET `/api/asn/{asnNo}`**
  - **Description**: Queries external SQL Server `scm` database, pulls ASN details, maps it to Oracle POs.
  - **Old VB Reference**: `adi.vb` -> `BUT_DWNLD_ASN_Click`

- **POST `/api/asn/link-gate`**
  - **Body**: `{ asnNo: string, gateNo: number }`
  - **Description**: Updates external SQL Server `jan_gate_header` table to link the created gate entry number.
  - **Old VB Reference**: `adi.vb` -> `btnsave_Click`

---

## React Migration Plan

Source file: `/Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Project Analysis/react-migration-plan.md`

### React Migration Plan

This plan outlines the architecture of the new modern React application that will replace the legacy VB.NET desktop interface.

#### 1. Suggested React Routing Layout
- `/login`: Secure role selector screen (replaces `Login.vb`).
- `/dashboard`: Main gate dashboard registry with custom filters (replaces `Gate.vb`).
- `/gate-entry/new`: Inward gate entry creation form (replaces `Add.vb`).
- `/gate-entry/edit/:gateNo`: Inward gate entry modifier.
- `/gate-validation`: Supervisor approval list (replaces `Validate.vb`).
- `/adi-download`: Advance Shipping Notice processing page (replaces `adi.vb`).
- `/fifo-labels`: Label generator and printer settings (replaces `fifo_sticker.vb`).

#### 2. Reusable Shared UI Components
- **`Layout`**: Navigation sidebar and responsive header containing current operator profile and database health indicators.
- **`DataGrid`**: Interactive table component supporting client-side searching, server-side pagination, row check selectors, and PDF/Excel export hooks.
- **`ZplPrinterConfig`**: Printer mapping form allowing operators to select local IP addresses or raw socket printing clients (like QZ Tray).

#### 3. State Management Suggestion
- **Redux Toolkit**: To manage global state like active operator token, role permissions, active filters, and printer configs.
- **RTK Query**: For backend REST API queries (caching, polling status, and mutation updates).

#### 4. Screen-by-Screen Migration Checklist
- [ ] Implement role-based login routing with mock tokens.
- [ ] Build `/dashboard` grid using TanStack Table (React Table).
- [ ] Connect dashboard search filters to `/api/gate-entries`.
- [ ] Build `/gate-entry/new` form using Formik and Yup for validation.
- [ ] Implement cross-database ASN download flow on `/adi-download`.
- [ ] Integrate local printing using QZ Tray API or direct socket connectivity (replaces local `Shell` execution).

---

## Risk Report

Source file: `/Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Project Analysis/risk-report.md`

### Security, Performance, & Migration Risk Report

This document reports critical security, architectural, and operational risks discovered in the legacy project, providing mitigation solutions for the renovation.

#### 1. Hardcoded Credentials & Connection Strings
> [!CAUTION]
> **Risk**: Global module [Module1.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate%20Entry/Module1.vb) contains raw plaintext passwords for database servers:
  - Oracle: `Password=janapps;`
  - SQL Server: `Password=scm#$sql2007`
>
> **Mitigation**: Connection strings must be stored securely in the .NET backend using environment variables or Azure Key Vault, accessed via `IConfiguration` injection. Plaintext credentials must never exist in frontend or source files.

#### 2. SQL Injection Vulnerabilities
> [!WARNING]
> **Risk**: 212 of 273 SQL queries build query patterns by directly concatenating user-input strings. E.g.:
  `cl.sql = "select * from jan_gate_header where SUPPLIER_ID=" & cmbsup.SelectedValue & " and DC_NO='" & txtdcno.Text & "'"`
  This allows arbitrary SQL code to be executed against the databases.
>
> **Mitigation**: Rewrite all queries in the .NET backend repositories using parameterized SQL or Dapper/Entity Framework Core object mappings.

#### 3. Local Desktop OS Shell Execution (Migration Blockers)
> [!CAUTION]
> **Risk**: The legacy desktop application executes raw DOS shell processes:
  - Prints labels by compiling files locally (`d:\lotprint.bat`) and executing `Shell("d:\lotprint.bat", Hide)`.
  - Runs local Windows executables (`c:\ADI.EXE`) and shell commands.
  This is a **hard blocker** for a web-based React application which runs in a browser sandbox and cannot access local filesystems or execute shell processes.
>
> **Mitigation**:
  1. **Printing**: Replace local file copying with a browser-compatible raw printing library like **QZ Tray** (enables sending raw ZPL byte arrays directly to shared Zebra printers via JavaScript) or print through server-side printing queues.
  2. **External ADI Executable**: Migrate the logic inside `ADI.EXE` directly into a React component or an integrated API endpoint.

#### 4. Circular and Inconsistent Connections
> [!WARNING]
> **Risk**: Function `SCMRETVAL` in [Module1.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate%20Entry/Module1.vb) manages connection states incorrectly:
  ```vb
  If CON.State = ConnectionState.Closed Then CON.Open()
  ```
  It opens the Oracle Connection `CON` but runs command `scmcmd` on SQL Server connection `scmcon`! This results in oracle connections remaining idle and sql server connections not being closed/opened properly.
>
> **Mitigation**: Standardize connection lifetimes in the new .NET backend using dependency injection and the `using` pattern for disposal.

---

## Implementation Plan

Source file: `/Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Project Analysis/implementation_plan.md`

### Renovate VB.NET Gate Entry Project to React + .NET - Documentation & Migration Plan

This plan outlines the process for deeply analyzing the legacy VB.NET `Gate Entry` project and creating complete, structured Markdown documentation files. The generated documentation will serve as a comprehensive blueprint for developers to migrate the system to a modern React frontend and a .NET backend.

#### User Review Required

> [!IMPORTANT]
> The documentation will be created directly in the artifact directory (`/Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/`). Once the plan is approved, I will perform deep analysis and write these files.

#### Open Questions

> [!NOTE]
> There are no immediate blockages. If any unclear logical constructs or hidden external dependencies are found during analysis, they will be documented as "Needs verification" in the relevant markdown files.

#### Proposed Changes

We will create the following 10 new markdown files in the artifact directory:

##### Artifacts (Documentation)

###### [NEW] [README.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/README.md)
Index of all documentation files.

###### [NEW] [project-overview.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/project-overview.md)
Application purpose, module structure, tech stack, dependencies, database config.

###### [NEW] [screens.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/screens.md)
Form-by-form UI components, buttons, fields, event handlers, API/DB triggers, navigation, and React component structures.

###### [NEW] [business-rules.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/business-rules.md)
Logical conditions, calculations, workflows, status transitions, role checks, and UI toggling.

###### [NEW] [validations.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/validations.md)
Form validations, error messages, and recommendation on where (frontend vs backend) to execute them.

###### [NEW] [queries.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/queries.md)
SQL queries, stored procedure calls, dynamic construction patterns, source tracing, risks, and proposed repository methods/endpoints.

###### [NEW] [database-model.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/database-model.md)
Reconstructed ER schema, table fields, relationships, CRUD mappings, and screen associations.

###### [NEW] [api-mapping.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/api-mapping.md)
REST API design for the .NET backend (endpoints, methods, request/response models, validations, auth).

###### [NEW] [react-migration-plan.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/react-migration-plan.md)
React routing, component hierarchies, state management, API integration, and screen-by-screen checklists.

###### [NEW] [risk-report.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/risk-report.md)
Security risks, injection points, hardcoded secrets, duplicate logic, dead code, and pre-migration cleanup guidelines.

---

#### Verification Plan

##### Automated Tests
None required, as this task is purely analytical.

##### Manual Verification
- Verify that every `.vb` form/class/module file in the project has been fully scanned.
- Verify that every SQL query pattern in the VB.NET files has been listed in `queries.md`.
- Verify that all screen inputs and event handlers have been mapped to component structures in `screens.md`.
- Cross-link all documents and ensure all links are valid.

---

## Walkthrough

Source file: `/Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Project Analysis/walkthrough.md`

### Walkthrough - Gate Entry Project Renovation Documentation

This walkthrough details the renovation analysis of the legacy VB.NET Gate Entry codebase and lists the outputs generated.

#### What Was Completed

I analyzed the legacy VB.NET codebase, scanning 53 code modules and forms. Key logical patterns, database interactions, UI events, validations, and administrative blockers were successfully extracted and mapped into 10 structured Markdown files:

1. **[README.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/README.md)**: Main index linking all generated renovation documentation.
2. **[project-overview.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/project-overview.md)**: Details the purpose, modules, runtime configurations (`app.config`), entry points (`Login.vb` / `Gate.vb`), external assembly dependencies, and database connection settings (Oracle `prod` & SQL Server `scm`).
3. **[screens.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/screens.md)**: Detailed mapping of every form, including UI control arrays, buttons, checkboxes, text fields, event handlers, navigation paths, database triggers, and equivalent React components.
4. **[business-rules.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/business-rules.md)**: Documents status transitions (`VALIDATED = 0, 1, 2, 4, 5`), supervisor actions, E-invoice/E-way bill matching thresholds, and quantity validation rules.
5. **[validations.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/validations.md)**: Catalog of UI alert dialog conditions, try-catch handlers, constraints, and recommendations for frontend vs. backend execution.
6. **[queries.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/queries.md)**: Exhaustive catalog of all 273 SQL queries, including dynamic concatenated strings, Oracle/SQL Server references, security injection warnings, suggested repositories, and REST API controller methods.
7. **[database-model.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/database-model.md)**: Maps relationships between core operational tables (such as `JAN_GATE_HEADER` and `JAN_GATE_LINES`), Oracle ERP read-only tables (`PO_HEADERS_ALL`), and supplier portal tables on SQL Server.
8. **[api-mapping.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/api-mapping.md)**: REST API structure for the new .NET backend, detailing request bodies, response models, security scopes, and old VB references.
9. **[react-migration-plan.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/react-migration-plan.md)**: Technical frontend blueprint outlining React page routes, reusable layout wrappers, state machines (RTK Query), and screen checklists.
10. **[risk-report.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/risk-report.md)**: Analysis of plaintext credentials, SQL injection points, and hard OS blockers (like raw label printing using local `lotprint.bat` copy scripts and launching `c:\ADI.EXE`).

#### Verification Summary
- Checked all `.vb` source files.
- Extracted exact controls and events.
- Reconstructed concatenated multi-line SQL commands.
- Configured cross-linking for easy navigation across documents.

---

## Original Task

Source file: `/Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Project Analysis/task.md`

- [x] Search and index all `.vb` files to map out project components
- [x] Analyze application configuration and entry point for `project-overview.md`
- [x] Extract UI forms, controls, events, and navigation flow for `screens.md`
- [x] Parse business logic, validations, calculations, and role checks for `business-rules.md` and `validations.md`
- [x] Find and catalog all SQL queries and stored procedure calls for `queries.md` and `database-model.md`
- [x] Formulate REST API backend mapping for `api-mapping.md`
- [x] Draft frontend architecture and component mapping for `react-migration-plan.md`
- [x] Evaluate security and migration risks for `risk-report.md`
- [x] Create `README.md` index linking all artifacts
- [x] Verify complete project coverage across all `.vb` files

---

## Original Documentation Index

Source file: `/Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Project Analysis/README.md`

### Gate Entry System Renovation Documentation

This directory contains the complete renovation and migration documentation for upgrading the legacy VB.NET Gate Entry System into a modern React frontend and .NET backend.

#### Documentation Index
1. **[Project Overview](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/project-overview.md)** - Application purpose, architecture, and technology stack.
2. **[Screens Documentation](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/screens.md)** - Form inputs, event handlers, grids, navigation, and React mappings.
3. **[Business Rules](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/business-rules.md)** - Calculations, role checks, status transitions, and dynamic visibility constraints.
4. **[Validations Documentation](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/validations.md)** - Catalog of form inputs constraints and popup error conditions.
5. **[SQL Queries Catalog](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/queries.md)** - Reconstructed multi-line SQL queries, unsafe injection points, and backend repository suggestions.
6. **[Database Data Model](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/database-model.md)** - Relational schemas, inferred primary/foreign keys, CRUD operations per table.
7. **[REST API Endpoint Mapping](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/api-mapping.md)** - Structured REST API specs for the new .NET backend controllers.
8. **[React Migration Plan](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/react-migration-plan.md)** - Screen-by-screen frontend layout routes, reusable layouts, and state setups.
9. **[Risk & Pre-Migration Report](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/risk-report.md)** - Credentials leak, SQL injections, OS shell printing dependencies, and cleanup tasks.

---
