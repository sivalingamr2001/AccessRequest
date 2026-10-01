# Screens and Forms Documentation

This document catalogs all WinForms screens found in the VB.NET project, detailing controls, event handlers, navigation, database triggers, validations, and suggested React component representations.

## Screen: Add
- **Source File**: [Add.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/Add.vb)
- **Purpose**: Core transactional gate entry screen. Enables recording DC values, item descriptions, box quantities, POs, OSPs, and manual ADI reasons.
### UI Controls & Components
  - **Buttons**: `btnsave, btnmod, btnupdt`
  - **Input Fields**: `txtsite, txtdcno, TextBox1, txttype, txtgno, txtorg, TXTUSER, txtrole, txt_adi_no, txtinv, txtadirea, txtnorg, txtveh, txtrwt, txtpodwt, txtbox, txtpod, txtper, txtjper`
  - **Dropdown Selectors**: `cmbitem, cmbpo, cmbsup, cmbtype, TXTREF, cmbcat, cmbcr, cmbres, ddltranp, ddldept`
  - **Data Grids / Tables**: `dgv12, dgv1`
  - **Checkboxes**: `chk_adi, xerox, chkref, chkogt`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - **[cmbsup_SelectedIndexChanged - Line 108]**: `select vendor_site_code from po_vendor_sites_all where vendor_id= '" & cmbsup.SelectedValue & "' and inactive_Date is nu...`
  - **[cmbsup_SelectedIndexChanged - Line 118]**: `select supplier_name from jan_gate_supplier where supplier_name='" & cmbsup.Text.ToString.Replace("'", "") & "' and type...`
  - **[cmbitem_SelectedIndexChanged - Line 258]**: `select ((select SEGMENT1 from PO_HEADERS_ALL where PO_HEADER_ID=B.PO_HEADER_ID) || '|---|'|| B.PO_LINE_ID) PONO,PO_LINE_...`
  - **[cmbitem_SelectedIndexChanged - Line 285]**: `SELECT (TRUNC(EXEMPTION_VALIDITY_TILL)-TRUNC(sysdate))CNT  FROM jan_gate_adi_exempt WHERE VENDOR_ID=" & cmbsup.SelectedV...`
  - **[cmbpo_SelectedIndexChanged - Line 359]**: `select nvl(sum(po_qty-recd),0) po from jan_po_pending_bought_outs where po_header_id=(select po_header_id from po_header...`
  - **[cmbpo_SelectedIndexChanged - Line 365]**: `select nvl(sum(supdcqty),0) po from jan_gate_lines  where pono='" & f & "'  and item ='" & b & "' and validated<>'4'  an...`
  - *(57 additional queries omitted for brevity. See [queries.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/queries.md) for full SQL list)*
### Screen-Level Validations
  - **[cmbsup_SelectedIndexChanged]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `'  MessageBox.Show(cl.sql)...`
  - **[cmbitem_SelectedIndexChanged]**: Condition `If ds.Tables("VALID").Rows(0).Item("cnt") >= 0 Then` triggers message alert `MessageBox.Show("No Provision to add Manual Gate Entry ... ,ADI Required", "Gate Register")...`
  - **[cmbitem_SelectedIndexChanged]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("No Provision to add Manual Gate Entry ... ,ADI Required", "Gate Register")...`
  - **[cmbitem_SelectedIndexChanged]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("Vendor Not in Exempted list", "Gate Register")...`
  - **[cmbitem_SelectedIndexChanged]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `' MessageBox.Show("Vendor Not in Exempted list", "Gate Register")...`
  - **[cmbpo_SelectedIndexChanged]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `'        MessageBox.Show("No Gate Entry is allowed for the PO " & f & " ", "Gate Register")...`
- **Suggested React Component**: `AddDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: ApplicationEvents
- **Source File**: [ApplicationEvents.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/ApplicationEvents.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - No interactive controls found.
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - No database queries executed on this screen.
### Screen-Level Validations
  - No formal validations or popup alert conditions captured on this screen.
- **Suggested React Component**: `ApplicationEventsDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: Class1
- **Source File**: [Class1.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/Class1.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - No interactive controls found.
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - No database queries executed on this screen.
### Screen-Level Validations
  - No formal validations or popup alert conditions captured on this screen.
- **Suggested React Component**: `Class1Dialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: Class2
- **Source File**: [Class2.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/Class2.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - No interactive controls found.
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - No database queries executed on this screen.
### Screen-Level Validations
  - **[dataacs]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `'  MsgBox(ex.Message)...`
- **Suggested React Component**: `Class2Dialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: Class3
- **Source File**: [Class3.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/Class3.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - No interactive controls found.
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - No database queries executed on this screen.
### Screen-Level Validations
  - No formal validations or popup alert conditions captured on this screen.
- **Suggested React Component**: `Class3Dialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: CycleCount
- **Source File**: [CycleCount.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/CycleCount.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - **Buttons**: `btnpri, btngo`
  - **Input Fields**: `txtitem`
  - **Dropdown Selectors**: `cmbitem, cmbinv, cmbmb, cmborg`
  - **Data Grids / Tables**: `dgcycle`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - No database queries executed on this screen.
### Screen-Level Validations
  - **[btngo_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.StackTrace)...`
- **Suggested React Component**: `CycleCountDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: Form1
- **Source File**: [Form1.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/Form1.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - **Buttons**: `Button1`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - **[Button1_Click - Line 5]**: `SELECT 0 gate1_Rating,round( JAN_individual_rate_summary ('122021',A.Last_name,'Rating',A.location,'AML',A.EMPloyee_NUMB...`
### Screen-Level Validations
  - No formal validations or popup alert conditions captured on this screen.
- **Suggested React Component**: `Form1Dialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: Gate
- **Source File**: [Gate.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/Gate.vb)
- **Purpose**: Main application dashboard. Provides data grids for entries, search filtering, and routes to all sub-features (Validation, Modifications, FIFO Lot creation, Reports).
### UI Controls & Components
  - **Buttons**: `btnval, btnadd, btnmod, btnsta, glist, ADIbt, btncan, btnrecpt, btnnonpo, btngo, btnxs, Button1, UNBLOCK, btnreport, mmcard, bprint, btnview, btndel, btnitem, btnwop, btngacc, btntag, job_shrt`
  - **Input Fields**: `txtlog, txtrole, txtinw`
  - **Dropdown Selectors**: `cmbsup, cmbval, cmborg, gtype, TXTREF`
  - **Data Grids / Tables**: `dgv1, dgv, dgvcr, dgvr`
  - **Checkboxes**: `CheckBox1`
- **Navigation**: Opens `Gate_Password, gate_lot_print, headerval, del, re, receipt_prepared, ADD, f, gacc, gatelist, excess_release, gt_checked, non_po, cancelentry, adi, direct_delivery, vou, Add, Report, rtvreason, valreason, st, GateUpdate, suplist` modal screens.
### Database Queries Triggered
  - **[Gate_Load - Line 94]**: `select REPLACE(vendor_name,'''','''''')supplier,vendor_id from po_vendors where vendor_type_lookup_code <>'EMPLOYEE' AND...`
  - **[Gate_Load - Line 101]**: `select organization_code  from org_organization_definitions where organization_id in (" & orgid & " ) order by organizat...`
  - **[Gate_Load - Line 110]**: `SELECT REA_NAME FROM JAN_GATE_REASON WHERE REA_CODE IN (42,43,44,45,46)...`
  - **[Gate_Load - Line 123]**: `SELECT REA_NAME FROM JAN_GATE_REASON WHERE REA_CODE IN (42,43,44,45,46)...`
  - **[Gate_Load - Line 133]**: `SELECT REA_NAME FROM JAN_GATE_REASON WHERE REA_CODE IN (42,43,44,45,46)...`
  - **[btngo_Click - Line 235]**: `select   a.gate_no,a.gdate,a.supplier_name,a.supplier_site,(select registration_number from  JAN_GST_REG_DETAILS_VIEW wh...`
  - *(15 additional queries omitted for brevity. See [queries.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/queries.md) for full SQL list)*
### Screen-Level Validations
  - **[Gate_Load]**: Condition `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` triggers message alert `MessageBox.Show(ex.Message, "GATE ENTRY")...`
  - **[Gate_Load]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[btngo_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[btndel_Click]**: Condition `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` triggers message alert `dr = MessageBox.Show("Do You Want to delete?", "Gate Entry", MessageBoxButtons.YesNo, MessageBoxIcon.Exclamation)...`
  - **[btndel_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[btnval_Click]**: Condition `If IsDBNull(cl.ds.Tables("resultab").Rows(0).Item("dcval")) Then` triggers message alert `MessageBox.Show("View Tax Values", "Gate Register")...`
- **Suggested React Component**: `GatePage` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: Gate Status Login
- **Source File**: [Gate Status Login.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/Gate Status Login.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - **Buttons**: `btncan, btnlog`
  - **Input Fields**: `txtuname, txtpwd`
- **Navigation**: Opens `gateStatus` modal screens.
### Database Queries Triggered
  - No database queries executed on this screen.
### Screen-Level Validations
  - **[btnlog_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("Invalid Login", "Kardex")...`
- **Suggested React Component**: `Gate Status LoginDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: GateUpdate
- **Source File**: [GateUpdate.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/GateUpdate.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - **Buttons**: `btnupdt, btndel`
  - **Input Fields**: `txtgate, txtline, txtqty, txtwt, txtrole, txtpodwt, txtpod`
  - **Dropdown Selectors**: `cmbcat, cmbres, cmbcr`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - **[btndel_Click - Line 66]**: `select receipt_num from rcv_shipment_headers where packing_slip='" & txtgate.Text & "'...`
  - **[btndel_Click - Line 76]**: `SELECT * FROM JAN_GATe_LINES WHERE GATE_NO=" & txtgate.Text & "...`
  - **[btndel_Click - Line 81]**: `SELECT * FROM JAN_GATe_LINES WHERE GATE_NO=" & txtgate.Text & "...`
  - **[btndel_Click - Line 101]**: `select count(*) from jan_gate_lines where checked_by is not null  and gate_no=" & txtgate.Text & "...`
  - **[GateUpdate_Load - Line 153]**: `select description from jan_open_challan_Category where CAT_FOR_GATE=1 and live_Flag=1...`
  - **[GateUpdate_Load - Line 165]**: `select * from jan_gate_courier...`
### Screen-Level Validations
  - **[btnupdt_Click]**: Condition `If unit.Contains("SPM") = True And cmbres.Text <> "" Then` triggers message alert `MessageBox.Show("Gate Value Updated", " Gate Register")...`
  - **[btndel_Click]**: Condition `If (dar.HasRows = True) Then` triggers message alert `MessageBox.Show("Receipt Made,Gate Can't be updated", "Gate Register")...`
  - **[btndel_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("Gate No:  " & txtgate.Text & "deleted", "Gate Register")...`
- **Suggested React Component**: `GateUpdateDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: Gate_Password
- **Source File**: [Gate_Password.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/Gate_Password.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - **Buttons**: `updt, Button1`
  - **Input Fields**: `txtrole, txtcpwd, txtpwd, txtuname, txtper`
  - **Data Grids / Tables**: `DGV1`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - No database queries executed on this screen.
### Screen-Level Validations
  - **[updt_Click]**: Condition `If CON.State = ConnectionState.Closed Then CON.Open()` triggers message alert `MessageBox.Show("Password Changed", "Gate Register")...`
  - **[updt_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
- **Suggested React Component**: `Gate_PasswordDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: Login
- **Source File**: [Login.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/Login.vb)
- **Purpose**: Authentication screen with hardcoded defaults. Performs automatic routing to Gate Dashboard depending on roles.
### UI Controls & Components
  - **Buttons**: `Button1, Button2, Button3`
  - **Input Fields**: `txtuser, txtpwd`
- **Navigation**: Opens `Gate` modal screens.
### Database Queries Triggered
  - **[Button1_Click - Line 22]**: `select * from jan_gate_login where   role ='" & userid & "'...`
### Screen-Level Validations
  - **[Button1_Click]**: Condition `If Not IsDBNull(.Item("modify_Flag")) Then modify_Flag = .Item("modify_Flag")` triggers message alert `MessageBox.Show("Login Mismatch !!!", "Gate Register")...`
  - **[Button1_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `'    ErrorProvider1.SetError(txtuser, "Invalid Username")...`
  - **[Button1_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `'    ErrorProvider1.SetError(txtpwd, "Invalid Pwd")...`
- **Suggested React Component**: `LoginPage` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: Login.designer
- **Source File**: [Login.designer.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/Login.designer.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - No interactive controls found.
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - No database queries executed on this screen.
### Screen-Level Validations
  - **[InitializeComponent]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `Me.ErrorProvider1 = New System.Windows.Forms.ErrorProvider(Me.components)...`
  - **[InitializeComponent]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `CType(Me.ErrorProvider1, System.ComponentModel.ISupportInitialize).BeginInit()...`
  - **[InitializeComponent]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `'ErrorProvider1...`
  - **[InitializeComponent]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `Me.ErrorProvider1.ContainerControl = Me...`
  - **[InitializeComponent]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `CType(Me.ErrorProvider1, System.ComponentModel.ISupportInitialize).EndInit()...`
  - **[Global]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `Friend WithEvents ErrorProvider1 As System.Windows.Forms.ErrorProvider...`
- **Suggested React Component**: `Login.designerDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: Module1
- **Source File**: [Module1.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/Module1.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - No interactive controls found.
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - No database queries executed on this screen.
### Screen-Level Validations
  - No formal validations or popup alert conditions captured on this screen.
- **Suggested React Component**: `Module1Dialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: MyGroupBox
- **Source File**: [MyGroupBox.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/MyGroupBox.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - No interactive controls found.
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - No database queries executed on this screen.
### Screen-Level Validations
  - No formal validations or popup alert conditions captured on this screen.
- **Suggested React Component**: `MyGroupBoxDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: NOTVALIDATELIST
- **Source File**: [NOTVALIDATELIST.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/NOTVALIDATELIST.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - **Buttons**: `btnshow, btnfm, btnto, btnprint`
  - **Input Fields**: `txtqpto, txtqpfm`
  - **Dropdown Selectors**: `cmbsup, cmborg`
  - **Data Grids / Tables**: `dgvdetails, dgvlines`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - No database queries executed on this screen.
### Screen-Level Validations
  - **[btnshow_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.ToString)...`
  - **[NOTVALIDATELIST_Load]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.ToString)...`
  - **[dgvdetails_CellClick]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.ToString)...`
  - **[btnprint_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.ToString)...`
- **Suggested React Component**: `NOTVALIDATELISTDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: PO_BLOCK
- **Source File**: [PO_BLOCK.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/PO_BLOCK.vb)
- **Purpose**: Administrative blocker utility. Checks for pending gate validations and prevents the operator from navigating away by using a timeout blocker.
### UI Controls & Components
  - **Data Grids / Tables**: `dgvlist`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - No database queries executed on this screen.
### Screen-Level Validations
  - **[PO_BLOCK_Load]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `' MessageBox.Show(sql)...`
  - **[PO_BLOCK_Load]**: Condition `If ds.Tables("RESULT").Rows.Count > 0 Then` triggers message alert `'MessageBox.Show(ds.Tables("RESULT").Rows.Count)...`
- **Suggested React Component**: `PO_BLOCKDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: PO_BLOCK.designer
- **Source File**: [PO_BLOCK.designer.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/PO_BLOCK.designer.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - No interactive controls found.
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - No database queries executed on this screen.
### Screen-Level Validations
  - No formal validations or popup alert conditions captured on this screen.
- **Suggested React Component**: `PO_BLOCK.designerDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: ProjectInstaller
- **Source File**: [ProjectInstaller.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/ProjectInstaller.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - No interactive controls found.
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - No database queries executed on this screen.
### Screen-Level Validations
  - No formal validations or popup alert conditions captured on this screen.
- **Suggested React Component**: `ProjectInstallerDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: Report
- **Source File**: [Report.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/Report.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - **Buttons**: `Button1, po, Button2, Button3, Button4, btnprintnew, btngt, btnnval`
  - **Input Fields**: `TextBox1, txtrole`
  - **Dropdown Selectors**: `cmbval, cmborg, cmbcat`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - No database queries executed on this screen.
### Screen-Level Validations
  - **[po_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[Button5_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[btngt_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[btnnval_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[btnnoref_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
- **Suggested React Component**: `ReportDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: Service1
- **Source File**: [Service1.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/Service1.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - No interactive controls found.
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - No database queries executed on this screen.
### Screen-Level Validations
  - No formal validations or popup alert conditions captured on this screen.
- **Suggested React Component**: `Service1Dialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: Service2
- **Source File**: [Service2.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/Service2.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - No interactive controls found.
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - No database queries executed on this screen.
### Screen-Level Validations
  - No formal validations or popup alert conditions captured on this screen.
- **Suggested React Component**: `Service2Dialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: Status
- **Source File**: [Status.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/Status.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - **Buttons**: `Button1, Button2, Button3, Button4, Button5, Button6, btn_short`
  - **Input Fields**: `TextBox1, txtrole`
  - **Dropdown Selectors**: `cmborg, cmbsup, cmbcr`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - **[Status_Load - Line 20]**: `select REPLACE(vendor_name,'''','''''')supplier,vendor_id from po_vendors where vendor_type_lookup_code <>'EMPLOYEE' AND...`
  - **[Status_Load - Line 27]**: `select organization_code  from org_organization_definitions where organization_id   in(" & orgid & " )order by organizat...`
  - **[Status_Load - Line 34]**: `select * from jan_gate_courier...`
  - **[Button3_Click - Line 54]**: `select gate_no,gdate,dc_no,dc_Date,supplier_name,courier_name,pod_no,po_wt,no_of_box,rec_Wt,rec_wt_dt from jan_gatE_head...`
  - **[Button4_Click - Line 134]**: `select  Gate_no , GDate, (SELECT LISTAGG   ( distinct org, ', ' ) WITHIN GROUP (ORDER BY line_no) from jan_gate_lines wh...`
  - **[Button5_Click - Line 230]**: `select DISTINCT a.gate_no,a.gdate,a.supplier_name,a.dc_no,a.dc_date,(case when (SELECT DECODE(POTYPE,'Services',potype,t...`
  - *(2 additional queries omitted for brevity. See [queries.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/queries.md) for full SQL list)*
### Screen-Level Validations
  - **[Button5_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
- **Suggested React Component**: `StatusDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: Validate
- **Source File**: [Validate.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/Validate.vb)
- **Purpose**: Verification gatekeeper. Validates gate lines, matching quantities against Oracle ERP records and running E-Invoice and E-way bill checks.
### UI Controls & Components
  - **Buttons**: `btnok`
  - **Input Fields**: `txtpo, txtitem, txtgno, TXTLINE, txtlog, txttypt, txtrole, txtorg, txtgst`
  - **Dropdown Selectors**: `cmbval`
  - **Data Grids / Tables**: `dgv, dgv1, dgval`
  - **Checkboxes**: `chkeinv`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - **[VALIDATE_Load - Line 34]**: `SELECT pono,ITEM , STATUS  FROM  (SELECT  pono,LOCATION_ID,ITEM ,(select case when (quantity-(quantity_received+quantity...`
  - **[VALIDATE_Load - Line 50]**: `SELECT pono,ITEM , STATUS  FROM  (SELECT  pono,LOCATION_ID,ITEM ,(select case when (quantity-(quantity_received+quantity...`
  - **[RBTNV_CheckedChanged - Line 114]**: `SELECT REA_CODE,REA_NAME,REA_REMARK,ACTION,ACTION_REMARK,TO_CHAR(ACTION_DT)ACTION_DT,REA_SEL FROM JAN_GATE_NVAL_REASON W...`
  - **[RBTNNV_CheckedChanged - Line 194]**: `select nvl(eway_no,(select eway_bill from jan_gate_del where gate_no=" & txtgno.Text & " and  DEL_FOR='Header' and eway_...`
  - **[RBTNNV_CheckedChanged - Line 203]**: `SELECT REA_CODE,REA_NAME FROM JAN_GATE_REASON  WHERE LIVE_FLAG='Y'   ORDER BY REA_CODE...`
  - **[RBTNNV_CheckedChanged - Line 268]**: `SELECT REA_REMARK,REAson_Date,TO_CHAR(ACTION)ACTION,TO_CHAR(ACTION_REMARK)ACTION_REMARK,ACTION_DT,rea_sel FROM JAN_GATE_...`
  - *(25 additional queries omitted for brevity. See [queries.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/queries.md) for full SQL list)*
### Screen-Level Validations
  - **[RBTNNV_CheckedChanged]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message, "Gate Entry")...`
  - **[BTNOK_Click]**: Condition `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` triggers message alert `MessageBox.Show(.Item(0))...`
  - **[BTNOK_Click]**: Condition `If dswt.Tables("cnt").Rows(0).Item(0) > 0 Then` triggers message alert `MessageBox.Show("Received Weight not entered for POD", "Gate Entry")...`
  - **[BTNOK_Click]**: Condition `If dsgt.Tables("gate_Cnt").Rows.Count <> dscnt.Tables("tax_cnt").Rows.Count Then` triggers message alert `MessageBox.Show("Tax not available for all lines as in gate entry", "Gate Register")...`
  - **[BTNOK_Click]**: Condition `If val = 0 And val1 = 0 Then` triggers message alert `MessageBox.Show("Tick E-invoice Supplier and proceed", "Gate Register")...`
  - **[BTNOK_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("Enter Supplier E-way bill No and proceed", "Gate Register")...`
- **Suggested React Component**: `ValidateDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: Voucher
- **Source File**: [Voucher.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/Voucher.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - **Buttons**: `Button2, Button1`
  - **Input Fields**: `txtvou, txtdc, txtsup, txtgate`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - No database queries executed on this screen.
### Screen-Level Validations
  - **[Button1_Click]**: Condition `If cl.oracon.State = ConnectionState.Closed Then` triggers message alert `MessageBox.Show("Voucher No Added", "Gate Entry")...`
  - **[Button1_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("Enter Voucher Number", "Gate Entry")...`
  - **[Button1_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
- **Suggested React Component**: `VoucherDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: adi
- **Source File**: [adi.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/adi.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - **Buttons**: `BUT_DWNLD_ASN, btnclose, btnupdt, btnmod, btnsave`
  - **Input Fields**: `txtrwt, txtpodwt, txtbox, txtpod, txtveh, Txt_inv_val, txtrole, TXT_ASN_NO, TXTUSER, txtorg, txtgno, TextBox1, txtdcno, txttype, txtsite`
  - **Dropdown Selectors**: `cmbcr, cmbtype, cmbsup, cmbpo, cmbitem`
  - **Data Grids / Tables**: `asn_grid, dgv1, dgv12`
  - **Checkboxes**: `chkoadi, nval_cb`
- **Navigation**: Opens `add_frm` modal screens.
### Database Queries Triggered
  - **[btnsave_Click - Line 18]**: `select NVL(MAX(gate_no),0)GATE_NO from jan_gate_header WHERE UNIT='UNIT2'...`
  - **[btnsave_Click - Line 35]**: `select jan_GATE_NO_SEQ.NEXTVAL FROM DUAL...`
  - **[btnsave_Click - Line 50]**: `SELECT TO_CHAR(JAN_FYR_DATE,'yyyy') FROM DUAL...`
  - **[btnsave_Click - Line 58]**: `select NVL(MAX(gate_no),0)GATE_NO from jan_gate_header WHERE UNIT='" & txtrole.Text & "'  AND GDATE>JAN_FYR_DATE...`
  - **[btnsave_Click - Line 74]**: `SELECT TO_CHAR(JAN_FYR_DATE,'yyyy') FROM DUAL...`
  - **[btnsave_Click - Line 82]**: `select NVL(MAX(gate_no),0)GATE_NO from jan_gate_header WHERE UNIT='JAPL'  AND GDATE>JAN_FYR_DATE...`
  - *(36 additional queries omitted for brevity. See [queries.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/queries.md) for full SQL list)*
### Screen-Level Validations
  - **[btnsave_Click]**: Condition `If ds1.Tables("resultab").Rows(i).Item("gate_no") = txtgno.Text Then` triggers message alert `MessageBox.Show("Gate Number Already Exists!", "Gate Entry")...`
  - **[btnsave_Click]**: Condition `If ds.Tables("resultab").Rows(i).Item("dc_no").ToString = txtdcno.Text Then` triggers message alert `MessageBox.Show(sql, "Gate Entry")...`
  - **[btnsave_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `'                MsgBox("Tariff No Not Empty !..")...`
  - **[btnsave_Click]**: Condition `If dgv1.Rows(i).Cells(0).Value <> "" And txtdcno.Text <> "" And dgv1.Rows(i).Cells(8).Value <> "" And Convert.ToDecimal(dgv1.Rows(i).Cells(8).Value) > Convert.ToDecimal(dgv1.Rows(i).Cells(6).Value) Then` triggers message alert `MessageBox.Show("DcQty Greater Then Po Pend", "Gate Entry")...`
  - **[btnsave_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("Saved Successfully !!-Gate Number is: " & head & "", "Gate Entry")...`
  - **[btnsave_Click]**: Condition `If B = True Then` triggers message alert `MessageBox.Show("Enter Dcno,DCqty,Remark To Save Gate Values", "Gate Entry")...`
- **Suggested React Component**: `adiDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: adi_exemption
- **Source File**: [adi_exemption.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/adi_exemption.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - **Buttons**: `btngo, Button1`
  - **Dropdown Selectors**: `cmbsup`
  - **Data Grids / Tables**: `dgv`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - No database queries executed on this screen.
### Screen-Level Validations
  - **[btngo_Click]**: Condition `If CON.State = ConnectionState.Closed Then CON.Open()` triggers message alert `MessageBox.Show("Exemption for ADI Saved")...`
- **Suggested React Component**: `adi_exemptionDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: cancelentry
- **Source File**: [cancelentry.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/cancelentry.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - **Buttons**: `Button1`
  - **Input Fields**: `txtref, txtrole`
  - **Dropdown Selectors**: `cmborg, cmbrea`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - **[Button1_Click - Line 10]**: `update  jan_gate_header set reason='" & cmbrea.SelectedItem & "',rearef='" & txtref.Text & "' ,org='" & cmborg.SelectedI...`
  - **[Button1_Click - Line 31]**: `insert into jan_gatE_nval_reason (gate_no,rea_remark,rea_dt,flag,gdate,UNAME,rea_code,reason_date) values (" & Gate.dgv....`
  - **[Button1_Click - Line 35]**: `select reason from jan_gatE_header where gatE_no=" & Gate.dgv.Rows(Gate.dgv.CurrentRow.Index).Cells(1).Value & "...`
  - **[Button1_Click - Line 46]**: `update jan_gate_header set validated='4' where gate_no= " & Gate.dgv.Rows(Gate.dgv.CurrentRow.Index).Cells(1).Value & "...`
  - **[cancelentry_Load - Line 59]**: `select organization_code  from org_organization_definitions where organization_id     in(" & orgid & " )order by organiz...`
  - **[cancelentry_Load - Line 67]**: `SELECT REASON,REAREF,ORG FROM JAN_GAte_HEADER WHERE GATe_NO=" & Gate.dgv.Rows(Gate.dgv.CurrentRow.Index).Cells(1).Value ...`
### Screen-Level Validations
  - **[Button1_Click]**: Condition `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` triggers message alert `MessageBox.Show("Gate No Cancelled", "Gate Register")...`
  - **[Button1_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.ToString)...`
- **Suggested React Component**: `cancelentryDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: del
- **Source File**: [del.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/del.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - **Buttons**: `Button1, Button2`
  - **Input Fields**: `TextBox1, TextBox2, TextBox3, TextBox4, TextBox5, TextBox6`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - No database queries executed on this screen.
### Screen-Level Validations
  - **[Button1_Click]**: Condition `If CON.State = ConnectionState.Closed Then` triggers message alert `'MessageBox.Show("Delete Reason Saved", "Gate Entry")...`
  - **[Button1_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
- **Suggested React Component**: `delDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: direct_delivery
- **Source File**: [direct_delivery.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/direct_delivery.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - **Buttons**: `btnshow, Button1`
  - **Input Fields**: `txtitem`
  - **Dropdown Selectors**: `cmborg, cmbven, cmbcri`
  - **Data Grids / Tables**: `dgv1`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - **[btnshow_Click - Line 101]**: `select asn_no from jan_gate_lines_v where job='...`
  - **[btnshow_Click - Line 101]**: `select asn_no from jan_gate_lines_v where job='" & DV(i)("jobno...`
  - **[btnshow_Click - Line 103]**: `select asn_no from jan_gate_lines_v where job='...`
  - **[btnshow_Click - Line 103]**: `select asn_no from jan_gate_lines_v where job='" & DV(i)("jobno...`
### Screen-Level Validations
  - No formal validations or popup alert conditions captured on this screen.
- **Suggested React Component**: `direct_deliveryDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: eod
- **Source File**: [eod.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/eod.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - **Buttons**: `Button1, Button2`
  - **Dropdown Selectors**: `cmbprc, txtres, cmbp, cmbou`
  - **Data Grids / Tables**: `dgv1`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - **[eod_Load - Line 39]**: `Select  name,organization_id from hr_operating_units WHERE ORGANIZATION_ID In (" & ORG_ID & ")...`
  - **[Button1_Click - Line 82]**: `select *  from jan_eod_excel_list a where 1=1 and operating_unit=" & cmbou.SelectedValue & "    and a.process_id =" & cm...`
  - **[cmbprc_SelectedIndexChanged - Line 204]**: `Select distinct prime_responsibility from jan_eod_process_master where live_flag=1 and org_id=" & cmbou.SelectedValue & ...`
  - **[cmbprc_SelectedIndexChanged - Line 223]**: `Select distinct process_name,idno from jan_eod_process_master where live_flag=1 and org_id=" & cmbou.SelectedValue & "  ...`
  - **[txtres_SelectedIndexChanged - Line 246]**: `Select distinct process_name,idno from jan_eod_process_master where live_flag=1 and org_id=" & cmbou.SelectedValue & "  ...`
  - **[Button2_Click - Line 293]**: `Select C.*,Case When PENDING_DAYS> 0 Then'OVER DUE' ELSE'DUE' END STATUS,(SELECT DECODE(PLANNING_MAKE_BUY_CODE,1,'Make',...`
### Screen-Level Validations
  - **[releaseObject]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("Exception Occured while releasing object " + ex.ToString())...`
  - **[Button2_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("Over")...`
- **Suggested React Component**: `eodDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: excess-release
- **Source File**: [excess-release.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/excess-release.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - **Buttons**: `btnsave, btnclose, Button1, BTNPRINT`
  - **Input Fields**: `txtrem, txtgate, txtrole`
  - **Dropdown Selectors**: `cmbsup, cmborg`
  - **Data Grids / Tables**: `dgv, DGVLINE`
  - **Checkboxes**: `CheckBox1`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - No database queries executed on this screen.
### Screen-Level Validations
  - **[btnsave_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("Remark Saved", "Gate Register")...`
  - **[btnsave_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("Enter Remark", "Gate Register")...`
  - **[btnsave_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[Button1_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[dgv_CellClick]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[BTNPRINT_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
- **Suggested React Component**: `excess-releaseDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: fifo_login
- **Source File**: [fifo_login.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/fifo_login.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - **Buttons**: `bnlogin, btncpwd`
  - **Input Fields**: `txtuname, txtpwd`
- **Navigation**: Opens `fifo_sticker` modal screens.
### Database Queries Triggered
  - No database queries executed on this screen.
### Screen-Level Validations
  - **[bnlogin_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("Invalid Login", "FIFO Sticker Print")...`
- **Suggested React Component**: `fifo_loginDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: fifo_sticker
- **Source File**: [fifo_sticker.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/fifo_sticker.vb)
- **Purpose**: FIFO sticker printing screen. Generates and prints barcode lot details based on First-In-First-Out logic.
### UI Controls & Components
  - **Buttons**: `btnshow, btnprint, bntjob, btncshow, btn_jstk, btncprint, btnslist, btnship, Button1`
  - **Input Fields**: `txtgno, txtjob, txtjitem, txtcitem, txtitem, txtsitem, txtship, txtto, txtloc, txtfrm`
  - **Dropdown Selectors**: `cmborg, cmbjorg, cmbsub, cmbcorg, cmbsorg`
  - **Data Grids / Tables**: `dgv, dgvjob, dgvcstk, dgvs, DataGridView1`
  - **Checkboxes**: `chkpend, chkspend, chkjpend, chkptc`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - **[btnshow_Click - Line 116]**: `select ORG,GATE_NO,	ITEM,	ITEM_DESC	,SUPPLIER_NAME,	ACTUAL_LOT	,ITEM_ID	,QTY,	ORG_ID	,LOT_SUFFIX_CURRENT,	START_AUTO_LOT...`
  - **[btnshow_Click - Line 123]**: `select sum(qty_dlyd) from jan_pur_listing where gate_no= '...`
  - **[btnshow_Click - Line 123]**: `SELECT SUM(QTY_DLYD) FROM JAN_PUR_LISTING WHERE GATE_NO= '" & DV(i)("GATE_NO...`
  - **[btnprint_Click - Line 206]**: `select count(*) from JAN_FIFO_LOTNO_DETAILS where ORGANIZATION_ID=" & dgv.Rows(i).Cells(9).Value & " and item_no='" & dg...`
  - **[btnprint_Click - Line 242]**: `select SYS_CONTEXT('USERENV','IP_ADDRESS') IP from DUAL...`
  - **[bntjob_Click - Line 295]**: `select y.*,case when PRINT_FLAG >0 then (select lot_no from JAN_FIFO_LOTNO_DETAILS where ref_id=y.wip_entity_id and orga...`
  - *(8 additional queries omitted for brevity. See [queries.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/queries.md) for full SQL list)*
### Screen-Level Validations
  - **[btnshow_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("Select org", "FIFO")...`
  - **[btnshow_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[btnprint_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("No of packet should be greater than 0")...`
  - **[bntjob_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("Select org", "FIFO")...`
  - **[bntjob_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[btn_jstk_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("No of packet should be greater than 0")...`
- **Suggested React Component**: `fifo_stickerDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: gacc
- **Source File**: [gacc.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/gacc.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - **Buttons**: `Button4, Button1`
  - **Input Fields**: `TextBox1, txtrole`
  - **Data Grids / Tables**: `dgv`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - **[Button4_Click - Line 10]**: `select gate_no,gdate,supplier_name,dc_no,dc_date,gtype,vehicle_det ,inv_category,case when validated=1 then 'Gate' when ...`
  - **[Button1_Click - Line 39]**: `select MIN(GATE_NO),MAX(GATE_NO),count(*)cnt,SUM(CASE WHEN GTYPE='PO' THEN 1 ELSE 0 END) PO_CNT,SUM(cASE WHEN GTYPE='OSP...`
  - **[Button1_Click - Line 108]**: `select count(*),inv_category from jan_Gate_header a where  a.gdate>=TO_DATE('" & Format(inwdtf.Value, "dd/MM/yyyy") & " ...`
### Screen-Level Validations
  - No formal validations or popup alert conditions captured on this screen.
- **Suggested React Component**: `gaccDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: gate_lot_print
- **Source File**: [gate_lot_print.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/gate_lot_print.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - **Buttons**: `btnprint, btnshow`
  - **Input Fields**: `txtgno`
  - **Dropdown Selectors**: `cmborg, cmbtype`
  - **Data Grids / Tables**: `dgv`
  - **Checkboxes**: `chkpend`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - No database queries executed on this screen.
### Screen-Level Validations
  - **[btnshow_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
- **Suggested React Component**: `gate_lot_printDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: gatelist
- **Source File**: [gatelist.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/gatelist.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - **Buttons**: `btngo`
  - **Input Fields**: `txtpo, txtitem`
  - **Data Grids / Tables**: `dgv1, dgv2, dgv3`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - **[btngo_Click - Line 18]**: `select  gate_no,receipt_num,receipt_date,pono,podt,item_description,quantity_received,qty_appd,inv_no from jan_pur_listi...`
  - **[btngo_Click - Line 24]**: `select description,pono,podt,po_qty,recd,po_pend,gate_receipt from jan_po_pending_bought_outs where pono='" & txtpo.Text...`
  - **[btngo_Click - Line 30]**: `select gatE_no,pono,podt,description,popend,supdcqty from jan_gatE_lines where type='PO' and   pono='" & txtpo.Text & "'...`
  - **[btngo_Click - Line 37]**: `select gate_no,receipt_num,receipt_date,pono,podt,partname as item_description,quantity_received,qty_appd,inv_no from ja...`
  - **[btngo_Click - Line 43]**: `select partname as description,pono,podt,po_qty,recd,po_pend,gate_receipt from jan_po_pending_osp where partno='" & txti...`
  - **[btngo_Click - Line 49]**: `select gate_no,pono,podt,description,popend,supdcqty from jan_gatE_lines where type='OSP' and  pono='" & txtpo.Text & "'...`
### Screen-Level Validations
  - **[btngo_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
- **Suggested React Component**: `gatelistDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: gatestatus
- **Source File**: [gatestatus.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/gatestatus.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - **Buttons**: `Button2, Button5, Button1`
  - **Dropdown Selectors**: `cmborder, ComboBox1`
  - **Checkboxes**: `CheckBox1`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - **[Button5_Click - Line 274]**: `select * from   a    where  a.gdate>=TO_DATE('" & Format(inwdtf.Value, "dd/MM/yyyy") & " 00:00:00','DD/MM/YYYY HH24:MI:S...`
### Screen-Level Validations
  - No formal validations or popup alert conditions captured on this screen.
- **Suggested React Component**: `gatestatusDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: gt_checked
- **Source File**: [gt_checked.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/gt_checked.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - **Buttons**: `btngo, btnpack`
  - **Input Fields**: `txtqty, txtgate, txt_oth, txtshtr, cmbchk1, txtchk, txtpqty, txtstby`
  - **Dropdown Selectors**: `cmborg, cmbitem, cmbpack, cmbpitem`
  - **Data Grids / Tables**: `dgvpack`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - **[gt_checked_Load - Line 13]**: `select organization_code  from MTL_PARAMETERS where organization_id in (select org_id from jan_gatE_lines where gate_no=...`
  - **[gt_checked_Load - Line 31]**: `select  item,sum(supdcqty)qty  from jan_gate_lines where  gate_no=" & txtgate.Text & "  group by item...`
  - **[gt_checked_Load - Line 48]**: `select count(*) from jan_gate_lines where  gate_no=" & txtgate.Text & "  and item_check_by is not null...`
  - **[gt_checked_Load - Line 55]**: `select item_check_by,CHECKED_BY   from jan_gate_lines where  gate_no=" & txtgate.Text & "  and rownum=1...`
  - **[gt_checked_Load - Line 64]**: `select ITEM_NO, GATE_QTY, PACK_METHOD, NO_OF_PACK, PACK_QTY, pack_qty total_qty , STATUS from jan_gate_pack_Details a wh...`
  - **[btngo_Click - Line 101]**: `select count(*)  from jan_gate_lines where  gate_no=" & txtgate.Text & "  and item_check_by is not null...`
  - *(13 additional queries omitted for brevity. See [queries.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/queries.md) for full SQL list)*
### Screen-Level Validations
  - **[btngo_Click]**: Condition `If ds.Tables("namecnt").Rows(0).Item(0) = 0 Then` triggers message alert `MessageBox.Show("Invalid Name", "Gate Register")...`
  - **[btngo_Click]**: Condition `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` triggers message alert `MessageBox.Show("Start time For Item Counting Saved", "Gate Register")...`
  - **[btngo_Click]**: Condition `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` triggers message alert `MessageBox.Show("Item Checked Details Added", "Gate Entry")...`
  - **[btngo_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("Enter location To proceed", "Gate Entry")...`
  - **[txtshtr_Leave]**: Condition `If txtshtr.Text > gqty Then` triggers message alert `MessageBox.Show("Shortage Qty entered is more than received qty for the line,correct qty and proceed", "Gate Register")...`
  - **[btnpack_Click]**: Condition `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` triggers message alert `MessageBox.Show(ex.Message)...`
- **Suggested React Component**: `gt_checkedDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: headerval
- **Source File**: [headerval.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/headerval.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - **Buttons**: `btnsave`
  - **Dropdown Selectors**: `rea1, rea2`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - No database queries executed on this screen.
### Screen-Level Validations
  - **[btnsave_Click]**: Condition `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` triggers message alert `MessageBox.Show("Validate Values Saved", "Gate Register")...`
- **Suggested React Component**: `headervalDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: kanban_scan
- **Source File**: [kanban_scan.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/kanban_scan.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - **Buttons**: `Button1, Button2`
  - **Input Fields**: `txtitem`
  - **Dropdown Selectors**: `cmborg, cmbsup, cmbcat`
  - **Data Grids / Tables**: `dgv`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - **[kanban_scan_Load - Line 69]**: `select REPLACE(vendor_name,'''','''''')supplier,vendor_id from po_vendors where vendor_type_lookup_code <>'EMPLOYEE' AND...`
  - **[kanban_scan_Load - Line 76]**: `select organization_code  from jan_organization_list_view where unit_name='UNIT7' order by organization_code...`
  - **[Button2_Click - Line 106]**: `select kanban_card_number,jan_itemname(inventory_item_id)item_no,jan_itemdesc(jan_itemname(inventory_item_id)) item_Desc...`
### Screen-Level Validations
  - No formal validations or popup alert conditions captured on this screen.
- **Suggested React Component**: `kanban_scanDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: minmax
- **Source File**: [minmax.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/minmax.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - **Buttons**: `btngo, btnpri, btngo1, btnpri1`
  - **Input Fields**: `txtitem, txtitem1`
  - **Dropdown Selectors**: `cmborg, cmbitem, cmbtyp, cmbinv, cmbfc, cmborg1`
  - **Data Grids / Tables**: `dgmm, dgfc`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - **[btngo_Click - Line 284]**: `[s]   and  min_minmax_quantity >  (nvl(on_hand,0)+nvl(decode(conversion_Rate,null,(1*po_pend),(po_pend* conversion_rate)...`
### Screen-Level Validations
  - **[btngo_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[dgmm_CellFormatting]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.StackTrace)...`
  - **[btngo1_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
- **Suggested React Component**: `minmaxDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: mmcard
- **Source File**: [mmcard.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/mmcard.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - **Buttons**: `btnprint, Button1, btnshow`
  - **Input Fields**: `txtgfm, txtgto, txtrole, txtgate`
  - **Dropdown Selectors**: `cmbven, cmborg`
  - **Data Grids / Tables**: `dgv1`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - **[mmcard_Load - Line 198]**: `select vendor_name from po_vendors where vendor_type_lookup_code <>'EMPLOYEE' order by vendor_name asc...`
  - **[mmcard_Load - Line 205]**: `select organization_code  from org_organization_definitions where organization_id not in(105,112 )order by organization_...`
  - **[btnshow_Click - Line 679]**: `(select   a.gate_no,a.ORG, C.item_NO,C.ITEM_description description,C.pono,substr(supplier_name,0,30)sup ,SUM(c.quantity...`
### Screen-Level Validations
  - **[Button1_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message, " GATE")...`
- **Suggested React Component**: `mmcardDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: newreport
- **Source File**: [newreport.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/newreport.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - **Buttons**: `btnconsolidate, btnfm, btnto, btndaily, btncancel, btnrtv, btnpoamend, btninward, btntime, btnadi, btnurg, btnskip, Button1, btngt, btnlong, btnper, xerox, delayaccount, adimanual, btninv, btnprep, btnm2o, btnvallist`
  - **Input Fields**: `txtfm, txtto, txtrole, txt_miss, txtgfm, txtgto, TextBox1`
  - **Dropdown Selectors**: `cmbsup, cmborg`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - No database queries executed on this screen.
### Screen-Level Validations
  - **[btnconsolidate_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[btndaily_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[btncancel_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[btnrtv_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[btnpoamend_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[btninward_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
- **Suggested React Component**: `newreportDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: non-po
- **Source File**: [non-po.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/non-po.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - **Buttons**: `btnsave, btnrep, btnprint`
  - **Input Fields**: `txtsup, txtdcno, txtveh, txtgno, txtrole, txtogno, txtper, txtjper, txtbin, TextBox1`
  - **Dropdown Selectors**: `cmbcat, cmbsup, cmbres, ddltranp, ddldept, ComboBox1`
  - **Checkboxes**: `chknon, chkogt`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - **[btnsave_Click - Line 15]**: `SELECT TO_CHAR(JAN_FYR_DATE,'yyyy') FROM DUAL...`
  - **[btnsave_Click - Line 26]**: `select jan_GATE_NO_SEQ.NEXTVAL FROM DUAL...`
  - **[btnsave_Click - Line 41]**: `select NVL(MAX(gate_no),0)GATE_NO from jan_gate_header WHERE UNIT='POLYMER'  AND GDATE>JAN_FYR_DATE...`
  - **[btnsave_Click - Line 61]**: `select NVL(MAX(gate_no),0)GATE_NO from jan_gate_header WHERE UNIT='SKYFAST'  AND GDATE>JAN_FYR_DATE...`
  - **[btnsave_Click - Line 81]**: `select NVL(MAX(gate_no),0)GATE_NO from jan_gate_header WHERE UNIT='UNIT1'  AND GDATE>JAN_FYR_DATE...`
  - **[btnsave_Click - Line 103]**: `select NVL(MAX(gate_no),0)GATE_NO from jan_gate_header WHERE UNIT='SPM'  AND GDATE>JAN_FYR_DATE...`
  - *(9 additional queries omitted for brevity. See [queries.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/queries.md) for full SQL list)*
### Screen-Level Validations
  - **[btnsave_Click]**: Condition `If ds.Tables("resultab").Rows(0).Item(0) > 0 Then` triggers message alert `MessageBox.Show("DCNo already available for the supplier", "Gate Entry")...`
  - **[btnsave_Click]**: Condition `If cmbcat.SelectedIndex = 0 And txtbin.Text = "" Then` triggers message alert `MessageBox.Show("Enter Bin Qty and Proceed", "Gate Entry")...`
  - **[btnsave_Click]**: Condition `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` triggers message alert `MessageBox.Show("Saved Successfully !!-Gate Number is: " & txtgno.Text & "", "Gate Entry")...`
- **Suggested React Component**: `non-poDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: operation_eod_exception
- **Source File**: [operation_eod_exception.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/operation_eod_exception.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - **Data Grids / Tables**: `DataGridView1, DataGridView2, DataGridView3`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - **[operation_eod_exception_Load - Line 14]**: `["select PROC_ID,MAJOR_PROCESS,PROCESSNAME,PROCESS_DESCRIPTION,PHASE_OF_IMPLEMENTATION_OF_V2K_INITIATIVES,nvl(eod_id,exc...`
  - **[DataGridView1_CellClick - Line 55]**: `select process_id,(select process_name from jan_eod_process_master where idno=a.process_id and rownum=1)process_name,cou...`
  - **[DataGridView3_CellClick - Line 70]**: `select  org,item_no,item_Desc,vendor_name,ref_id,ref_dt,target_date,responsible_person from jan_eod_excel_list a  where ...`
  - **[DataGridView3_CellClick - Line 87]**: `select jan_orgcode(org_id)org,jan_itemname(item_id)item_no,jan_itemdesc(jan_itemname(item_id))item_desc,job_qty  from ja...`
### Screen-Level Validations
  - No formal validations or popup alert conditions captured on this screen.
- **Suggested React Component**: `operation_eod_exceptionDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: pocheck
- **Source File**: [pocheck.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/pocheck.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - **Buttons**: `btngo, BTLCALTAX, btnsave, Button3`
  - **Input Fields**: `txtpo, txtpodate, txtvendor, txtlocation, txt1, TXTITEM, TXTPQTY, TXTPOOSP, TXTGNO, txtdc, txtrate, txtrole, txtline, txtvendorid, txtcur`
  - **Data Grids / Tables**: `dgv1, dgv2, dgv3, dgvtax, dgvtaxdetails`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - **[btngo_Click - Line 43]**: `SELECT B.pono,B.po_date,B.vendor_name,B.sh_location,B.line_type,A.item ,B.item_description,B.uom,B.line_qty,b.pend_qty,A...`
  - **[btngo_Click - Line 57]**: `SELECT B.pono,B.po_date,B.vendor_name,B.sh_location,B.line_type,A.item ,B.item_description,B.uom,B.line_qty,b.pend_qty,A...`
  - **[btngo_Click - Line 76]**: `select  b.pono,B.need_by_date,B.approved_flag ,to_char(B.approved_date,'dd/mm/yyyy') approved_date,B.PRICE from jan_po_p...`
  - **[pocheck_Load - Line 177]**: `select  SUM(NVL(freigHt,0))FREIGHT,SUM(NVL(rate,0))RATE from jan_gatE_lines where   gatE_no='" & TXTGNO.Text & "'...`
  - **[pocheck_Load - Line 190]**: `update jan_gate_header set dcval='" & lbldctotval.Text & "' where gate_no=" & TXTGNO.Text & "...`
  - **[pocheck_Load - Line 197]**: `update jan_gate_header set dcval='" & lbldctotval.Text & "' where gate_no=" & TXTGNO.Text & "...`
  - *(9 additional queries omitted for brevity. See [queries.md](file:///Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/queries.md) for full SQL list)*
### Screen-Level Validations
  - **[btngo_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.ToString)...`
  - **[BTNCALTAX_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message, "Gate Entry")...`
  - **[btnsave_Click]**: Condition `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` triggers message alert `MessageBox.Show("Rate Values added", "Gate Register")...`
- **Suggested React Component**: `pocheckDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: pocheck.designer
- **Source File**: [pocheck.designer.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/pocheck.designer.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - No interactive controls found.
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - No database queries executed on this screen.
### Screen-Level Validations
  - No formal validations or popup alert conditions captured on this screen.
- **Suggested React Component**: `pocheck.designerDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: qc_block
- **Source File**: [qc_block.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/qc_block.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - **Data Grids / Tables**: `dgvlist`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - No database queries executed on this screen.
### Screen-Level Validations
  - No formal validations or popup alert conditions captured on this screen.
- **Suggested React Component**: `qc_blockDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: receipt-prepared
- **Source File**: [receipt-prepared.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/receipt-prepared.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - **Buttons**: `btngo, btnprint`
  - **Dropdown Selectors**: `gtype, cmborg`
  - **Data Grids / Tables**: `dgv, dgv1`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - No database queries executed on this screen.
### Screen-Level Validations
  - **[receipt_prepared_Load]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[btngo_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
  - **[btnprint_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
- **Suggested React Component**: `receipt-preparedDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: rtvreason
- **Source File**: [rtvreason.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/rtvreason.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - **Buttons**: `btnsave, btnupdt, btndel`
  - **Input Fields**: `txttrans, txtamt, txtterm, txtwt, txtqty, txtdoc, txtgate, txtremark`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - No database queries executed on this screen.
### Screen-Level Validations
  - **[btnsave_Click]**: Condition `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` triggers message alert `MessageBox.Show("RTV Details saved for " & txtgate.Text & "", "Gate Register")...`
  - **[btncan_Click]**: Condition `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` triggers message alert `MessageBox.Show(" RTV Details for " & txtgate.Text & " Updated", "Gate Register")...`
  - **[btndel_Click]**: Condition `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` triggers message alert `MessageBox.Show(" RTV Details for " & txtgate.Text & " Deleted", "Gate Register")...`
- **Suggested React Component**: `rtvreasonDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: suplist
- **Source File**: [suplist.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/suplist.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - **Buttons**: `btnsave, btncan`
  - **Input Fields**: `txtitem, txtname`
  - **Dropdown Selectors**: `cmbsup`
  - **Checkboxes**: `sealed`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - No database queries executed on this screen.
### Screen-Level Validations
  - **[btnsave_Click]**: Condition `If cmbsup.SelectedItem <> "" And txtitem.Text <> "" And txtname.Text <> "" Then` triggers message alert `MessageBox.Show("Enter Supplier,Item no,follower name", "Gate Register")...`
  - **[btnsave_Click]**: Condition `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` triggers message alert `MessageBox.Show("Supplier Details added", "Gate Register")...`
  - **[btncan_Click]**: Condition `If cl.oracon.State = ConnectionState.Closed Then cl.oracon.Open()` triggers message alert `MessageBox.Show("Urgent List deleted", "Gate Register")...`
- **Suggested React Component**: `suplistDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---

## Screen: valreason
- **Source File**: [valreason.vb](file:///Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry/valreason.vb)
- **Purpose**: Unused / Blank Form Template
### UI Controls & Components
  - **Buttons**: `save, cancel`
  - **Input Fields**: `gate, line, reason`
- **Navigation**: Terminal window (no sub-screens opened).
### Database Queries Triggered
  - No database queries executed on this screen.
### Screen-Level Validations
  - **[save_Click]**: Condition `If reason.Text <> "" Then` triggers message alert `MessageBox.Show("Reason Saved", "Gate Entry")...`
  - **[save_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show("Enter Reason", "Gate Entry")...`
  - **[save_Click]**: Condition `Always Triggered / Try-Catch Block` triggers message alert `MessageBox.Show(ex.Message)...`
- **Suggested React Component**: `valreasonDialog` (Structure: Router page or layout modal utilizing React Table, input elements, validation schemas like Formik/Yup, and RTK Query hooks).

---