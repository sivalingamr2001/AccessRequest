# Security, Performance, & Migration Risk Report

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
  - Prints labels by compiling files locally (`d:\lotprint.bat`) and executing `Shell("d:\lotprint.bat", Hide)`.
  - Runs local Windows executables (`c:\ADI.EXE`) and shell commands.
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