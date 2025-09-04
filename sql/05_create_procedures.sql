/*
 * Event Planner Stored Procedures
 * 
 * This script creates stored procedures for common operations
 * to improve performance and maintain data integrity.
 */

USE EventPlannerDB;
GO

PRINT 'Creating stored procedures for Event Planner...';
PRINT '';

-- ==================================================
-- GET VENUE CONFIGURATION
-- ==================================================
IF OBJECT_ID('dbo.sp_GetVenueConfiguration', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_GetVenueConfiguration;
GO

CREATE PROCEDURE dbo.sp_GetVenueConfiguration
    @VenueCode NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        vc.ConfigId,
        v.VenueId,
        v.VenueName,
        v.VenueCode,
        v.ContactEmail,
        v.ContactPhone,
        v.Address,
        v.Website,
        vc.CompanyName,
        vc.Logo,
        vc.Tagline,
        vc.PrimaryColor,
        vc.SecondaryColor,
        vc.TimeFormat,
        vc.DateFormat,
        vc.FirstDayOfWeek,
        vc.DefaultEventDuration,
        vc.DefaultCategory,
        vc.DefaultPriority,
        vc.ShowAttendees,
        vc.ShowLocation,
        vc.ShowDescription,
        vc.AllowRecurring,
        vc.AllowFileAttachments,
        vc.UpdatedAt
    FROM dbo.Venues v
    INNER JOIN dbo.VenueConfigurations vc ON v.VenueId = vc.VenueId
    WHERE v.VenueCode = @VenueCode AND v.IsActive = 1;
END;
GO

PRINT 'Created procedure: sp_GetVenueConfiguration';

-- ==================================================
-- GET VENUE CATEGORIES
-- ==================================================
IF OBJECT_ID('dbo.sp_GetVenueCategories', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_GetVenueCategories;
GO

CREATE PROCEDURE dbo.sp_GetVenueCategories
    @VenueId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Get default categories and venue-specific categories
    SELECT 
        CategoryId,
        CategoryCode,
        CategoryName,
        Color,
        Icon,
        IsDefault,
        SortOrder
    FROM dbo.Categories
    WHERE (VenueId IS NULL AND IsDefault = 1) -- Default categories
       OR (VenueId = @VenueId AND IsActive = 1) -- Venue-specific categories
    ORDER BY IsDefault DESC, SortOrder, CategoryName;
END;
GO

PRINT 'Created procedure: sp_GetVenueCategories';

-- ==================================================
-- GET VENUE PRIORITIES
-- ==================================================
IF OBJECT_ID('dbo.sp_GetVenuePriorities', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_GetVenuePriorities;
GO

CREATE PROCEDURE dbo.sp_GetVenuePriorities
    @VenueId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Get default priorities and venue-specific priorities
    SELECT 
        PriorityId,
        PriorityCode,
        PriorityName,
        Color,
        Level,
        IsDefault
    FROM dbo.Priorities
    WHERE (VenueId IS NULL AND IsDefault = 1) -- Default priorities
       OR (VenueId = @VenueId AND IsActive = 1) -- Venue-specific priorities
    ORDER BY Level DESC, PriorityName;
END;
GO

PRINT 'Created procedure: sp_GetVenuePriorities';

-- ==================================================
-- GET VENUE LOCATIONS
-- ==================================================
IF OBJECT_ID('dbo.sp_GetVenueLocations', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_GetVenueLocations;
GO

CREATE PROCEDURE dbo.sp_GetVenueLocations
    @VenueId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        LocationId,
        LocationCode,
        LocationName,
        Description,
        Capacity,
        Amenities,
        SortOrder
    FROM dbo.Locations
    WHERE VenueId = @VenueId AND IsActive = 1
    ORDER BY SortOrder, LocationName;
END;
GO

PRINT 'Created procedure: sp_GetVenueLocations';

-- ==================================================
-- GET EVENTS FOR DATE RANGE
-- ==================================================
IF OBJECT_ID('dbo.sp_GetEventsForDateRange', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_GetEventsForDateRange;
GO

CREATE PROCEDURE dbo.sp_GetEventsForDateRange
    @VenueId UNIQUEIDENTIFIER,
    @StartDate DATETIME2,
    @EndDate DATETIME2
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        e.EventId,
        e.Title,
        e.Description,
        e.StartDate,
        e.EndDate,
        e.LocationText,
        e.IsAllDay,
        e.CreatedAt,
        e.UpdatedAt,
        
        -- Category information
        c.CategoryCode,
        c.CategoryName,
        c.Color AS CategoryColor,
        c.Icon AS CategoryIcon,
        
        -- Priority information
        p.PriorityCode,
        p.PriorityName,
        p.Color AS PriorityColor,
        p.Level AS PriorityLevel,
        
        -- Location information (if using LocationId)
        l.LocationName,
        l.LocationCode,
        l.Capacity AS LocationCapacity
        
    FROM dbo.Events e
    INNER JOIN dbo.Categories c ON e.CategoryId = c.CategoryId
    INNER JOIN dbo.Priorities p ON e.PriorityId = p.PriorityId
    LEFT JOIN dbo.Locations l ON e.LocationId = l.LocationId
    
    WHERE e.VenueId = @VenueId
      AND e.StartDate <= @EndDate
      AND e.EndDate >= @StartDate
    
    ORDER BY e.StartDate, e.Title;
END;
GO

PRINT 'Created procedure: sp_GetEventsForDateRange';

-- ==================================================
-- CREATE OR UPDATE EVENT
-- ==================================================
IF OBJECT_ID('dbo.sp_SaveEvent', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_SaveEvent;
GO

CREATE PROCEDURE dbo.sp_SaveEvent
    @EventId UNIQUEIDENTIFIER = NULL,
    @VenueId UNIQUEIDENTIFIER,
    @Title NVARCHAR(200),
    @Description NVARCHAR(MAX) = NULL,
    @StartDate DATETIME2,
    @EndDate DATETIME2,
    @LocationId UNIQUEIDENTIFIER = NULL,
    @LocationText NVARCHAR(200) = NULL,
    @CategoryCode NVARCHAR(50),
    @PriorityCode NVARCHAR(50),
    @IsAllDay BIT = 0,
    @CreatedBy NVARCHAR(100) = 'System',
    @Attendees NVARCHAR(MAX) = NULL -- JSON array of attendees
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @CategoryId UNIQUEIDENTIFIER;
    DECLARE @PriorityId UNIQUEIDENTIFIER;
    DECLARE @IsUpdate BIT = 0;
    
    -- Get CategoryId
    SELECT @CategoryId = CategoryId 
    FROM dbo.Categories 
    WHERE CategoryCode = @CategoryCode 
      AND (VenueId = @VenueId OR VenueId IS NULL)
      AND IsActive = 1;
    
    -- Get PriorityId
    SELECT @PriorityId = PriorityId 
    FROM dbo.Priorities 
    WHERE PriorityCode = @PriorityCode 
      AND (VenueId = @VenueId OR VenueId IS NULL)
      AND IsActive = 1;
    
    -- Validate required data
    IF @CategoryId IS NULL
        THROW 50001, 'Invalid category code', 1;
    
    IF @PriorityId IS NULL
        THROW 50002, 'Invalid priority code', 1;
    
    -- Check if this is an update
    IF @EventId IS NOT NULL AND EXISTS(SELECT 1 FROM dbo.Events WHERE EventId = @EventId)
        SET @IsUpdate = 1;
    ELSE
        SET @EventId = NEWID();
    
    IF @IsUpdate = 1
    BEGIN
        -- Update existing event
        UPDATE dbo.Events
        SET Title = @Title,
            Description = @Description,
            StartDate = @StartDate,
            EndDate = @EndDate,
            LocationId = @LocationId,
            LocationText = @LocationText,
            CategoryId = @CategoryId,
            PriorityId = @PriorityId,
            IsAllDay = @IsAllDay,
            UpdatedAt = GETUTCDATE(),
            UpdatedBy = @CreatedBy
        WHERE EventId = @EventId;
    END
    ELSE
    BEGIN
        -- Insert new event
        INSERT INTO dbo.Events (
            EventId, VenueId, Title, Description, StartDate, EndDate,
            LocationId, LocationText, CategoryId, PriorityId, IsAllDay,
            CreatedAt, CreatedBy, UpdatedAt, UpdatedBy
        )
        VALUES (
            @EventId, @VenueId, @Title, @Description, @StartDate, @EndDate,
            @LocationId, @LocationText, @CategoryId, @PriorityId, @IsAllDay,
            GETUTCDATE(), @CreatedBy, GETUTCDATE(), @CreatedBy
        );
    END
    
    -- Handle attendees if provided
    IF @Attendees IS NOT NULL AND @Attendees != ''
    BEGIN
        -- Delete existing attendees for update
        IF @IsUpdate = 1
            DELETE FROM dbo.EventAttendees WHERE EventId = @EventId;
        
        -- Insert attendees (assuming JSON array of names)
        -- This is a simplified version - in production, you'd parse JSON properly
        DECLARE @AttendeeName NVARCHAR(200);
        DECLARE @StartPos INT = 1;
        DECLARE @EndPos INT;
        
        -- Simple comma-separated parsing (replace with JSON parsing in production)
        SET @Attendees = REPLACE(@Attendees, '[', '');
        SET @Attendees = REPLACE(@Attendees, ']', '');
        SET @Attendees = REPLACE(@Attendees, '"', '');
        
        WHILE @StartPos <= LEN(@Attendees)
        BEGIN
            SET @EndPos = CHARINDEX(',', @Attendees, @StartPos);
            IF @EndPos = 0 SET @EndPos = LEN(@Attendees) + 1;
            
            SET @AttendeeName = LTRIM(RTRIM(SUBSTRING(@Attendees, @StartPos, @EndPos - @StartPos)));
            
            IF LEN(@AttendeeName) > 0
            BEGIN
                INSERT INTO dbo.EventAttendees (EventId, AttendeeName)
                VALUES (@EventId, @AttendeeName);
            END
            
            SET @StartPos = @EndPos + 1;
        END
    END
    
    -- Return the EventId
    SELECT @EventId AS EventId;
END;
GO

PRINT 'Created procedure: sp_SaveEvent';

-- ==================================================
-- DELETE EVENT
-- ==================================================
IF OBJECT_ID('dbo.sp_DeleteEvent', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_DeleteEvent;
GO

CREATE PROCEDURE dbo.sp_DeleteEvent
    @EventId UNIQUEIDENTIFIER,
    @VenueId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Verify the event belongs to the venue before deleting
    DELETE FROM dbo.Events 
    WHERE EventId = @EventId AND VenueId = @VenueId;
    
    IF @@ROWCOUNT = 0
        THROW 50003, 'Event not found or access denied', 1;
    
    SELECT 'Event deleted successfully' AS Message;
END;
GO

PRINT 'Created procedure: sp_DeleteEvent';

-- ==================================================
-- UPDATE VENUE CONFIGURATION
-- ==================================================
IF OBJECT_ID('dbo.sp_UpdateVenueConfiguration', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_UpdateVenueConfiguration;
GO

CREATE PROCEDURE dbo.sp_UpdateVenueConfiguration
    @VenueId UNIQUEIDENTIFIER,
    @CompanyName NVARCHAR(100),
    @Logo NVARCHAR(500) = NULL,
    @Tagline NVARCHAR(200) = NULL,
    @PrimaryColor NVARCHAR(7),
    @SecondaryColor NVARCHAR(7),
    @TimeFormat NVARCHAR(3) = '12h',
    @DateFormat NVARCHAR(10) = 'MM/DD/YYYY',
    @FirstDayOfWeek TINYINT = 0,
    @DefaultEventDuration DECIMAL(4,2) = 1.0,
    @DefaultCategory NVARCHAR(50) = 'meeting',
    @DefaultPriority NVARCHAR(50) = 'normal',
    @ShowAttendees BIT = 1,
    @ShowLocation BIT = 1,
    @ShowDescription BIT = 1,
    @AllowRecurring BIT = 0,
    @AllowFileAttachments BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE dbo.VenueConfigurations
    SET CompanyName = @CompanyName,
        Logo = @Logo,
        Tagline = @Tagline,
        PrimaryColor = @PrimaryColor,
        SecondaryColor = @SecondaryColor,
        TimeFormat = @TimeFormat,
        DateFormat = @DateFormat,
        FirstDayOfWeek = @FirstDayOfWeek,
        DefaultEventDuration = @DefaultEventDuration,
        DefaultCategory = @DefaultCategory,
        DefaultPriority = @DefaultPriority,
        ShowAttendees = @ShowAttendees,
        ShowLocation = @ShowLocation,
        ShowDescription = @ShowDescription,
        AllowRecurring = @AllowRecurring,
        AllowFileAttachments = @AllowFileAttachments,
        UpdatedAt = GETUTCDATE()
    WHERE VenueId = @VenueId;
    
    IF @@ROWCOUNT = 0
        THROW 50004, 'Venue configuration not found', 1;
    
    SELECT 'Configuration updated successfully' AS Message;
END;
GO

PRINT 'Created procedure: sp_UpdateVenueConfiguration';

PRINT '';
PRINT 'All stored procedures created successfully!';
PRINT '';
PRINT 'Available procedures:';
PRINT '  - sp_GetVenueConfiguration: Get venue settings';
PRINT '  - sp_GetVenueCategories: Get all categories for a venue';
PRINT '  - sp_GetVenuePriorities: Get all priorities for a venue';
PRINT '  - sp_GetVenueLocations: Get all locations for a venue';
PRINT '  - sp_GetEventsForDateRange: Get events within date range';
PRINT '  - sp_SaveEvent: Create or update an event';
PRINT '  - sp_DeleteEvent: Delete an event';
PRINT '  - sp_UpdateVenueConfiguration: Update venue settings';
GO
