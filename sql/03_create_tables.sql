/*
 * Event Planner Database Tables Creation Script
 * 
 * This script creates all the necessary tables for the Event Planner application.
 * It includes tables for venues, configurations, events, categories, priorities, and locations.
 * 
 * Run this script after creating the database and user.
 * 
 * Tables Created:
 * - Venues: Multi-tenant support for different clients
 * - VenueConfigurations: Venue-specific settings and branding
 * - Categories: Event categories (default + custom per venue)
 * - Priorities: Event priorities (default + custom per venue)
 * - Locations: Venue-specific locations/rooms
 * - Events: Main events table
 * - EventAttendees: Attendees for each event
 */

USE EventPlannerDB;
GO

-- Enable ANSI_NULLS and QUOTED_IDENTIFIER for all objects
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

PRINT 'Creating Event Planner database schema...';
PRINT '';

-- ==================================================
-- VENUES TABLE (Multi-tenant support)
-- ==================================================
IF OBJECT_ID('dbo.Venues', 'U') IS NOT NULL
    DROP TABLE dbo.Venues;

CREATE TABLE dbo.Venues (
    VenueId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    VenueName NVARCHAR(100) NOT NULL,
    VenueCode NVARCHAR(20) NOT NULL UNIQUE, -- Short code for venue identification
    ContactEmail NVARCHAR(100),
    ContactPhone NVARCHAR(20),
    Address NVARCHAR(500),
    Website NVARCHAR(200),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Create index on VenueCode for fast lookups
CREATE NONCLUSTERED INDEX IX_Venues_VenueCode ON dbo.Venues (VenueCode);

PRINT 'Created table: Venues';

-- ==================================================
-- VENUE CONFIGURATIONS TABLE
-- ==================================================
IF OBJECT_ID('dbo.VenueConfigurations', 'U') IS NOT NULL
    DROP TABLE dbo.VenueConfigurations;

CREATE TABLE dbo.VenueConfigurations (
    ConfigId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    VenueId UNIQUEIDENTIFIER NOT NULL,
    
    -- Branding
    CompanyName NVARCHAR(100) NOT NULL DEFAULT 'Event Planner',
    Logo NVARCHAR(500) DEFAULT '📅', -- URL or emoji
    Tagline NVARCHAR(200),
    PrimaryColor NVARCHAR(7) DEFAULT '#667eea', -- Hex color
    SecondaryColor NVARCHAR(7) DEFAULT '#764ba2',
    
    -- Application Settings
    TimeFormat NVARCHAR(3) DEFAULT '12h', -- '12h' or '24h'
    DateFormat NVARCHAR(10) DEFAULT 'MM/DD/YYYY', -- 'MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'
    FirstDayOfWeek TINYINT DEFAULT 0, -- 0 = Sunday, 1 = Monday
    DefaultEventDuration DECIMAL(4,2) DEFAULT 1.0, -- in hours
    DefaultCategory NVARCHAR(50) DEFAULT 'meeting',
    DefaultPriority NVARCHAR(50) DEFAULT 'normal',
    
    -- Feature Flags
    ShowAttendees BIT DEFAULT 1,
    ShowLocation BIT DEFAULT 1,
    ShowDescription BIT DEFAULT 1,
    AllowRecurring BIT DEFAULT 0,
    AllowFileAttachments BIT DEFAULT 0,
    
    -- Audit fields
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    -- Foreign key constraint
    CONSTRAINT FK_VenueConfigurations_Venues FOREIGN KEY (VenueId) REFERENCES dbo.Venues(VenueId) ON DELETE CASCADE
);

-- Create index on VenueId for fast lookups
CREATE NONCLUSTERED INDEX IX_VenueConfigurations_VenueId ON dbo.VenueConfigurations (VenueId);

PRINT 'Created table: VenueConfigurations';

-- ==================================================
-- CATEGORIES TABLE (Default + Custom per venue)
-- ==================================================
IF OBJECT_ID('dbo.Categories', 'U') IS NOT NULL
    DROP TABLE dbo.Categories;

CREATE TABLE dbo.Categories (
    CategoryId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    VenueId UNIQUEIDENTIFIER NULL, -- NULL for default categories, VenueId for custom
    CategoryCode NVARCHAR(50) NOT NULL, -- 'meeting', 'personal', etc.
    CategoryName NVARCHAR(100) NOT NULL,
    Color NVARCHAR(7) NOT NULL DEFAULT '#6b7280', -- Hex color
    Icon NVARCHAR(10), -- Emoji or icon code
    IsActive BIT NOT NULL DEFAULT 1,
    IsDefault BIT NOT NULL DEFAULT 0, -- True for system default categories
    SortOrder INT DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    -- Foreign key constraint
    CONSTRAINT FK_Categories_Venues FOREIGN KEY (VenueId) REFERENCES dbo.Venues(VenueId) ON DELETE CASCADE
);

-- Create indexes
CREATE NONCLUSTERED INDEX IX_Categories_VenueId ON dbo.Categories (VenueId);
CREATE NONCLUSTERED INDEX IX_Categories_CategoryCode ON dbo.Categories (CategoryCode);

PRINT 'Created table: Categories';

-- ==================================================
-- PRIORITIES TABLE (Default + Custom per venue)
-- ==================================================
IF OBJECT_ID('dbo.Priorities', 'U') IS NOT NULL
    DROP TABLE dbo.Priorities;

CREATE TABLE dbo.Priorities (
    PriorityId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    VenueId UNIQUEIDENTIFIER NULL, -- NULL for default priorities, VenueId for custom
    PriorityCode NVARCHAR(50) NOT NULL, -- 'low', 'normal', 'high', etc.
    PriorityName NVARCHAR(100) NOT NULL,
    Color NVARCHAR(7) NOT NULL DEFAULT '#6b7280', -- Hex color
    Level TINYINT NOT NULL DEFAULT 5, -- 1-10 for sorting (higher = more urgent)
    IsActive BIT NOT NULL DEFAULT 1,
    IsDefault BIT NOT NULL DEFAULT 0, -- True for system default priorities
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    -- Foreign key constraint
    CONSTRAINT FK_Priorities_Venues FOREIGN KEY (VenueId) REFERENCES dbo.Venues(VenueId) ON DELETE CASCADE
);

-- Create indexes
CREATE NONCLUSTERED INDEX IX_Priorities_VenueId ON dbo.Priorities (VenueId);
CREATE NONCLUSTERED INDEX IX_Priorities_PriorityCode ON dbo.Priorities (PriorityCode);

PRINT 'Created table: Priorities';

-- ==================================================
-- LOCATIONS TABLE (Venue-specific rooms/areas)
-- ==================================================
IF OBJECT_ID('dbo.Locations', 'U') IS NOT NULL
    DROP TABLE dbo.Locations;

CREATE TABLE dbo.Locations (
    LocationId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    VenueId UNIQUEIDENTIFIER NOT NULL,
    LocationCode NVARCHAR(50) NOT NULL, -- 'main-hall', 'meeting-room-a', etc.
    LocationName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    Capacity INT,
    Amenities NVARCHAR(1000), -- JSON array of amenities
    IsActive BIT NOT NULL DEFAULT 1,
    SortOrder INT DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    -- Foreign key constraint
    CONSTRAINT FK_Locations_Venues FOREIGN KEY (VenueId) REFERENCES dbo.Venues(VenueId) ON DELETE CASCADE
);

-- Create indexes
CREATE NONCLUSTERED INDEX IX_Locations_VenueId ON dbo.Locations (VenueId);
CREATE NONCLUSTERED INDEX IX_Locations_LocationCode ON dbo.Locations (LocationCode);

PRINT 'Created table: Locations';

-- ==================================================
-- EVENTS TABLE (Main events storage)
-- ==================================================
IF OBJECT_ID('dbo.Events', 'U') IS NOT NULL
    DROP TABLE dbo.Events;

CREATE TABLE dbo.Events (
    EventId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    VenueId UNIQUEIDENTIFIER NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX),
    StartDate DATETIME2 NOT NULL,
    EndDate DATETIME2 NOT NULL,
    
    -- Location can be a LocationId or free text
    LocationId UNIQUEIDENTIFIER NULL, -- Reference to Locations table
    LocationText NVARCHAR(200), -- Free text location if not using LocationId
    
    CategoryId UNIQUEIDENTIFIER NOT NULL,
    PriorityId UNIQUEIDENTIFIER NOT NULL,
    
    -- Additional fields for future features
    IsRecurring BIT DEFAULT 0,
    RecurrencePattern NVARCHAR(500), -- JSON for recurrence rules
    IsAllDay BIT DEFAULT 0,
    
    -- Audit fields
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedBy NVARCHAR(100),
    
    -- Foreign key constraints
    CONSTRAINT FK_Events_Venues FOREIGN KEY (VenueId) REFERENCES dbo.Venues(VenueId) ON DELETE CASCADE,
    CONSTRAINT FK_Events_Locations FOREIGN KEY (LocationId) REFERENCES dbo.Locations(LocationId),
    CONSTRAINT FK_Events_Categories FOREIGN KEY (CategoryId) REFERENCES dbo.Categories(CategoryId),
    CONSTRAINT FK_Events_Priorities FOREIGN KEY (PriorityId) REFERENCES dbo.Priorities(PriorityId),
    
    -- Check constraints
    CONSTRAINT CK_Events_DateRange CHECK (EndDate > StartDate)
);

-- Create indexes for optimal query performance
CREATE NONCLUSTERED INDEX IX_Events_VenueId ON dbo.Events (VenueId);
CREATE NONCLUSTERED INDEX IX_Events_StartDate ON dbo.Events (StartDate);
CREATE NONCLUSTERED INDEX IX_Events_EndDate ON dbo.Events (EndDate);
CREATE NONCLUSTERED INDEX IX_Events_CategoryId ON dbo.Events (CategoryId);
CREATE NONCLUSTERED INDEX IX_Events_PriorityId ON dbo.Events (PriorityId);
CREATE NONCLUSTERED INDEX IX_Events_LocationId ON dbo.Events (LocationId);

-- Composite index for date range queries
CREATE NONCLUSTERED INDEX IX_Events_VenueId_DateRange ON dbo.Events (VenueId, StartDate, EndDate);

PRINT 'Created table: Events';

-- ==================================================
-- EVENT ATTENDEES TABLE
-- ==================================================
IF OBJECT_ID('dbo.EventAttendees', 'U') IS NOT NULL
    DROP TABLE dbo.EventAttendees;

CREATE TABLE dbo.EventAttendees (
    AttendeeId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EventId UNIQUEIDENTIFIER NOT NULL,
    AttendeeName NVARCHAR(200) NOT NULL,
    AttendeeEmail NVARCHAR(200),
    AttendeePhone NVARCHAR(20),
    ResponseStatus NVARCHAR(20) DEFAULT 'Pending', -- 'Pending', 'Accepted', 'Declined', 'Tentative'
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    -- Foreign key constraint
    CONSTRAINT FK_EventAttendees_Events FOREIGN KEY (EventId) REFERENCES dbo.Events(EventId) ON DELETE CASCADE
);

-- Create indexes
CREATE NONCLUSTERED INDEX IX_EventAttendees_EventId ON dbo.EventAttendees (EventId);

PRINT 'Created table: EventAttendees';

PRINT '';
PRINT 'Database schema created successfully!';
PRINT 'Next: Run 04_insert_default_data.sql to populate default categories and priorities';
GO
