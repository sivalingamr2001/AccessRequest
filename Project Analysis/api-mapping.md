# REST API Endpoint Mapping

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