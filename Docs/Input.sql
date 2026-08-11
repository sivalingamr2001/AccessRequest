-- 1. Create Parent Request Table
CREATE TABLE workspace.jan_access_request (
    id INT NOT NULL AUTO_INCREMENT,
    req_to VARCHAR(255) NOT NULL,
    ticket_number VARCHAR(50) NOT NULL,
    
    created_by VARCHAR(255) NOT NULL,
    created_on DATETIME NOT NULL,
    modified_by VARCHAR(255) DEFAULT NULL,
    modified_on DATETIME DEFAULT NULL,
    is_active INT NOT NULL DEFAULT 1,
    PRIMARY KEY (id)
);

-- Indexes for Request Table
CREATE INDEX idx_req_ticket_number ON workspace.jan_access_request (ticket_number);
CREATE INDEX idx_req_created_by ON workspace.jan_access_request (created_by);
CREATE INDEX idx_req_is_active ON workspace.jan_access_request (is_active);


-- 2. Create Child Items Table
CREATE TABLE workspace.jan_access_items (
    id INT NOT NULL AUTO_INCREMENT,
    request_id INT NOT NULL, -- Logical link to jan_access_request(id)
    access_type VARCHAR(255),
    folder_path VARCHAR(255),
    reason_for_access VARCHAR(255),
    confirm_access_type VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_DEPT_HOD',
    granted_at DATETIME DEFAULT NULL,
    expires_at DATETIME DEFAULT NULL,
    
    created_by VARCHAR(255) NOT NULL,
    created_on DATETIME NOT NULL,
    modified_by VARCHAR(255) DEFAULT NULL,
    modified_on DATETIME DEFAULT NULL,
    is_active INT NOT NULL DEFAULT 1,
    PRIMARY KEY (id)
);

-- Indexes for Items Table
CREATE INDEX idx_items_request_id ON workspace.jan_access_items (request_id); -- For JOIN lookups
CREATE INDEX idx_items_status ON workspace.jan_access_items (status); -- For approval queue sorting
CREATE INDEX idx_items_expiry ON workspace.jan_access_items (status, expires_at); -- Optimizes the hourly expiration event
CREATE INDEX idx_items_is_active ON workspace.jan_access_items (is_active);


-- 3. Create Approval Log Audit Table
CREATE TABLE workspace.jan_approval_log (
    id INT NOT NULL AUTO_INCREMENT,
    item_id INT NOT NULL,
    approver_role ENUM('DEPT_HOD', 'FOLDER_OWNER', 'OPERATOR') NOT NULL, 
    approved_by VARCHAR(255) NOT NULL,
    action_taken ENUM('APPROVED', 'REJECTED') NOT NULL,
    action_date DATETIME NOT NULL,
    comments TEXT,
    PRIMARY KEY (id)
);

-- Indexes for Approval Log Table
CREATE INDEX idx_log_item_id ON workspace.jan_approval_log (item_id); -- For finding history of a specific item
CREATE INDEX idx_log_approver ON workspace.jan_approval_log (approver_role, action_taken); -- For analytics and auditing
CREATE INDEX idx_log_date ON workspace.jan_approval_log (action_date);


-- 4. Automated 90-Day Expiry Engine
DELIMITER //
CREATE EVENT workspace.evt_expire_90day_access
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
    UPDATE workspace.jan_access_items
    SET 
        status = 'ACCESS_EXPIRED',
        modified_by = 'SYSTEM_AUTO_EXPIRY',
        modified_on = NOW()
    WHERE 
        status = 'ACCESS_GRANTED' 
        AND expires_at <= NOW();
END //
DELIMITER ;

CREATE TABLE workspace.jan_folder_mapping (
    id INT NOT NULL AUTO_INCREMENT,
    folder_path VARCHAR(255) NOT NULL,
    primary_folder_owner VARCHAR(255) NOT NULL,
    secondary_folder_owner VARCHAR(255) DEFAULT NULL,
    is_active INT NOT NULL DEFAULT 1,
    
    created_by VARCHAR(255) NOT NULL,
    created_on DATETIME NOT NULL,
    modified_by VARCHAR(255) DEFAULT NULL,
    modified_on DATETIME DEFAULT NULL,
    PRIMARY KEY (id)
);

-- Essential Performance Indexes
CREATE UNIQUE INDEX idx_folder_path ON workspace.jan_folder_mapping (folder_path);
CREATE INDEX idx_folder_primary_owner ON workspace.jan_folder_mapping (primary_folder_owner, is_active);
CREATE INDEX idx_folder_is_active ON workspace.jan_folder_mapping (is_active);

    "DefaultConnection": "Server=localhost;Database=workspace;User Id=root;Password=Root@123",
    "LoginConnection": "server=10.30.50.40;user id=common_login_usr;password=we#^drTS1ER^3^*U;persistsecurityinfo=True;database=jan_tms_test;"
        "DefaultConnection": "Server=localhost;Database=workspace;User Id=root;Password=",
    "LoginConnection": "Server=localhost;Database=itsr;User Id=root;Password="