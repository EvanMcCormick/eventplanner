/*
 * Event Planner Database Creation Script
 * 
 * This script creates the main database for the Event Planner application.
 * Run this script first as a database administrator (sysadmin role).
 * 
 * Usage:
 * 1. Connect to SQL Server as an administrator
 * 2. Execute this script
 * 3. The database will be created and ready for use
 */

USE master;
GO

-- Check if database exists and drop it if needed (for fresh installs)
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'EventPlannerDB')
BEGIN
    PRINT 'Database EventPlannerDB already exists. Dropping and recreating...';
    
    -- Set database to single user mode to drop it
    ALTER DATABASE EventPlannerDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE EventPlannerDB;
    PRINT 'Existing database dropped.';
END

-- Create the database
CREATE DATABASE EventPlannerDB
ON 
(
    NAME = 'EventPlannerDB_Data',
    FILENAME = 'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\EventPlannerDB.mdf',
    SIZE = 100MB,
    MAXSIZE = 1GB,
    FILEGROWTH = 10MB
)
LOG ON 
(
    NAME = 'EventPlannerDB_Log',
    FILENAME = 'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\EventPlannerDB.ldf',
    SIZE = 10MB,
    MAXSIZE = 100MB,
    FILEGROWTH = 1MB
);
GO

-- Set database options for optimal performance
ALTER DATABASE EventPlannerDB SET RECOVERY SIMPLE;
ALTER DATABASE EventPlannerDB SET AUTO_CLOSE OFF;
ALTER DATABASE EventPlannerDB SET AUTO_SHRINK OFF;
ALTER DATABASE EventPlannerDB SET AUTO_UPDATE_STATISTICS ON;
ALTER DATABASE EventPlannerDB SET AUTO_CREATE_STATISTICS ON;
GO

PRINT 'Database EventPlannerDB created successfully!';
PRINT 'Location: C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\';
PRINT 'Next: Run 02_create_user.sql to create the application user';
GO
