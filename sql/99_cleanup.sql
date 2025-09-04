/*
 * Event Planner Database Cleanup Script
 * 
 * This script removes the Event Planner database and user.
 * Use this script to completely uninstall the Event Planner database.
 * 
 * WARNING: This will permanently delete all data!
 * 
 * Prerequisites:
 * 1. SQL Server Management Studio or sqlcmd access
 * 2. Administrator/sysadmin privileges
 * 
 * Instructions:
 * 1. Open SQL Server Management Studio
 * 2. Connect as an administrator (sysadmin role)
 * 3. Open and execute this script
 * 4. Confirm that you want to delete all data when prompted
 */

PRINT '===============================================';
PRINT '    Event Planner Database Cleanup';
PRINT '    WARNING: This will delete all data!';
PRINT '===============================================';
PRINT '';

-- Safety check - require manual confirmation
DECLARE @Confirmation NVARCHAR(10);
-- Uncomment the next line and set to 'YES' to proceed with cleanup
-- SET @Confirmation = 'YES';

IF @Confirmation != 'YES'
BEGIN
    PRINT 'CLEANUP CANCELLED';
    PRINT '';
    PRINT 'To proceed with cleanup:';
    PRINT '1. Edit this script';
    PRINT '2. Uncomment the line: -- SET @Confirmation = ''YES'';';
    PRINT '3. Save and run the script again';
    PRINT '';
    PRINT 'WARNING: This will permanently delete all Event Planner data!';
    RETURN;
END

PRINT 'Cleanup confirmation received. Proceeding with database removal...';
PRINT '';

-- Record start time
DECLARE @StartTime DATETIME2 = GETUTCDATE();
PRINT 'Cleanup started at: ' + CONVERT(VARCHAR, @StartTime, 120) + ' UTC';
PRINT '';

-- ==================================================
-- STEP 1: DISCONNECT ALL USERS
-- ==================================================
PRINT 'STEP 1: Disconnecting all users from EventPlannerDB...';

USE master;
GO

-- Kill all connections to the database
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'EventPlannerDB')
BEGIN
    DECLARE @sql NVARCHAR(MAX) = '';
    SELECT @sql = @sql + 'KILL ' + CAST(spid AS VARCHAR) + '; '
    FROM sys.sysprocesses 
    WHERE dbid = DB_ID('EventPlannerDB') AND spid != @@SPID;
    
    IF LEN(@sql) > 0
    BEGIN
        PRINT 'Terminating active connections...';
        EXEC sp_executesql @sql;
    END
    ELSE
    BEGIN
        PRINT 'No active connections found.';
    END
END
ELSE
BEGIN
    PRINT 'EventPlannerDB database not found.';
END

PRINT 'STEP 1: Complete.';
PRINT '';

-- ==================================================
-- STEP 2: DROP DATABASE
-- ==================================================
PRINT 'STEP 2: Dropping EventPlannerDB database...';

USE master;
GO

IF EXISTS (SELECT name FROM sys.databases WHERE name = 'EventPlannerDB')
BEGIN
    -- Set database to single user mode to ensure clean drop
    ALTER DATABASE EventPlannerDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE EventPlannerDB;
    PRINT 'EventPlannerDB database dropped successfully.';
END
ELSE
BEGIN
    PRINT 'EventPlannerDB database was not found (already removed).';
END

PRINT 'STEP 2: Complete.';
PRINT '';

-- ==================================================
-- STEP 3: DROP LOGIN
-- ==================================================
PRINT 'STEP 3: Dropping EventPlannerApp login...';

USE master;
GO

IF EXISTS (SELECT name FROM sys.server_principals WHERE name = 'EventPlannerApp')
BEGIN
    DROP LOGIN [EventPlannerApp];
    PRINT 'EventPlannerApp login dropped successfully.';
END
ELSE
BEGIN
    PRINT 'EventPlannerApp login was not found (already removed).';
END

PRINT 'STEP 3: Complete.';
PRINT '';

-- ==================================================
-- STEP 4: VERIFY CLEANUP
-- ==================================================
PRINT 'STEP 4: Verifying cleanup...';

-- Check if database still exists
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'EventPlannerDB')
    PRINT 'WARNING: EventPlannerDB database still exists!';
ELSE
    PRINT 'Verified: EventPlannerDB database removed.';

-- Check if login still exists
IF EXISTS (SELECT name FROM sys.server_principals WHERE name = 'EventPlannerApp')
    PRINT 'WARNING: EventPlannerApp login still exists!';
ELSE
    PRINT 'Verified: EventPlannerApp login removed.';

PRINT 'STEP 4: Complete.';
PRINT '';

-- ==================================================
-- CLEANUP COMPLETE
-- ==================================================
DECLARE @EndTime DATETIME2 = GETUTCDATE();
DECLARE @Duration INT = DATEDIFF(SECOND, @StartTime, @EndTime);

PRINT '===============================================';
PRINT '    CLEANUP COMPLETED SUCCESSFULLY!';
PRINT '===============================================';
PRINT '';
PRINT 'Cleanup completed at: ' + CONVERT(VARCHAR, @EndTime, 120) + ' UTC';
PRINT 'Total duration: ' + CAST(@Duration AS VARCHAR) + ' seconds';
PRINT '';
PRINT 'All Event Planner database components have been removed:';
PRINT '  ✓ EventPlannerDB database deleted';
PRINT '  ✓ EventPlannerApp login removed';
PRINT '  ✓ All data permanently deleted';
PRINT '';
PRINT 'To reinstall Event Planner:';
PRINT '  1. Run 00_complete_setup.sql for full setup';
PRINT '  2. Or run individual scripts 01-05 in order';
PRINT '';
GO
