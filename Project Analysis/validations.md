# Validations Documentation

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