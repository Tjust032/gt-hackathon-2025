// Quick test to verify database connection
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'medicus',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
});

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...');
    console.log(`   Host: ${process.env.POSTGRES_HOST || 'localhost'}`);
    console.log(`   Port: ${process.env.POSTGRES_PORT || '5432'}`);
    console.log(`   Database: ${process.env.POSTGRES_DB || 'medicus'}`);
    console.log(`   User: ${process.env.POSTGRES_USER || 'postgres'}`);
    console.log('');

    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL!');

    // Check tables
    const tablesResult = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

    console.log('');
    console.log('📊 Tables found:');
    tablesResult.rows.forEach((row) => {
      console.log(`   - ${row.tablename}`);
    });

    // Check extensions
    const extensionsResult = await client.query(`
      SELECT extname FROM pg_extension WHERE extname = 'vector';
    `);

    console.log('');
    if (extensionsResult.rows.length > 0) {
      console.log('✅ pgvector extension is installed');
    } else {
      console.log('⚠️  pgvector extension is NOT installed');
    }

    // Count records
    const listingsCount = await client.query('SELECT COUNT(*) FROM listings');
    const documentsCount = await client.query('SELECT COUNT(*) FROM documents');

    console.log('');
    console.log('📈 Record counts:');
    console.log(`   Listings: ${listingsCount.rows[0].count}`);
    console.log(`   Documents: ${documentsCount.rows[0].count}`);

    client.release();
    await pool.end();

    console.log('');
    console.log('✅ All checks passed!');
  } catch (error) {
    console.error('');
    console.error('❌ Error:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Make sure Docker is running: docker-compose ps');
    console.error('2. Make sure .env file exists with database credentials');
    console.error('3. Try: docker-compose down && docker-compose up -d');
    process.exit(1);
  }
}

testConnection();


