// scripts/test-remote-sql.js
// Test connection to SQL Server and call a stored procedure

import { getVenues, getVenueConfigurationByCode, closePool } from './db.js';

async function main() {
  try {
    console.log('Testing connection to SQL Server...');
    const venues = await getVenues();
    console.log('Venues:', venues);

    const cfg = await getVenueConfigurationByCode('DEMO');
    console.log('sp_GetVenueConfiguration rows:', cfg.length);
    console.log('Config:', cfg[0]);
  } catch (err) {
    console.error('Connection/Test Error:', err);
  } finally {
    await closePool();
    console.log('Done.');
  }
}

main();