/*
 * Event Planner Application User Creation Script
 * 
 * This script creates a dedicated SQL Server user for the Event Planner application.
 * The user will have limited permissions for security best practices.
 * 
 * Run this script as a database administrator after creating the database.
 * 
 * Usage:
 * 1. Ensure the EventPlannerDB database exists
 * 2. Execute this script as an administrator
 * 3. Use the created login credentials in your application connection string
 */

USE master;
GO

-- Variables for user credentials (modify as needed for each client)
DECLARE @LoginName NVARCHAR(50) = 'EventPlannerApp';
DECLARE @Password NVARCHAR(50) = 'EventPlanner2025!';
DECLARE @DatabaseName NVARCHAR(50) = 'EventPlannerDB';

-- Check if login already exists and drop it
IF EXISTS (SELECT name FROM sys.server_principals WHERE name = @LoginName)
BEGIN
    PRINT 'Login ' + @LoginName + ' already exists. Dropping and recreating...';
    DROP LOGIN [EventPlannerApp];
END

-- Create SQL Server login
EXECUTE ('CREATE LOGIN [' + @LoginName + '] WITH PASSWORD = ''' + @Password + ''', 
    DEFAULT_DATABASE = [' + @DatabaseName + '], 
    CHECK_EXPIRATION = OFF, 
    CHECK_POLICY = OFF');

PRINT 'Login created: ' + @LoginName;
PRINT 'Password: ' + @Password;
PRINT 'Default Database: ' + @DatabaseName;
GO

-- Switch to the Event Planner database
USE EventPlannerDB;
GO

-- Create database user for the login
IF EXISTS (SELECT name FROM sys.database_principals WHERE name = 'EventPlannerApp')
BEGIN
    PRINT 'Database user EventPlannerApp already exists. Dropping and recreating...';
    DROP USER [EventPlannerApp];
END

CREATE USER [EventPlannerApp] FOR LOGIN [EventPlannerApp];
GO

-- Grant necessary permissions to the user
-- Data Reader and Writer permissions
ALTER ROLE db_datareader ADD MEMBER [EventPlannerApp];
ALTER ROLE db_datawriter ADD MEMBER [EventPlannerApp];

-- Grant specific permissions for stored procedures and functions
GRANT EXECUTE ON SCHEMA::dbo TO [EventPlannerApp];

-- Grant permissions to create and modify tables (for future schema updates)
GRANT CREATE TABLE TO [EventPlannerApp];
GRANT ALTER ON SCHEMA::dbo TO [EventPlannerApp];

PRINT 'Database user EventPlannerApp created and permissions granted.';
PRINT '';
PRINT '=== CONNECTION STRING INFORMATION ===';
PRINT 'Server: localhost (or your server name)';
PRINT 'Database: EventPlannerDB';
PRINT 'Username: EventPlannerApp';
PRINT 'Password: EventPlanner2025!';
PRINT '';
PRINT 'Example Connection String:';
PRINT 'Server=localhost;Database=EventPlannerDB;User Id=EventPlannerApp;Password=EventPlanner2025!;TrustServerCertificate=True;';
PRINT '';
PRINT 'Next: Run 03_create_tables.sql to create the database schema';
GO
