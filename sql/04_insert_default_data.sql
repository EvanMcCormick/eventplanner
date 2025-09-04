/*
 * Event Planner Default Data Insertion Script
 * 
 * This script inserts default categories, priorities, and sample data
 * that will be available to all venues.
 * 
 * Run this script after creating the tables.
 */

USE EventPlannerDB;
GO

PRINT 'Inserting default data for Event Planner...';
PRINT '';

-- ==================================================
-- DEFAULT CATEGORIES
-- ==================================================
PRINT 'Inserting default categories...';

-- Clear existing default categories
DELETE FROM dbo.Categories WHERE IsDefault = 1;

INSERT INTO dbo.Categories (CategoryId, VenueId, CategoryCode, CategoryName, Color, Icon, IsActive, IsDefault, SortOrder)
VALUES
    (NEWID(), NULL, 'meeting', 'Meeting', '#3b82f6', '💼', 1, 1, 1),
    (NEWID(), NULL, 'personal', 'Personal', '#10b981', '👤', 1, 1, 2),
    (NEWID(), NULL, 'work', 'Work', '#f59e0b', '💻', 1, 1, 3),
    (NEWID(), NULL, 'social', 'Social', '#8b5cf6', '🎉', 1, 1, 4),
    (NEWID(), NULL, 'holiday', 'Holiday', '#ef4444', '🏖️', 1, 1, 5),
    (NEWID(), NULL, 'appointment', 'Appointment', '#06b6d4', '📅', 1, 1, 6),
    (NEWID(), NULL, 'training', 'Training', '#84cc16', '🎓', 1, 1, 7),
    (NEWID(), NULL, 'conference', 'Conference', '#6366f1', '🎤', 1, 1, 8),
    (NEWID(), NULL, 'workshop', 'Workshop', '#f97316', '🔨', 1, 1, 9),
    (NEWID(), NULL, 'other', 'Other', '#6b7280', '📋', 1, 1, 10);

PRINT 'Inserted ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + ' default categories.';

-- ==================================================
-- DEFAULT PRIORITIES
-- ==================================================
PRINT 'Inserting default priorities...';

-- Clear existing default priorities
DELETE FROM dbo.Priorities WHERE IsDefault = 1;

INSERT INTO dbo.Priorities (PriorityId, VenueId, PriorityCode, PriorityName, Color, Level, IsActive, IsDefault)
VALUES
    (NEWID(), NULL, 'low', 'Low', '#10b981', 2, 1, 1),
    (NEWID(), NULL, 'normal', 'Normal', '#6b7280', 5, 1, 1),
    (NEWID(), NULL, 'high', 'High', '#f59e0b', 7, 1, 1),
    (NEWID(), NULL, 'urgent', 'Urgent', '#ef4444', 9, 1, 1),
    (NEWID(), NULL, 'critical', 'Critical', '#dc2626', 10, 1, 1);

PRINT 'Inserted ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + ' default priorities.';

-- ==================================================
-- SAMPLE VENUE (Optional - for testing)
-- ==================================================
PRINT 'Creating sample venue for testing...';

DECLARE @SampleVenueId UNIQUEIDENTIFIER = NEWID();
DECLARE @ConfigId UNIQUEIDENTIFIER = NEWID();

-- Insert sample venue
INSERT INTO dbo.Venues (VenueId, VenueName, VenueCode, ContactEmail, ContactPhone, Address, Website)
VALUES (
    @SampleVenueId,
    'Demo Convention Center',
    'DEMO',
    'info@democenter.com',
    '(555) 123-4567',
    '123 Main Street, Demo City, DC 12345',
    'https://democenter.com'
);

-- Insert sample venue configuration
INSERT INTO dbo.VenueConfigurations (
    ConfigId,
    VenueId,
    CompanyName,
    Logo,
    Tagline,
    PrimaryColor,
    SecondaryColor,
    TimeFormat,
    DateFormat,
    FirstDayOfWeek,
    DefaultEventDuration,
    DefaultCategory,
    DefaultPriority,
    ShowAttendees,
    ShowLocation,
    ShowDescription,
    AllowRecurring,
    AllowFileAttachments
)
VALUES (
    @ConfigId,
    @SampleVenueId,
    'Demo Convention Center',
    '🏢',
    'Your premier event destination',
    '#1e40af',
    '#7c3aed',
    '12h',
    'MM/DD/YYYY',
    0,
    1.0,
    'meeting',
    'normal',
    1,
    1,
    1,
    0,
    0
);

-- Insert sample locations for the venue
INSERT INTO dbo.Locations (LocationId, VenueId, LocationCode, LocationName, Description, Capacity, Amenities)
VALUES
    (NEWID(), @SampleVenueId, 'grand-ballroom', 'Grand Ballroom', 'Main event space with stage and A/V equipment', 500, '["Stage", "Professional A/V", "Dance Floor", "Bar Service", "Catering Kitchen"]'),
    (NEWID(), @SampleVenueId, 'conference-room-a', 'Conference Room A', 'Executive boardroom with video conferencing', 12, '["Video Conferencing", "Whiteboard", "Conference Phone", "WiFi", "Coffee Service"]'),
    (NEWID(), @SampleVenueId, 'conference-room-b', 'Conference Room B', 'Medium meeting room with presentation setup', 25, '["Projector", "Screen", "WiFi", "Flip Charts", "Coffee Service"]'),
    (NEWID(), @SampleVenueId, 'breakout-room-1', 'Breakout Room 1', 'Small meeting space for team discussions', 8, '["Whiteboard", "WiFi", "Round Table"]'),
    (NEWID(), @SampleVenueId, 'breakout-room-2', 'Breakout Room 2', 'Small meeting space for team discussions', 8, '["Whiteboard", "WiFi", "Round Table"]'),
    (NEWID(), @SampleVenueId, 'outdoor-pavilion', 'Outdoor Pavilion', 'Covered outdoor space for social events', 100, '["Tables", "Chairs", "String Lights", "Weather Protection"]'),
    (NEWID(), @SampleVenueId, 'virtual-online', 'Virtual/Online', 'Online meeting or webinar space', NULL, '["Video Platform", "Recording", "Screen Sharing", "Chat"]');

PRINT 'Created sample venue: Demo Convention Center (Code: DEMO)';
PRINT 'Inserted ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + ' sample locations.';

-- Insert some custom categories for the sample venue
INSERT INTO dbo.Categories (CategoryId, VenueId, CategoryCode, CategoryName, Color, Icon, IsActive, IsDefault, SortOrder)
VALUES
    (NEWID(), @SampleVenueId, 'wedding', 'Wedding', '#ec4899', '💒', 1, 0, 1),
    (NEWID(), @SampleVenueId, 'corporate-event', 'Corporate Event', '#0ea5e9', '🏢', 1, 0, 2),
    (NEWID(), @SampleVenueId, 'fundraiser', 'Fundraiser', '#22c55e', '💚', 1, 0, 3);

PRINT 'Inserted custom categories for sample venue.';

-- Insert some custom priorities for the sample venue
INSERT INTO dbo.Priorities (PriorityId, VenueId, PriorityCode, PriorityName, Color, Level, IsActive, IsDefault)
VALUES
    (NEWID(), @SampleVenueId, 'vip', 'VIP Event', '#dc2626', 10, 1, 0),
    (NEWID(), @SampleVenueId, 'standard', 'Standard', '#3b82f6', 5, 1, 0);

PRINT 'Inserted custom priorities for sample venue.';

PRINT '';
PRINT '=== SETUP COMPLETE ===';
PRINT 'Default data has been inserted successfully!';
PRINT '';
PRINT 'Sample venue created:';
PRINT '  Name: Demo Convention Center';
PRINT '  Code: DEMO';
PRINT '  Email: info@democenter.com';
PRINT '';
PRINT 'You can now:';
PRINT '1. Connect your application using the EventPlannerApp user';
PRINT '2. Use venue code "DEMO" for testing';
PRINT '3. Create additional venues as needed';
PRINT '';
PRINT 'Next: Update your application to use SQL Server instead of localStorage';
GO
