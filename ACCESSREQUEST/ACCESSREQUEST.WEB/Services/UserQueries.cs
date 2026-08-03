namespace ACCESSREQUEST.WEB.Services;

public static class UserQueries
{
    public const string GetUserById = @"
        SELECT 
            u.CMPL_USER_ID AS UserId, 
            u.CMPL_USER_NAME AS UserName, 
            u.emp_id AS EmpId, 
            u.MOB_NO AS PhoneNo, 
            u.MAIL_ID AS Email, 
            u.DEPT_ID AS DeptId,
            COALESCE(
                (SELECT CONCAT('[', GROUP_CONCAT(CONCAT('""', Role, '""')), ']') 
                 FROM workspace.jan_roles 
                 WHERE Id = u.CMPL_USER_ID AND IsActive = 1), 
                '[]'
            ) AS RolesJson,
            COALESCE(
                (SELECT Location FROM workspace.jan_roles WHERE Id = u.CMPL_USER_ID AND IsActive = 1 LIMIT 1), 
                ''
            ) AS Location
        FROM workspace.jan_portal_user u
        WHERE u.CMPL_USER_ID = @UserId;";

    public const string Login = @"
        SELECT 
            u.CMPL_USER_ID AS UserId, 
            u.CMPL_USER_NAME AS UserName, 
            u.emp_id AS EmpId, 
            u.MOB_NO AS PhoneNo, 
            u.MAIL_ID AS Email, 
            u.DEPT_ID AS DeptId,
            COALESCE(
                (SELECT CONCAT('[', GROUP_CONCAT(CONCAT('""', Role, '""')), ']') 
                 FROM workspace.jan_roles 
                 WHERE Id = u.CMPL_USER_ID AND IsActive = 1), 
                '[]'
            ) AS RolesJson,
            COALESCE(
                (SELECT Location FROM workspace.jan_roles WHERE Id = u.CMPL_USER_ID AND IsActive = 1 LIMIT 1), 
                ''
            ) AS Location
        FROM workspace.jan_portal_user u
        WHERE u.CMPL_USER_NAME = @Username 
          AND (u.emp_id = @Password 
               OR u.CMPL_USER_KEY = @Password 
               OR u.MAIL_ID = @Password 
               OR u.MOB_NO = @Password);";

    public const string GetAllUsers = @"
        SELECT 
            u.CMPL_USER_ID AS UserId, 
            u.CMPL_USER_NAME AS UserName, 
            u.emp_id AS EmpId, 
            u.MOB_NO AS PhoneNo, 
            u.MAIL_ID AS Email, 
            u.DEPT_ID AS DeptId,
            COALESCE(
                (SELECT CONCAT('[', GROUP_CONCAT(CONCAT('""', Role, '""')), ']') 
                 FROM workspace.jan_roles 
                 WHERE Id = u.CMPL_USER_ID AND IsActive = 1), 
                '[]'
            ) AS RolesJson,
            COALESCE(
                (SELECT Location FROM workspace.jan_roles WHERE Id = u.CMPL_USER_ID AND IsActive = 1 LIMIT 1), 
                ''
            ) AS Location
        FROM workspace.jan_portal_user u;";

    public const string GetUserByIdentifier = @"
        SELECT 
            u.CMPL_USER_ID AS UserId, 
            u.CMPL_USER_NAME AS UserName, 
            u.emp_id AS EmpId, 
            u.MOB_NO AS PhoneNo, 
            u.MAIL_ID AS Email, 
            u.DEPT_ID AS DeptId,
            COALESCE(
                (SELECT CONCAT('[', GROUP_CONCAT(CONCAT('""', Role, '""')), ']') 
                 FROM workspace.jan_roles 
                 WHERE Id = u.CMPL_USER_ID AND IsActive = 1), 
                '[]'
            ) AS RolesJson,
            COALESCE(
                (SELECT Location FROM workspace.jan_roles WHERE Id = u.CMPL_USER_ID AND IsActive = 1 LIMIT 1), 
                ''
            ) AS Location
        FROM workspace.jan_portal_user u
        WHERE u.CMPL_USER_ID = @IdOrZero 
           OR u.emp_id = @Identifier 
           OR u.CMPL_USER_NAME = @Identifier 
           OR u.MAIL_ID = @Identifier;";

    public const string GetAllHods = @"
        SELECT DISTINCT
            u.CMPL_USER_ID AS UserId, 
            u.CMPL_USER_NAME AS UserName, 
            u.emp_id AS EmpId, 
            u.MOB_NO AS PhoneNo, 
            u.MAIL_ID AS Email, 
            u.DEPT_ID AS DeptId,
            COALESCE(
                (SELECT CONCAT('[', GROUP_CONCAT(CONCAT('""', Role, '""')), ']') 
                 FROM workspace.jan_roles 
                 WHERE Id = u.CMPL_USER_ID AND IsActive = 1), 
                '[]'
            ) AS RolesJson,
            COALESCE(
                (SELECT Location FROM workspace.jan_roles WHERE Id = u.CMPL_USER_ID AND IsActive = 1 LIMIT 1), 
                ''
            ) AS Location
        FROM workspace.jan_portal_user u
        INNER JOIN workspace.jan_roles r ON u.CMPL_USER_ID = r.Id
        WHERE r.Role = 'Hod' AND r.IsActive = 1;";

    public const string DeleteUserRoles = @"
        DELETE FROM workspace.jan_roles WHERE Id = @UserId;";

    public const string InsertUserRole = @"
        INSERT INTO workspace.jan_roles (Id, Role, Location, CreatedBy, CreatedOn, IsActive)
        VALUES (@UserId, @Role, @Location, 'SYSTEM', NOW(), 1);";
}
