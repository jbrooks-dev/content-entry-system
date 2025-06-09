import { neon } from '@neondatabase/serverless';

// Initialize the database connection
const sql = neon(process.env.DATABASE_URL!);

export { sql };

// Helper function to check if database is connected
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Note: For Neon serverless, use the sql template literal directly in your services
// Example: await sql`SELECT * FROM users WHERE id = ${userId}`
// Do not use executeQuery - it's not compatible with Neon's template literal syntax