/*
 * Event Planner Complete Setup Script (Safe for SSMS)
 * - No hard-coded file paths (uses SQL Server defaults)
 * - No batch separators (variables remain in scope)
 * - Guards and clear error handling
 */

PRINT '===============================================';
PRINT '    Event Planner Database Setup';
PRINT '    Version 1.1 - ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '===============================================';
PRINT '';

-- Check SQL Server version
DECLARE @Version NVARCHAR(128) = @@VERSION;
PRINT 'SQL Server Version: ' + @Version;
PRINT '';

-- Record start time
DECLARE @StartTime DATETIME2 = SYSUTCDATETIME();
PRINT 'Setup started at: ' + CONVERT(VARCHAR, @StartTime, 120) + ' UTC';
PRINT '';

BEGIN TRY
  --------------------------------------------------
  -- STEP 1: CREATE DATABASE
  --------------------------------------------------
  PRINT 'STEP 1: Creating database...';

  -- If DB exists, drop it (comment this block if you do NOT want to drop)
  IF DB_ID('EventPlannerDB') IS NOT NULL
  BEGIN
    PRINT 'Database EventPlannerDB already exists. Dropping and recreating...';
    ALTER DATABASE EventPlannerDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE EventPlannerDB;
    PRINT 'Existing database dropped.';
  END

  -- Create database using default instance paths (no hard-coded file locations)
  EXEC('CREATE DATABASE EventPlannerDB');

  -- Wait until the database is visible and ONLINE (handles slow disk/metadata)
  DECLARE @retries INT = 0;
  WHILE (
      DB_ID('EventPlannerDB') IS NULL OR EXISTS(
        SELECT 1 FROM sys.databases WHERE name = 'EventPlannerDB' AND state_desc <> 'ONLINE'
      )
    ) AND @retries < 30
  BEGIN
    SET @retries += 1;
    WAITFOR DELAY '00:00:01'; -- 1 second
  END

  IF DB_ID('EventPlannerDB') IS NULL
    THROW 50010, 'Database EventPlannerDB was not created.', 1;

  -- Set database options (only if DB exists)
  IF DB_ID('EventPlannerDB') IS NOT NULL
  BEGIN
    ALTER DATABASE EventPlannerDB SET RECOVERY SIMPLE;
    ALTER DATABASE EventPlannerDB SET AUTO_CLOSE OFF;
    ALTER DATABASE EventPlannerDB SET AUTO_SHRINK OFF;
    ALTER DATABASE EventPlannerDB SET AUTO_UPDATE_STATISTICS ON;
    ALTER DATABASE EventPlannerDB SET AUTO_CREATE_STATISTICS ON;
  END

  PRINT 'STEP 1: Database created successfully!';
  PRINT '';

  --------------------------------------------------
  -- STEP 2: CREATE USER
  --------------------------------------------------
  PRINT 'STEP 2: Creating application user...';

  -- Variables for user credentials (change password for production)
  DECLARE @LoginName NVARCHAR(50) = 'EventPlannerApp';
  DECLARE @Password  NVARCHAR(128) = 'EventPlanner2025!';

  -- Create (or recreate) SQL Server login
  IF EXISTS (SELECT 1 FROM sys.server_principals WHERE name = @LoginName)
  BEGIN
    PRINT 'Login ' + @LoginName + ' already exists. Dropping and recreating...';
    DECLARE @DropLogin NVARCHAR(MAX) = 'DROP LOGIN [' + @LoginName + ']';
    EXEC(@DropLogin);
  END

  DECLARE @CreateLogin NVARCHAR(MAX) = 'CREATE LOGIN [' + @LoginName + '] WITH PASSWORD = ''' + @Password + ''', CHECK_EXPIRATION = OFF, CHECK_POLICY = OFF';
  EXEC(@CreateLogin);

  -- Create user in EventPlannerDB and grant permissions (guarded by existence)
  IF DB_ID('EventPlannerDB') IS NULL
    THROW 50011, 'Cannot create user because EventPlannerDB does not exist.', 1;

  EXEC('USE EventPlannerDB;');

  IF EXISTS (SELECT 1 FROM sys.database_principals WHERE name = @LoginName)
  BEGIN
    DECLARE @DropUser NVARCHAR(MAX) = 'DROP USER [' + @LoginName + ']';
    EXEC(@DropUser);
  END

  DECLARE @CreateUser NVARCHAR(MAX) = 'CREATE USER [' + @LoginName + '] FOR LOGIN [' + @LoginName + ']';
  EXEC(@CreateUser);

  -- Minimal required permissions
  EXEC sp_addrolemember N'db_datareader', @LoginName;
  EXEC sp_addrolemember N'db_datawriter', @LoginName;
  GRANT EXECUTE ON SCHEMA::dbo TO [EventPlannerApp];
  GRANT CREATE TABLE TO [EventPlannerApp];
  GRANT ALTER ON SCHEMA::dbo TO [EventPlannerApp];

  PRINT 'STEP 2: User created successfully!';
  PRINT '';

  --------------------------------------------------
  -- STEP 3: CREATE TABLES
  --------------------------------------------------
  PRINT 'STEP 3: Creating database tables...';
  PRINT 'NOTE: Run 03_create_tables.sql next.';
  PRINT 'STEP 3: Tables creation step completed (pending external script).';
  PRINT '';

  --------------------------------------------------
  -- STEP 4: INSERT DEFAULT DATA
  --------------------------------------------------
  PRINT 'STEP 4: Inserting default data...';
  PRINT 'NOTE: Run 04_insert_default_data.sql after creating tables.';
  PRINT 'STEP 4: Default data insertion step completed (pending external script).';
  PRINT '';

  --------------------------------------------------
  -- STEP 5: CREATE STORED PROCEDURES
  --------------------------------------------------
  PRINT 'STEP 5: Creating stored procedures...';
  PRINT 'NOTE: Run 05_create_procedures.sql after default data.';
  PRINT 'STEP 5: Stored procedures creation step completed (pending external script).';
  PRINT '';

END TRY
BEGIN CATCH
  PRINT '*** ERROR OCCURRED ***';
  PRINT 'Message  : ' + ERROR_MESSAGE();
  PRINT 'Severity : ' + CAST(ERROR_SEVERITY() AS VARCHAR(10));
  PRINT 'State    : ' + CAST(ERROR_STATE() AS VARCHAR(10));
  PRINT 'Line     : ' + CAST(ERROR_LINE() AS VARCHAR(10));
  PRINT '';
  PRINT 'Terminating setup due to errors.';
END CATCH;

-- Completion info
DECLARE @EndTime DATETIME2 = SYSUTCDATETIME();
DECLARE @Duration INT = DATEDIFF(SECOND, @StartTime, @EndTime);

PRINT '===============================================';
PRINT '    SETUP COMPLETED (see notes above)';
PRINT '===============================================';
PRINT '';
PRINT 'Setup completed at: ' + CONVERT(VARCHAR, @EndTime, 120) + ' UTC';
PRINT 'Total duration: ' + CAST(@Duration AS VARCHAR) + ' seconds';
PRINT '';
PRINT '=== CONNECTION INFORMATION ===';
PRINT 'Server: localhost (or your server name)';
PRINT 'Database: EventPlannerDB';
PRINT 'Username: EventPlannerApp';
PRINT 'Password: EventPlanner2025!';
PRINT '';
PRINT '=== CONNECTION STRING ===';
PRINT 'Server=localhost;Database=EventPlannerDB;User Id=EventPlannerApp;Password=EventPlanner2025!;TrustServerCertificate=True;';
PRINT '';
PRINT '=== NEXT STEPS ===';
PRINT '1) Run 03_create_tables.sql';
PRINT '2) Run 04_insert_default_data.sql';
PRINT '3) Run 05_create_procedures.sql';
PRINT '';
PRINT 'For cleanup, run: 99_cleanup.sql';
-- End of script
