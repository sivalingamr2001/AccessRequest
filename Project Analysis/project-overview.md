# Project Overview - Gate Entry Management System

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
  - `d:\lotsticker.txt` (ZPL printer commands)
  - `d:\lotprint.bat` (Direct copying to network printers)
  - `d:\locprint.bat` (Location label copying)
  - `d:\receipt\rec_pend.HTML` (HTML reports)
  - `F:\public\adi_2.BAT` (Batch execution)
  - `c:\ADI.EXE` (External Windows executable)
  - `c:\gate\gate.bat` (Local script execution)
  - `F:\public\Unclosed_adi.BAT` (Batch execution)