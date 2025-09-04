# Event Planner SQL Server Database Setup

This folder contains all the SQL scripts needed to set up a Microsoft SQL Server database for the Event Planner application. These scripts are designed for easy deployment to new client environments.

## 📋 Prerequisites

- Microsoft SQL Server 2016 or later
- SQL Server Management Studio (SSMS) or command-line access
- Administrator/sysadmin privileges on the SQL Server instance
- Network access to the SQL Server instance

## 🚀 Quick Setup (Recommended)

For a complete fresh installation, use the master setup script:

1. Open SQL Server Management Studio
2. Connect as an administrator (sysadmin role required)
3. Open and execute `00_complete_setup.sql`
4. Check the output messages for any errors
5. Note the connection string provided at the end

## 📁 Script Files Overview

| Script | Purpose | Run Order |
|--------|---------|-----------|
| `00_complete_setup.sql` | **Master script** - Runs everything in one go | First (All-in-one) |
| `01_create_database.sql` | Creates the EventPlannerDB database | 1 |
| `02_create_user.sql` | Creates EventPlannerApp login and user | 2 |
| `03_create_tables.sql` | Creates all database tables and indexes | 3 |
| `04_insert_default_data.sql` | Inserts default categories, priorities, and sample data | 4 |
| `05_create_procedures.sql` | Creates stored procedures for the application | 5 |
| `99_cleanup.sql` | Removes everything (for uninstall) | When needed |

## 🔧 Manual Step-by-Step Setup

If you prefer to run scripts individually:

```sql
-- Step 1: Create Database
-- Execute: 01_create_database.sql

-- Step 2: Create User and Permissions
-- Execute: 02_create_user.sql

-- Step 3: Create Tables and Indexes
-- Execute: 03_create_tables.sql

-- Step 4: Insert Default Data
-- Execute: 04_insert_default_data.sql

-- Step 5: Create Stored Procedures
-- Execute: 05_create_procedures.sql
```

## 🏢 Multi-Tenant Architecture

The database is designed to support multiple venues/clients:

### Venues Table
- Each client gets a unique `VenueId`
- Short `VenueCode` for easy identification (e.g., "HOTEL1", "CENTER2")
- Contact information and settings per venue

### Configuration System
- Each venue has its own branding and settings
- Custom categories, priorities, and locations per venue
- Default system-wide categories and priorities available to all

### Data Isolation
- All events are tied to a specific venue
- Users can only access data for their assigned venue
- Complete data separation between clients

## 🔐 Security Configuration

### Application User
- **Username**: `EventPlannerApp`
- **Password**: `EventPlanner2025!` (change for production)
- **Permissions**: Limited to necessary operations only
  - `db_datareader` and `db_datawriter` roles
  - Execute permissions on stored procedures
  - No administrative privileges

### Recommended Security Practices
1. **Change the default password** in `02_create_user.sql` before deployment
2. Use **SQL Server Authentication** or **Windows Authentication** as appropriate
3. **Encrypt connections** using TLS/SSL
4. **Backup the database** regularly
5. **Monitor access logs** for unusual activity

## 📊 Database Schema

### Core Tables
- **Venues**: Client/venue information
- **VenueConfigurations**: Settings and branding per venue
- **Events**: Main events storage
- **Categories**: Event categories (default + custom)
- **Priorities**: Event priorities (default + custom)
- **Locations**: Venue-specific rooms/areas
- **EventAttendees**: Attendee information per event

### Key Features
- **UUID Primary Keys**: For better distributed system support
- **Soft Deletes**: IsActive flags instead of hard deletes
- **Audit Fields**: CreatedAt, UpdatedAt, CreatedBy, UpdatedBy
- **Optimized Indexes**: For fast queries on dates and venue data
- **Foreign Key Constraints**: Ensure data integrity

## 🔌 Connection String

After setup, use this connection string format:

```
Server=YOUR_SERVER_NAME;Database=EventPlannerDB;User Id=EventPlannerApp;Password=YOUR_PASSWORD;TrustServerCertificate=True;
```

Example for localhost:
```
Server=localhost;Database=EventPlannerDB;User Id=EventPlannerApp;Password=EventPlanner2025!;TrustServerCertificate=True;
```

## 🧪 Testing Setup

After running the setup scripts, you can test with the sample venue:

- **Venue Code**: `DEMO`
- **Venue Name**: Demo Convention Center
- **Features**: Pre-configured locations, categories, and priorities

## 📝 Stored Procedures

The following stored procedures are available for application use:

| Procedure | Purpose |
|-----------|---------|
| `sp_GetVenueConfiguration` | Get venue settings and branding |
| `sp_GetVenueCategories` | Get all categories for a venue |
| `sp_GetVenuePriorities` | Get all priorities for a venue |
| `sp_GetVenueLocations` | Get all locations for a venue |
| `sp_GetEventsForDateRange` | Get events within a date range |
| `sp_SaveEvent` | Create or update an event |
| `sp_DeleteEvent` | Delete an event |
| `sp_UpdateVenueConfiguration` | Update venue settings |

## 🗑️ Uninstalling

To completely remove the Event Planner database:

1. **BACKUP YOUR DATA** if needed
2. Edit `99_cleanup.sql` and uncomment the confirmation line
3. Execute the cleanup script
4. Verify all components are removed

⚠️ **WARNING**: The cleanup script permanently deletes all data!

## 🔄 Updating/Upgrading

For future schema updates:

1. Always backup the database first
2. Test updates on a copy of the production database
3. Use migration scripts that check for existing objects
4. Update the application configuration as needed

## 🆘 Troubleshooting

### Common Issues

**"Login failed for user 'EventPlannerApp'"**
- Verify the password in your connection string
- Check that the user was created successfully
- Ensure SQL Server Authentication is enabled

**"Database 'EventPlannerDB' does not exist"**
- Run `01_create_database.sql` first
- Check SQL Server instance name in connection string

**"Permission denied"**
- Verify you're running scripts as sysadmin
- Check that the EventPlannerApp user has correct permissions

**Connection timeout errors**
- Check network connectivity to SQL Server
- Verify SQL Server is running and accepting connections
- Check firewall settings

### Verification Queries

```sql
-- Check if database exists
SELECT name FROM sys.databases WHERE name = 'EventPlannerDB';

-- Check if user exists
SELECT name FROM sys.database_principals WHERE name = 'EventPlannerApp';

-- Check table count
SELECT COUNT(*) as TableCount FROM INFORMATION_SCHEMA.TABLES;

-- Check sample data
SELECT * FROM Venues WHERE VenueCode = 'DEMO';
```

## 📞 Support

For deployment assistance or customization:

1. Check the troubleshooting section above
2. Verify all prerequisites are met
3. Review error messages carefully
4. Test with the sample venue first

## 📄 License

These SQL scripts are part of the Event Planner application and follow the same licensing terms.
