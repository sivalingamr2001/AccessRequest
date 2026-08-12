# Business Rules and Conditions

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

### Screen: Add
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

### Screen: Gate
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

### Screen: GateUpdate
**Source File Path**: `Gate Entry/GateUpdate.vb`

- **Method/Event**: `GateUpdate_Load`
  - **Rule/Condition**: `btndel.Visible = False`
- **Method/Event**: `GateUpdate_Load`
  - **Rule/Condition**: `cmbres.Visible = True`

### Screen: Login
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

### Screen: Validate
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

### Screen: adi
**Source File Path**: `Gate Entry/adi.vb`

- **Method/Event**: `adi_Load`
  - **Rule/Condition**: `chkoadi.Visible = True`

### Screen: excess-release
**Source File Path**: `Gate Entry/excess-release.vb`

- **Method/Event**: `excess_release_Load`
  - **Rule/Condition**: `'    If  And (Or ip = "192.168.0.178") Then btnsave.Enabled = True Else btnsave.Enabled = False Or ip = "192.168.13.11"`
- **Method/Event**: `Label5_Click`
  - **Rule/Condition**: `dgv.Rows(i).Visible = True`

### Screen: fifo_sticker
**Source File Path**: `Gate Entry/fifo_sticker.vb`

- **Method/Event**: `fifo_sticker_Load`
  - **Rule/Condition**: `If orgid.Contains("I23") = True Then chkptc.Visible = True Else chkptc.Visible = False`

### Screen: gt_checked
**Source File Path**: `Gate Entry/gt_checked.vb`

- **Method/Event**: `gt_checked_Load`
  - **Rule/Condition**: `GroupBox3.Visible = True`
- **Method/Event**: `txtchk_Leave`
  - **Rule/Condition**: `'    txt_oth.Visible = True`

### Screen: non-po
**Source File Path**: `Gate Entry/non-po.vb`

- **Method/Event**: `btnsave_Click`
  - **Rule/Condition**: `If txtper.Visible = True Then`
- **Method/Event**: `non_po_Load`
  - **Rule/Condition**: `cmbres.Visible = True`
- **Method/Event**: `non_po_Load`
  - **Rule/Condition**: `chkogt.Visible = True`
- **Method/Event**: `chknon_CheckedChanged`
  - **Rule/Condition**: `txtsup.Visible = True`

### Screen: pocheck
**Source File Path**: `Gate Entry/pocheck.vb`

- **Method/Event**: `btngo_Click`
  - **Rule/Condition**: `lblcval.Visible = True`
- **Method/Event**: `pocheck_Load`
  - **Rule/Condition**: `Label17.Visible = False : Label23.Visible = False : txtrate.Visible = False : txtdc.Visible = False : btnsave.Visible = False : Label29.Visible = False : txtline.Visible = False`
- **Method/Event**: `dgv1_CellClick`
  - **Rule/Condition**: `Panel1.Visible = True`
- **Method/Event**: `dgv2_CellClick`
  - **Rule/Condition**: `.Columns(3).Visible = False`

### Screen: suplist
**Source File Path**: `Gate Entry/suplist.vb`

- **Method/Event**: `rdadi_CheckedChanged`
  - **Rule/Condition**: `txtname.Enabled = False : txtitem.Enabled = False`

---

## 3. Quantity and Date Calculations

### Quantity Checking Validation
- **Source**: `Add.vb` -> `addnew`
- **Condition**: `If dgv1.Rows(i).Cells(8).Value <> "" And txtdcno.Text <> "" And Convert.ToDecimal(dgv1.Rows(i).Cells(8).Value) > Convert.ToDecimal(dgv1.Rows(i).Cells(6).Value)`
- **Rule**: Incoming DC Quantity (`Cells(8)`) cannot be greater than the Pending PO Quantity (`Cells(6)`). If it exceeds it, block saving and display: `"DcQty Greater Then Po Pend"`.

### Received Weight Check (POD)
- **Source**: `Validate.vb` -> `BTNOK_Click`
- **Condition**: `select count(*) from jan_gate_header where gate_no = ... and po_wt is not null and rec_wt is null`
- **Rule**: If a gate entry represents a POD delivery with a pre-recorded PO weight, the supervisor cannot validate it unless the actual received weight has been entered. If missing, displays: `"Received Weight not entered for POD"`.