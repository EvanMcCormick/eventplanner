// scripts/db.js
// Helper to connect to SQL Server using settings from .env

import 'dotenv/config';
import sql from 'mssql';

let pool;

function getSqlConfig() {
  return {
    server: process.env.SQL_SERVER,
    database: process.env.SQL_DATABASE,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    options: {
      encrypt: process.env.SQL_ENCRYPT === 'true',
      trustServerCertificate: process.env.SQL_TRUST_CERT === 'true',
      instanceName: process.env.SQL_INSTANCE
    }
  };
}

export async function getPool() {
  if (pool) return pool;
  pool = await sql.connect(getSqlConfig());
  return pool;
}

export async function getVenues() {
  const p = await getPool();
  const result = await p.request().query('SELECT VenueId, VenueName, VenueCode FROM dbo.Venues');
  return result.recordset;
}

export async function getVenueConfigurationByCode(venueCode = 'DEMO') {
  const p = await getPool();
  const result = await p.request()
    .input('VenueCode', sql.NVarChar(20), venueCode)
    .execute('dbo.sp_GetVenueConfiguration');
  return result.recordset;
}

export async function closePool() {
  await sql.close();
  pool = undefined;
}