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
            u.DEPT_ID AS DeptId
        FROM jan_tms_test.jan_complaint_login u
        WHERE u.CMPL_USER_ID = @UserId;";

    public const string Login = @"
        SELECT 
            u.CMPL_USER_ID AS UserId, 
            u.CMPL_USER_NAME AS UserName, 
            u.emp_id AS EmpId, 
            u.MOB_NO AS PhoneNo, 
            u.MAIL_ID AS Email, 
            u.DEPT_ID AS DeptId
        FROM jan_tms_test.jan_complaint_login u
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
            u.DEPT_ID AS DeptId
        FROM jan_tms_test.jan_complaint_login u;";

    public const string GetUserByIdentifier = @"
        SELECT 
            u.CMPL_USER_ID AS UserId, 
            u.CMPL_USER_NAME AS UserName, 
            u.emp_id AS EmpId, 
            u.MOB_NO AS PhoneNo, 
            u.MAIL_ID AS Email, 
            u.DEPT_ID AS DeptId
        FROM jan_tms_test.jan_complaint_login u
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
            u.DEPT_ID AS DeptId
        FROM jan_tms_test.jan_complaint_login u;";

    public const string DeleteUserRoles = @"
        DELETE FROM jan_portal_user WHERE Id = @UserId;";

    public const string InsertUserRole = @"
        INSERT INTO jan_portal_user (Id, Role, Location, CreatedBy, CreatedOn, IsActive)
        VALUES (@UserId, @Role, @Location, 'SYSTEM', NOW(), 1);";
}
